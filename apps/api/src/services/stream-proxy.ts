import type { ProviderAdapter } from "../types/provider.js";

export interface StreamProxyContext {
  abortController: AbortController;
  onChunk: (chunkText: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

/**
 * Proxy an upstream SSE stream to the client.
 *
 * - Uses AbortController for cancellation.
 * - Applies adapter.denormalizeStreamChunk() to each SSE line.
 * - Calls onChunk() for every valid chunk for token tracking.
 * - Calls onComplete() when [DONE] is reached.
 * - Calls onError() on parse or upstream errors.
 */
export async function proxyStream(
  upstreamResponse: Response,
  adapter: ProviderAdapter,
  ctx: StreamProxyContext
): Promise<void> {
  const reader = upstreamResponse.body?.getReader();
  if (!reader) {
    ctx.onError(new Error("Upstream response has no readable body"));
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (!ctx.abortController.signal.aborted) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines
      let eolIndex: number;
      while ((eolIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, eolIndex).trim();
        buffer = buffer.slice(eolIndex + 1);

        if (!line.startsWith("data: ")) continue;

        const data = line.slice("data: ".length).trim();

        if (data === "[DONE]") {
          ctx.onComplete();
          return;
        }

        // Normalize chunk through adapter
        const normalized = adapter.denormalizeStreamChunk(data);
        if (normalized) {
          const chunkText = normalized.choices[0]?.delta?.content ?? "";
          ctx.onChunk(chunkText);
        }
      }
    }

    // Process any remaining data in buffer
    if (buffer.trim().startsWith("data: ")) {
      const data = buffer.trim().slice("data: ".length).trim();
      if (data === "[DONE]") {
        ctx.onComplete();
      } else {
        const normalized = adapter.denormalizeStreamChunk(data);
        if (normalized) {
          const chunkText = normalized.choices[0]?.delta?.content ?? "";
          ctx.onChunk(chunkText);
        }
        ctx.onComplete();
      }
    } else {
      ctx.onComplete();
    }
  } catch (err) {
    if (ctx.abortController.signal.aborted) {
      // Normal abort — don't treat as error
      ctx.onComplete();
      return;
    }
    ctx.onError(err instanceof Error ? err : new Error(String(err)));
  } finally {
    reader.releaseLock();
  }
}
