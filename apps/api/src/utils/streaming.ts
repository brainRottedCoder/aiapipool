import { Transform } from "stream";
import type { ProviderAdapter } from "../types/provider.js";

/**
 * Create a Node.js Transform stream that normalizes upstream SSE chunks
 * into OpenAI-compatible SSE format.
 *
 * 1. Buffers partial lines.
 * 2. For each complete `data: ...` line:
 *    a. If `data: [DONE]` → push `data: [DONE]\n\n`, end.
 *    b. Parse JSON payload.
 *    c. Call adapter.denormalizeStreamChunk(parsed).
 *    d. Call onChunk(normalized) for side effects (token tracking).
 *    e. Push `data: ${JSON.stringify(normalized)}\n\n`.
 * 3. If AbortController signals → destroy stream gracefully.
 */
export function createStreamTransform(
  adapter: ProviderAdapter,
  abortController: AbortController,
  onChunk: (chunk: unknown) => void
): Transform {
  let buffer = "";

  const transform = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      // Check abort signal
      if (abortController.signal.aborted) {
        callback();
        return;
      }

      buffer += chunk.toString("utf8");

      // Process complete lines
      let eolIndex: number;
      while ((eolIndex = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, eolIndex).trim();
        buffer = buffer.slice(eolIndex + 1);

        if (!line.startsWith("data: ")) continue;

        const data = line.slice("data: ".length).trim();

        if (data === "[DONE]") {
          this.push("data: [DONE]\n\n");
          callback();
          return;
        }

        try {
          // Pass the full SSE data line to the adapter (it expects "data: {...}" format)
          const normalized = adapter.denormalizeStreamChunk(`data: ${data}`);

          if (normalized) {
            onChunk(normalized);
            this.push(`data: ${JSON.stringify(normalized)}\n\n`);
          }
        } catch {
          // Malformed JSON — skip this chunk rather than crash the stream
          // In production, you might want to log this
        }
      }

      callback();
    },

    flush(callback) {
      // Process any remaining buffered data
      if (buffer.trim()) {
        const line = buffer.trim();
        if (line.startsWith("data: ")) {
          const data = line.slice("data: ".length).trim();
          if (data === "[DONE]") {
            this.push("data: [DONE]\n\n");
          } else {
            try {
              const normalized = adapter.denormalizeStreamChunk(`data: ${data}`);
              if (normalized) {
                onChunk(normalized);
                this.push(`data: ${JSON.stringify(normalized)}\n\n`);
              }
            } catch {
              // Skip malformed trailing data
            }
          }
        }
      }
      callback();
    },
  });

  // Graceful abort handling
  abortController.signal.addEventListener("abort", () => {
    transform.destroy();
  });

  return transform;
}
