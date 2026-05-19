import { describe, it, expect } from "vitest";
import { AnthropicAdapter } from "./anthropic.js";
import type { OpenAIChatRequest } from "../types/openai.js";

describe("AnthropicAdapter", () => {
  const adapter = new AnthropicAdapter();

  it("has correct provider metadata", () => {
    expect(adapter.provider).toBe("anthropic");
    expect(adapter.baseUrl).toBe("https://api.anthropic.com/v1");
  });

  it("normalizeRequest extracts system messages to top-level field", () => {
    const body: OpenAIChatRequest = {
      model: "claude-3-opus",
      messages: [
        { role: "system", content: "You are helpful." },
        { role: "user", content: "Hello" },
      ],
      stream: false,
      max_tokens: 100,
    };

    const native = adapter.normalizeRequest(body) as {
      model: string;
      system: string;
      messages: Array<{ role: string; content: string }>;
      max_tokens: number;
    };

    expect(native.system).toBe("You are helpful.");
    expect(native.messages).toHaveLength(1);
    expect(native.messages[0]!.role).toBe("user");
    expect(native.max_tokens).toBe(100);
  });

  it("normalizeRequest defaults max_tokens when missing", () => {
    const body: OpenAIChatRequest = {
      model: "claude-3-opus",
      messages: [{ role: "user", content: "Hi" }],
      stream: false,
    };

    const native = adapter.normalizeRequest(body) as { max_tokens: number };
    expect(native.max_tokens).toBe(4096);
  });

  it("normalizeRequest includes optional params", () => {
    const body: OpenAIChatRequest = {
      model: "claude-3-opus",
      messages: [{ role: "user", content: "Hi" }],
      stream: false,
      temperature: 0.5,
      top_p: 0.9,
      stop: "STOP",
    };

    const native = adapter.normalizeRequest(body) as {
      temperature: number;
      top_p: number;
      stop_sequences: string[];
    };

    expect(native.temperature).toBe(0.5);
    expect(native.top_p).toBe(0.9);
    expect(native.stop_sequences).toEqual(["STOP"]);
  });

  it("denormalizeResponse transforms Anthropic response", () => {
    const anthropicResponse = {
      id: "msg_123",
      type: "message",
      role: "assistant",
      content: [{ type: "text", text: "Hello there" }],
      model: "claude-3-opus",
      usage: { input_tokens: 10, output_tokens: 5 },
      stop_reason: "end_turn",
    };

    const openai = adapter.denormalizeResponse(anthropicResponse);
    expect(openai.object).toBe("chat.completion");
    expect(openai.choices[0]!.message.content).toBe("Hello there");
    expect(openai.usage.prompt_tokens).toBe(10);
    expect(openai.usage.completion_tokens).toBe(5);
  });

  it("denormalizeStreamChunk handles content_block_delta", () => {
    const sse = 'event: content_block_delta\ndata: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Hello"}}';
    const chunk = adapter.denormalizeStreamChunk(sse);
    expect(chunk).not.toBeNull();
    expect(chunk!.choices[0]!.delta.content).toBe("Hello");
  });

  it("denormalizeStreamChunk returns null for message_stop", () => {
    const sse = 'event: message_stop\ndata: {"type":"message_stop"}';
    expect(adapter.denormalizeStreamChunk(sse)).toBeNull();
  });

  it("mapError includes Anthropic-specific message", () => {
    const error = adapter.mapError(429, {
      error: { message: "Rate limit exceeded", type: "rate_limit" },
    });
    expect(error.error.message).toBe("Rate limit exceeded");
    expect(error.error.type).toBe("rate_limit_error");
  });
});
