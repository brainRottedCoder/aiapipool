import { BaseAdapter } from "./base-adapter.js";

/**
 * Together AI adapter.
 * Fully OpenAI-compatible — no overrides needed.
 */
export class TogetherAdapter extends BaseAdapter {
  provider = "together";
  baseUrl = "https://api.together.xyz/v1";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual Together AI pricing per model
    return 0;
  }
}
