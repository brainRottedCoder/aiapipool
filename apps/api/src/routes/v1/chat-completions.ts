import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { OpenAIChatRequestSchema } from "@fluxai/shared";
import { Readable } from "stream";
import { resolveModel, type ModelMapping } from "../../services/provider-mapper.js";
import {
  checkBalance,
  deductCredits,
  accumulateStreamingTokens,
  isBalanceDepleted,
} from "../../services/balance.js";
import { acquireKey, releaseKey, markKeyUnhealthy } from "../../services/key-pool.js";
import {
  isOpen as isCircuitOpen,
  recordFailure,
  recordSuccess,
} from "../../services/circuit-breaker.js";
import { getAdapter } from "../../providers/registry.js";
import { createStreamTransform } from "../../utils/streaming.js";
import { sendOpenAIError } from "../../utils/errors.js";
import { CONSTANTS } from "../../config/constants.js";
import { env } from "../../config/env.js";
import pino from "pino";

const logger = pino({ name: "chat-completions" });

/**
 * POST /v1/chat/completions
 *
 * Orchestrates the full chat-completion critical path:
 *  1. Zod validation
 *  2. Model resolution  → 404
 *  3. Balance check     → 402
 *  4. Key acquisition   → 503
 *  5. Circuit-breaker check → retry next key
 *  6. Upstream fetch (with AbortController timeout + client disconnect)
 *  7. Retry loop (max 3) on 5xx / 429 / timeout
 *  8. Non-streaming: denormalize → deduct → release → respond
 *  9. Streaming:    SSE via Transform stream, balance probe every 10 chunks
 */
export default async function chatCompletionRoutes(fastify: FastifyInstance) {
  fastify.post("/chat/completions", async (request: FastifyRequest, reply: FastifyReply) => {
    const startTime = Date.now();
    const requestId = request.id ?? crypto.randomUUID();
    const userId = request.locals?.user?.id ?? "";
    const apiKeyId = request.locals?.apiKey?.id ?? null;

    if (!userId) {
      return sendOpenAIError(
        reply,
        401,
        "Unauthorized",
        "authentication_error",
        null
      );
    }

    /* ── 1. Validate body ── */
    const parseResult = OpenAIChatRequestSchema.safeParse(request.body);
    if (!parseResult.success) {
      return sendOpenAIError(
        reply,
        400,
        `Invalid request body: ${parseResult.error.message}`,
        "invalid_request_error",
        null
      );
    }
    const body = parseResult.data;
    const isStreaming = body.stream ?? false;

    /* ── 2. Resolve model ── */
    const mapping: ModelMapping | null = await resolveModel(body.model);
    if (!mapping) {
      return sendOpenAIError(
        reply,
        404,
        `Model '${body.model ?? "unknown"}' not found`,
        "invalid_request_error",
        "model"
      );
    }

    /* ── 3. Balance check ── */
    const hasBalance = await checkBalance(userId);
    if (!hasBalance) {
      return sendOpenAIError(
        reply,
        402,
        "Insufficient balance",
        "insufficient_funds",
        null
      );
    }

    const adapter = getAdapter(mapping.provider);

    /* Rough input-token heuristic (4 chars ≈ 1 token) */
    const inputTokens = body.messages.reduce(
      (sum, m) => sum + Math.ceil(m.content.length / 4),
      0
    );

    /* ── Retry loop ── */
    const maxRetries = CONSTANTS.MAX_RETRIES;
    let lastErrorStatus = 0;
    let lastErrorMessage = "";

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      let key: { id: string; plaintextKey: string } | null = null;

      try {
        /* 4. Acquire key */
        const acquired = await acquireKey(mapping.provider);
        key = { id: acquired.id, plaintextKey: acquired.plaintextKey };

        /* 5. Circuit-breaker */
        const open = await isCircuitOpen(mapping.provider, key.id);
        if (open) {
          await releaseKey(key.id, 0).catch(() => {});
          if (attempt < maxRetries) {
            continue; // try next key immediately
          }
          return sendOpenAIError(
            reply,
            503,
            "Provider temporarily unavailable",
            "server_error",
            null
          );
        }

        /* 6. Build upstream request */
        const upstreamBody = { ...body, model: mapping.provider_model_id };
        const nativeRequest = adapter.normalizeRequest(upstreamBody);

        /* 7. Build URL + headers */
        let url = adapter.buildEndpoint(mapping.provider_model_id, isStreaming);
        const headers = adapter.getHeaders(key.plaintextKey);

        if (adapter.provider === "gemini") {
          const sep = url.includes("?") ? "&" : "?";
          url += `${sep}key=${encodeURIComponent(key.plaintextKey)}`;
        }

        if (adapter.provider === "openrouter") {
          if (env.PROVIDER_OPENROUTER_REFERER) {
            headers["HTTP-Referer"] = env.PROVIDER_OPENROUTER_REFERER;
          }
          if (env.PROVIDER_OPENROUTER_TITLE) {
            headers["X-Title"] = env.PROVIDER_OPENROUTER_TITLE;
          }
        }

        /* 8. Fetch upstream */
        const abortController = new AbortController();
        const timeoutMs = isStreaming
          ? CONSTANTS.STREAM_TIMEOUT_MS
          : CONSTANTS.NON_STREAM_TIMEOUT_MS;
        const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

        const onClientClose = () => abortController.abort();
        request.raw.on("close", onClientClose);

        let response: Response;
        try {
          response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(nativeRequest),
            signal: abortController.signal,
          });
        } finally {
          request.raw.removeListener("close", onClientClose);
          clearTimeout(timeoutId);
        }

        /* ── HTTP error handling (retryable vs non-retryable) ── */
        if (!response.ok) {
          const errorText = await response.text().catch(() => "{}");
          let errorBody: unknown;
          try {
            errorBody = JSON.parse(errorText);
          } catch {
            errorBody = { raw: errorText };
          }

          const status = response.status;
          const retryable = status === 429 || status >= 500;

          if (retryable) {
            await recordFailure(mapping.provider, key.id).catch(() => {});
            await markKeyUnhealthy(key.id, `Provider error: HTTP ${status}`).catch(() => {});
            await releaseKey(key.id, 0).catch(() => {});

            if (attempt < maxRetries) {
              const backoff = CONSTANTS.RETRY_BACKOFF_MS[attempt] ?? 5000;
              await new Promise((r) => setTimeout(r, backoff));
              continue;
            }

            lastErrorStatus = status;
            lastErrorMessage = `Provider error: HTTP ${status}`;
            const mapped = adapter.mapError(status, errorBody);
            return reply.status(status === 429 ? 429 : 502).send(mapped);
          } else {
            /* Non-retryable 4xx (except 429) */
            await releaseKey(key.id, 0).catch(() => {});
            const mapped = adapter.mapError(status, errorBody);
            return reply.status(status).send(mapped);
          }
        }

        /* ── Success path ── */
        await recordSuccess(mapping.provider, key.id).catch(() => {});
        const latencyMs = Date.now() - startTime;

        /* ═══════════════════════════════════════════════
           STREAMING
           ═══════════════════════════════════════════════ */
        if (isStreaming) {
          reply.hijack();
          reply.raw.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
          });

          let outputTokens = 0;
          let chunkCount = 0;
          let balanceDepleted = false;

          const transform = createStreamTransform(
            adapter,
            abortController,
            async (chunk: unknown) => {
              if (balanceDepleted) return;
              const c = chunk as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = c.choices?.[0]?.delta?.content ?? "";
              outputTokens += Math.ceil(content.length / 4);
              chunkCount++;

              /* Balance probe every 10 chunks */
              if (chunkCount % 10 === 0) {
                await accumulateStreamingTokens(requestId, Math.ceil(content.length / 4));
                const depleted = await isBalanceDepleted(userId).catch(() => false);
                if (depleted) {
                  balanceDepleted = true;
                  abortController.abort();
                }
              }
            }
          );

          const nodeStream = response.body
            ? Readable.fromWeb(response.body as ReadableStream)
            : null;
          if (!nodeStream) {
            throw new Error("No response body for streaming");
          }

          /* Pipe: upstream → transform (normalize) → reply.raw (client) */
          nodeStream.pipe(transform).pipe(reply.raw);

          /* Wait for completion or error */
          await new Promise<void>((resolve, reject) => {
            transform.on("finish", () => {
              if (!balanceDepleted && !reply.raw.writableEnded) {
                reply.raw.write("data: [DONE]\n\n");
              }
              if (!reply.raw.writableEnded) {
                reply.raw.end();
              }
              resolve();
            });
            transform.on("error", (err) => {
              if (!reply.raw.writableEnded) reply.raw.end();
              reject(err);
            });
            nodeStream.on("error", (err) => {
              if (!reply.raw.writableEnded) reply.raw.end();
              reject(err);
            });
          });

          /* Final billing */
          const totalCost = adapter.estimateCost(
            mapping.provider_model_id,
            inputTokens,
            outputTokens
          );

          const deductResult = await deductCredits(
            userId,
            requestId,
            inputTokens,
            outputTokens,
            mapping,
            {
              apiKeyId: apiKeyId ?? undefined,
              providerKeyId: key.id,
              provider: mapping.provider,
              model: body.model,
              latencyMs,
              status: "success",
            }
          );

          if ("error" in deductResult) {
            logger.warn(
              { userId, requestId },
              "Stream completed but balance insufficient for final charge"
            );
          }

          await releaseKey(key.id, totalCost).catch(() => {});
          return; /* streaming done */
        }

        /* ═══════════════════════════════════════════════
           NON-STREAMING
           ═══════════════════════════════════════════════ */
        const responseBody = (await response.json()) as unknown;
        const openAIResponse = adapter.denormalizeResponse(responseBody);

        const usage = openAIResponse.usage ?? {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        };
        const totalCost = adapter.estimateCost(
          mapping.provider_model_id,
          usage.prompt_tokens,
          usage.completion_tokens
        );

        const deductResult = await deductCredits(
          userId,
          requestId,
          usage.prompt_tokens,
          usage.completion_tokens,
          mapping,
          {
            apiKeyId: apiKeyId ?? undefined,
            providerKeyId: key.id,
            provider: mapping.provider,
            model: body.model,
            latencyMs,
            status: "success",
          }
        );

        if ("error" in deductResult) {
          await releaseKey(key.id, 0).catch(() => {});
          return sendOpenAIError(
            reply,
            402,
            deductResult.error,
            "insufficient_funds",
            null
          );
        }

        await releaseKey(key.id, totalCost).catch(() => {});
        return reply.send(openAIResponse);

        /* ── End of try for a single attempt ── */
      } catch (err) {
        /* Release key on any unexpected error */
        if (key) {
          await releaseKey(key.id, 0).catch(() => {});
        }

        const error = err instanceof Error ? err : new Error(String(err));

        /* No keys available → immediate 503 */
        if (error.message === "No available keys for provider") {
          return sendOpenAIError(
            reply,
            503,
            "Provider temporarily unavailable",
            "server_error",
            null
          );
        }

        /* Retryable: AbortError (timeout) or network failure */
        const isRetryable =
          error.name === "AbortError" ||
          error.message.includes("fetch failed") ||
          error.message.includes("ECONNREFUSED") ||
          error.message.includes("ETIMEDOUT") ||
          error.message.includes("network");

        if (isRetryable && attempt < maxRetries) {
          if (key) {
            await recordFailure(mapping.provider, key.id).catch(() => {});
            await markKeyUnhealthy(key.id, error.message).catch(() => {});
          }
          const backoff = CONSTANTS.RETRY_BACKOFF_MS[attempt] ?? 5000;
          await new Promise((r) => setTimeout(r, backoff));
          continue;
        }

        /* Non-retryable or max retries exceeded */
        logger.error({ err, requestId, attempt }, "Chat completion failed");

        if (error.name === "AbortError") {
          return sendOpenAIError(
            reply,
            504,
            "Upstream provider timeout",
            "server_error",
            null
          );
        }

        return sendOpenAIError(
          reply,
          500,
          "Internal server error",
          "server_error",
          null
        );
      }
    }

    /* Fallback if we somehow exit the loop without returning */
    if (lastErrorStatus > 0) {
      return sendOpenAIError(
        reply,
        lastErrorStatus >= 500 ? 502 : lastErrorStatus,
        lastErrorMessage,
        "server_error",
        null
      );
    }

    return sendOpenAIError(
      reply,
      500,
      "Request failed after retries",
      "server_error",
      null
    );
  });
}
