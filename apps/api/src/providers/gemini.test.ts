import { describe, it, expect } from "vitest";
import { GeminiAdapter } from "./gemini.js";
import type { OpenAIChatRequest } from "../types/openai.js";

describe("GeminiAdapter", () => {
  const adapter = new GeminiAdapter();

  it("has correct provider metadata", () => {
    expect(adapter.provider).toBe("gemini");
    expect(adapter.baseUrl).toBe("https://generativelanguage.googleapis.com/v1beta");
  });

  it("normalizeRequest transforms messages to contents", () => {
    const body: OpenAIChatRequest = {
      model: "gemini-pro",
      messages: [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ],
      stream: false,
    };

    const native = adapter.normalizeRequest(body) as {
      contents: Array<{ role: string; parts: Array<{ text: string }> }>;
      generationConfig: { maxOutputTokens: number };
    };

    expect(native.contents).toHaveLength(2);
    expect(native.contents[0]!.role).toBe("user");
    expect(native.contents[1]!.role).toBe("model");
    expect(native.contents[1]!.parts[0]!.text).toBe("Hi there");
    expect(native.generationConfig.maxOutputTokens).toBe(2048);
  });

  it("normalizeRequest includes stop sequences", () => {
    const body: OpenAIChatRequest = {
      model: "gemini-pro",
      messages: [{ role: "user", content: "Hi" }],
      stream: false,
      stop: ["STOP", "END"],
    };

    const native = adapter.normalizeRequest(body) as {
      generationConfig: { stopSequences: string[] };
    };

    expect(native.generationConfig.stopSequences).toEqual(["STOP", "END"]);
  });

  it("denormalizeResponse transforms Gemini response", () => {
    const geminiResponse = {
      candidates: [
        {
          content: {
            parts: [{ text: "Hello world" }],
            role: "model",
          },
          finishReason: "STOP",
        },
      ],
      usageMetadata: {
        promptTokenCount: 5,
        candidatesTokenCount: 3,
      },
      modelVersion: "gemini-1.5-pro",
    };

    const openai = adapter.denormalizeResponse(geminiResponse);
    expect(openai.object).toBe("chat.completion");
    expect(openai.choices[0]!.message.content).toBe("Hello world");
    expect(openai.usage.prompt_tokens).toBe(5);
    expect(openai.model).toBe("gemini-1.5-pro");
  });

  it("denormalizeStreamChunk parses Gemini SSE", () => {
    const sse = 'data: {"candidates":[{"content":{"parts":[{"text":"Hi"}]},"finishReason":""}]}';
    const chunk = adapter.denormalizeStreamChunk(sse);
    expect(chunk).not.toBeNull();
    expect(chunk!.choices[0]!.delta.content).toBe("Hi");
  });

  it("denormalizeStreamChunk returns null for [DONE]", () => {
    expect(adapter.denormalizeStreamChunk("data: [DONE]")).toBeNull();
  });
});
