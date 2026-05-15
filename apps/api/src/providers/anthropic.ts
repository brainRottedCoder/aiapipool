import { BaseAdapter } from "./base-adapter.js";
import type { OpenAIChatRequest, ProviderNativeRequest } from "../types/openai.js";
import type { OpenAIChatResponse, OpenAIStreamChunk } from "../types/openai.js";
import type { OpenAIError } from "../utils/errors.js";

/**
 * Anthropic adapter.
 *
 * Anthropic's API is NOT OpenAI-compatible, so this adapter performs full
 * request/response transformation.
 *
 * Key differences from OpenAI:
 * - System prompt is a top-level `system` string, not part of `messages`.
 * - Messages use `role: "user" | "assistant"` only.
 * - `max_tokens` is REQUIRED.
 * - Auth header is `x-api-key` (not `Bearer`).
 * - Streaming chunks use `type: "content_block_delta"` with `delta.text`.
 */
export class AnthropicAdapter extends BaseAdapter {
  provider = "anthropic";
  baseUrl = "https://api.anthropic.com/v1";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual Anthropic pricing per model
    return 0;
  }

  override buildEndpoint(_model: string, _stream: boolean): string {
    return `${this.baseUrl}/messages`;
  }

  override getHeaders(apiKey: string): Record<string, string> {
    return {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    };
  }

  /**
   * Transform OpenAI ChatRequest → Anthropic MessagesRequest.
   *
   * - Extract system message(s) into top-level `system` field.
   * - Remove system messages from the messages array.
   * - Ensure `max_tokens` is present (required by Anthropic).
   */
  override normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest {
    const systemMessages = body.messages.filter((m) => m.role === "system");
    const nonSystemMessages = body.messages.filter((m) => m.role !== "system");

    const system = systemMessages.map((m) => m.content).join("\n\n");

    const anthropicBody: Record<string, unknown> = {
      model: body.model,
      messages: nonSystemMessages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: body.max_tokens ?? 4096,
      stream: body.stream ?? false,
    };

    if (system.length > 0) {
      anthropicBody.system = system;
    }

    if (body.temperature !== undefined) {
      anthropicBody.temperature = body.temperature;
    }
    if (body.top_p !== undefined) {
      anthropicBody.top_p = body.top_p;
    }
    if (body.stop !== undefined) {
      anthropicBody.stop_sequences =
        typeof body.stop === "string" ? [body.stop] : body.stop;
    }

    return anthropicBody as ProviderNativeRequest;
  }

  /**
   * Transform Anthropic non-streaming response → OpenAI ChatResponse.
   */
  override denormalizeResponse(response: unknown): OpenAIChatResponse {
    const r = response as {
      id: string;
      type: string;
      role: string;
      content: Array<{ type: string; text: string }>;
      model: string;
      usage?: {
        input_tokens?: number;
        output_tokens?: number;
      };
      stop_reason?: string | null;
    };

    const text = r.content.map((c) => c.text).join("");
    const inputTokens = r.usage?.input_tokens ?? 0;
    const outputTokens = r.usage?.output_tokens ?? 0;

    return {
      id: r.id,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: r.model,
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: text,
          },
          finish_reason: r.stop_reason ?? "stop",
        },
      ],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
    };
  }

  /**
   * Transform Anthropic SSE chunk → OpenAI StreamChunk.
   *
   * Anthropic streaming events:
   * - `event: content_block_delta`
   *   `data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"..."}}`
   */
  override denormalizeStreamChunk(chunk: string): OpenAIStreamChunk | null {
    const lines = chunk.split("\n").map((l) => l.trim());
    let eventType = "";
    let dataJson = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice("event: ".length).trim();
      } else if (line.startsWith("data: ")) {
        dataJson = line.slice("data: ".length).trim();
      }
    }

    if (!dataJson) return null;
    if (eventType === "message_stop") return null;

    try {
      const data = JSON.parse(dataJson) as {
        type?: string;
        delta?: { type?: string; text?: string };
        index?: number;
      };

      if (eventType === "content_block_delta" && data.delta?.text) {
        return {
          id: `anthropic-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: "", // Filled by caller if needed
          choices: [
            {
              index: data.index ?? 0,
              delta: {
                content: data.delta.text,
              },
              finish_reason: null,
            },
          ],
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  override mapError(statusCode: number, body: unknown): OpenAIError {
    const b = body as { error?: { message?: string; type?: string } } | undefined;
    const message = b?.error?.message ?? `Anthropic error: HTTP ${statusCode}`;

    const type =
      statusCode === 429
        ? "rate_limit_error"
        : statusCode === 401
          ? "authentication_error"
          : statusCode >= 500
            ? "server_error"
            : "invalid_request_error";

    return {
      error: {
        message,
        type,
        code: `anthropic_${statusCode}`,
        param: null,
      },
    };
  }
}
