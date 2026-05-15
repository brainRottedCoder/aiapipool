import type {
  OpenAIChatRequest,
  OpenAIChatResponse,
  OpenAIStreamChunk,
  ProviderNativeRequest,
  ProviderNativeResponse,
} from "../types/openai.js";
import type { OpenAIError } from "../utils/errors.js";
import type { ProviderAdapter } from "../types/provider.js";

/**
 * Abstract base adapter implementing shared pass-through logic for
 * OpenAI-compatible providers (OpenRouter, Together, Groq, OpenAI).
 *
 * Override only what differs per provider.
 */
export abstract class BaseAdapter implements ProviderAdapter {
  abstract provider: string;
  abstract baseUrl: string;

  /**
   * Default: OpenAI-compatible endpoint `/chat/completions`.
   */
  buildEndpoint(_model: string, _stream: boolean): string {
    return `${this.baseUrl}/chat/completions`;
  }

  /**
   * Default: OpenAI-compatible Bearer token header.
   */
  getHeaders(apiKey: string): Record<string, string> {
    return {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Default: pass-through (already OpenAI-compatible).
   */
  normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest {
    return body as ProviderNativeRequest;
  }

  /**
   * Default: pass-through (already OpenAI format).
   */
  denormalizeResponse(response: ProviderNativeResponse): OpenAIChatResponse {
    return response as OpenAIChatResponse;
  }

  /**
   * Default: parse SSE `data: {...}` lines and pass through.
   * Returns `null` for `data: [DONE]`.
   */
  denormalizeStreamChunk(chunk: string): OpenAIStreamChunk | null {
    const line = chunk.trim();
    if (!line.startsWith("data: ")) return null;

    const data = line.slice("data: ".length).trim();
    if (data === "[DONE]") return null;

    try {
      return JSON.parse(data) as OpenAIStreamChunk;
    } catch {
      return null;
    }
  }

  /**
   * Default: map common HTTP status codes to OpenAI error types.
   */
  mapError(statusCode: number, _body: unknown): OpenAIError {
    const type =
      statusCode === 429
        ? "rate_limit_error"
        : statusCode >= 500
          ? "server_error"
          : statusCode === 401
            ? "authentication_error"
            : "invalid_request_error";

    return {
      error: {
        message: `Provider error: HTTP ${statusCode}`,
        type,
        code: `provider_${statusCode}`,
        param: null,
      },
    };
  }

  /**
   * Override per provider to restrict supported model IDs.
   */
  abstract supportsModel(model: string): boolean;

  /**
   * Override per provider with actual pricing.
   */
  abstract estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): number;
}
