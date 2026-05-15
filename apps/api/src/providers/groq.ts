import { BaseAdapter } from "./base-adapter.js";

/**
 * Groq adapter.
 * Fully OpenAI-compatible — no overrides needed.
 */
export class GroqAdapter extends BaseAdapter {
  provider = "groq";
  baseUrl = "https://api.groq.com/openai/v1";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual Groq pricing per model
    return 0;
  }
}
