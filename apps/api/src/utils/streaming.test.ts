import { describe, it, expect } from "vitest";
import { Transform, Readable } from "stream";
import { createStreamTransform } from "../utils/streaming.js";
import { OpenAIAdapter } from "../providers/openai.js";

function streamToPromise(transform: Transform): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const outputs: string[] = [];
    transform.on("data", (data: Buffer) => {
      outputs.push(data.toString("utf8"));
    });
    transform.on("end", () => resolve(outputs));
    transform.on("error", reject);
    transform.on("close", () => resolve(outputs));
  });
}

describe("streaming", () => {
  const adapter = new OpenAIAdapter();

  it("transforms SSE chunks through adapter", async () => {
    const abortController = new AbortController();
    const chunks: unknown[] = [];

    const transform = createStreamTransform(
      adapter,
      abortController,
      (chunk) => {
        chunks.push(chunk);
      }
    );

    const readable = Readable.from([
      'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
      'data: {"id":"2","object":"chat.completion.chunk","created":2,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":" world"},"finish_reason":null}]}\n\n',
      "data: [DONE]\n\n",
    ]);

    const promise = streamToPromise(transform);
    readable.pipe(transform);

    const outputs = await promise;

    expect(chunks).toHaveLength(2);
    expect(outputs[0]).toContain("Hello");
    expect(outputs[1]).toContain(" world");
    expect(outputs[outputs.length - 1]).toContain("[DONE]");
  });

  it("handles abort signal gracefully", async () => {
    const abortController = new AbortController();
    const chunks: unknown[] = [];

    const transform = createStreamTransform(
      adapter,
      abortController,
      (chunk) => {
        chunks.push(chunk);
      }
    );

    const readable = Readable.from([
      'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}\n\n',
    ]);

    readable.pipe(transform);

    // Abort after a short delay
    setTimeout(() => {
      abortController.abort();
    }, 50);

    // Wait for close event
    await new Promise<void>((resolve) => {
      transform.on("close", () => resolve());
    });

    // Stream should close without error
    expect(transform.destroyed).toBe(true);
  });

  it("skips malformed JSON chunks", async () => {
    const abortController = new AbortController();
    const chunks: unknown[] = [];

    const transform = createStreamTransform(
      adapter,
      abortController,
      (chunk) => {
        chunks.push(chunk);
      }
    );

    const readable = Readable.from([
      'data: {invalid json}\n\n',
      'data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"OK"},"finish_reason":null}]}\n\n',
      "data: [DONE]\n\n",
    ]);

    const promise = streamToPromise(transform);
    readable.pipe(transform);

    await promise;

    expect(chunks).toHaveLength(1);
    expect(chunks[0]).toMatchObject({
      choices: [{ delta: { content: "OK" } }],
    });
  });
});
