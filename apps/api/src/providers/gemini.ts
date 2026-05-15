import { BaseAdapter } from "./base-adapter.js";
import type { OpenAIChatRequest, ProviderNativeRequest } from "../types/openai.js";
import type { OpenAIChatResponse, OpenAIStreamChunk } from "../types/openai.js";

/**
 * Google Gemini adapter.
 *
 * Gemini's API is NOT OpenAI-compatible, so this adapter performs full
 * request/response transformation.
 *
 * Key differences from OpenAI:
 * - Uses `contents` array instead of `messages`.
 * - `maxOutputTokens` instead of `max_tokens`.
 * - Different endpoint structure (`/v1beta/models/{model}:generateContent`).
 * - Streaming uses Server-Sent Events with different event format.
 */
export class GeminiAdapter extends BaseAdapter {
  provider = "gemini";
  baseUrl = "https://generativelanguage.googleapis.com/v1beta";

  supportsModel(_model: string): boolean {
    return true;
  }

  estimateCost(_model: string, _inputTokens: number, _outputTokens: number): number {
    // TODO: look up actual Gemini pricing per model
    return 0;
  }

  override buildEndpoint(model: string, stream: boolean): string {
    const action = stream ? "streamGenerateContent" : "generateContent";
    return `${this.baseUrl}/models/${encodeURIComponent(model)}:${action}`;
  }

  override getHeaders(_apiKey: string): Record<string, string> {
    return {
      "Content-Type": "application/json",
    };
  }

  /**
   * Transform OpenAI ChatRequest → Gemini GenerateContentRequest.
   */
  override normalizeRequest(body: OpenAIChatRequest): ProviderNativeRequest {
    const contents = body.messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const generationConfig: Record<string, unknown> = {
      maxOutputTokens: body.max_tokens ?? 2048,
      temperature: body.temperature ?? 0.7,
      topP: body.top_p ?? 1,
    };

    if (body.stop !== undefined) {
      generationConfig.stopSequences =
        typeof body.stop === "string" ? [body.stop] : body.stop;
    }

    const geminiBody: Record<string, unknown> = {
      contents,
      generationConfig,
    };

    return geminiBody as ProviderNativeRequest;
  }

  /**
   * Transform Gemini non-streaming response → OpenAI ChatResponse.
   */
  override denormalizeResponse(response: unknown): OpenAIChatResponse {
    const r = response as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
          role?: string;
        };
        finishReason?: string;
      }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
      modelVersion?: string;
    };

    const candidate = r.candidates?.[0];
    const text = candidate?.content?.parts?.map((p) => p.text).join("") ?? "";
    const inputTokens = r.usageMetadata?.promptTokenCount ?? 0;
    const outputTokens = r.usageMetadata?.candidatesTokenCount ?? 0;

    return {
      id: `gemini-${Date.now()}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: r.modelVersion ?? "gemini-pro",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: text,
          },
          finish_reason: candidate?.finishReason ?? "stop",
        },
      ],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
    };
  }

  /**
   * Transform Gemini SSE chunk → OpenAI StreamChunk.
   */
  override denormalizeStreamChunk(chunk: string): OpenAIStreamChunk | null {
    const line = chunk.trim();
    if (!line.startsWith("data: ")) return null;

    const data = line.slice("data: ".length).trim();
    if (data === "[DONE]") return null;

    try {
      const parsed = JSON.parse(data) as {
        candidates?: Array<{
          content?: {
            parts?: Array<{ text?: string }>;
          };
          finishReason?: string;
        }>;
      };

      const candidate = parsed.candidates?.[0];
      const text = candidate?.content?.parts?.[0]?.text ?? "";
      const finishReason = candidate?.finishReason ?? null;

      if (!text && !finishReason) return null;

      return {
        id: `gemini-${Date.now()}`,
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "gemini-pro",
        choices: [
          {
            index: 0,
            delta: {
              content: text || undefined,
            },
            finish_reason: finishReason ? finishReason.toLowerCase() : null,
          },
        ],
      };
    } catch {
      return null;
    }
  }
}
