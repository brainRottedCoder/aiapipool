import { BaseAdapter } from "./base-adapter.js";

/**
 * OpenRouter adapter.
 * OpenAI-compatible body. Extra headers (HTTP-Referer, X-Title) are added
 * by the route handler at request time.
 */
export class OpenRouterAdapter extends BaseAdapter {
  provider = "openrouter";
  baseUrl = "https://openrouter.ai/api/v1";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual OpenRouter pricing per model
    return 0;
  }
}
