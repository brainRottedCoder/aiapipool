import type {
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIStreamChunk,
  ProviderNativeRequest,
  ProviderNativeResponse,
} from "../types/openai.js";
import type { OpenAIError } from "../utils/errors.js";

export interface ProviderAdapter {
  provider: string;
  baseUrl: string;

  normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest;
  denormalizeResponse(response: ProviderNativeResponse): OpenAIChatResponse;
  denormalizeStreamChunk(chunk: string): OpenAIStreamChunk | null;
  mapError(statusCode: number, body: unknown): OpenAIError;
  supportsModel(model: string): boolean;
  estimateCost(model: string, inputTokens: number, outputTokens: number): number;

  /** Build the upstream API endpoint for chat completions */
  buildEndpoint(model: string, stream: boolean): string;

  /** Return request headers for the upstream API call */
  getHeaders(apiKey: string): Record<string, string>;
}
