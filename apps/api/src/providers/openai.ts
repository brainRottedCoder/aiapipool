import { BaseAdapter } from "./base-adapter.js";

/**
 * OpenAI adapter.
 * Native OpenAI format — no overrides needed.
 */
export class OpenAIAdapter extends BaseAdapter {
  provider = "openai";
  baseUrl = "https://api.openai.com/v1";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual OpenAI pricing per model
    return 0;
  }
}
