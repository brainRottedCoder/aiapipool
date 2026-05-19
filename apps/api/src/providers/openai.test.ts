import { describe, it, expect } from "vitest";
import { OpenAIAdapter } from "./openai.js";
import type { OpenAIChatRequest } from "../types/openai.js";

describe("OpenAIAdapter", () => {
  const adapter = new OpenAIAdapter();

  it("has correct provider metadata", () => {
    expect(adapter.provider).toBe("openai");
    expect(adapter.baseUrl).toBe("https://api.openai.com/v1");
  });

  it("normalizeRequest is identity", () => {
    const body: OpenAIChatRequest = {
      model: "gpt-4o",
      messages: [{ role: "user", content: "Hello" }],
      stream: false,
    };
    expect(adapter.normalizeRequest(body)).toEqual(body);
  });

  it("denormalizeResponse is identity", () => {
    const response = {
      id: "chatcmpl-123",
      object: "chat.completion" as const,
      created: 1234567890,
      model: "gpt-4o",
      choices: [
        {
          index: 0,
          message: { role: "assistant" as const, content: "Hi" },
          finish_reason: "stop" as string | null,
        },
      ],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    };
    expect(adapter.denormalizeResponse(response)).toEqual(response);
  });

  it("denormalizeStreamChunk parses data: lines", () => {
    const chunk = `data: {"id":"1","object":"chat.completion.chunk","created":1,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"hi"},"finish_reason":null}]}\n\n`;
    const result = adapter.denormalizeStreamChunk(chunk);
    expect(result).not.toBeNull();
    expect(result?.choices[0]?.delta?.content).toBe("hi");
  });

  it("denormalizeStreamChunk returns null for [DONE]", () => {
    const result = adapter.denormalizeStreamChunk("data: [DONE]");
    expect(result).toBeNull();
  });

  it("mapError returns correct types", () => {
    expect(adapter.mapError(429, {}).error.type).toBe("rate_limit_error");
    expect(adapter.mapError(500, {}).error.type).toBe("server_error");
    expect(adapter.mapError(401, {}).error.type).toBe("authentication_error");
    expect(adapter.mapError(400, {}).error.type).toBe("invalid_request_error");
  });
});
