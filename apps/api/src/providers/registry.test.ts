import { describe, it, expect } from "vitest";
import { getAdapter } from "./registry.js";
import { OpenRouterAdapter } from "./openrouter.js";
import { TogetherAdapter } from "./together.js";
import { GroqAdapter } from "./groq.js";
import { OpenAIAdapter } from "./openai.js";
import { AnthropicAdapter } from "./anthropic.js";
import { GeminiAdapter } from "./gemini.js";

describe("provider registry", () => {
  it("returns adapter for each registered provider", () => {
    expect(getAdapter("openrouter")).toBeInstanceOf(OpenRouterAdapter);
    expect(getAdapter("together")).toBeInstanceOf(TogetherAdapter);
    expect(getAdapter("groq")).toBeInstanceOf(GroqAdapter);
    expect(getAdapter("openai")).toBeInstanceOf(OpenAIAdapter);
    expect(getAdapter("anthropic")).toBeInstanceOf(AnthropicAdapter);
    expect(getAdapter("gemini")).toBeInstanceOf(GeminiAdapter);
  });

  it("throws for unknown provider", () => {
    expect(() => getAdapter("unknown")).toThrow(
      "No adapter registered for provider: unknown"
    );
  });
});
