import type { ProviderAdapter } from "../types/provider.js";
import { OpenRouterAdapter } from "./openrouter.js";
import { TogetherAdapter } from "./together.js";
import { GroqAdapter } from "./groq.js";
import { OpenAIAdapter } from "./openai.js";
import { AnthropicAdapter } from "./anthropic.js";
import { GeminiAdapter } from "./gemini.js";

const registry: Map<string, ProviderAdapter> = new Map([
  ["openrouter", new OpenRouterAdapter()],
  ["together", new TogetherAdapter()],
  ["groq", new GroqAdapter()],
  ["openai", new OpenAIAdapter()],
  ["anthropic", new AnthropicAdapter()],
  ["gemini", new GeminiAdapter()],
]);

export function getAdapter(provider: string): ProviderAdapter {
  const adapter = registry.get(provider);
  if (!adapter) {
    throw new Error(`No adapter registered for provider: ${provider}`);
  }
  return adapter;
}
