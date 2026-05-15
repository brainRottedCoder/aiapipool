import type { z } from "zod";
import {
  OpenAIChatRequestSchema,
  OpenAIChatResponseSchema,
  OpenAIStreamChunkSchema,
} from "@fluxai/shared";

export type OpenAIChatRequest = z.infer<typeof OpenAIChatRequestSchema>;
export type OpenAIChatResponse = z.infer<typeof OpenAIChatResponseSchema>;
export type OpenAIStreamChunk = z.infer<typeof OpenAIStreamChunkSchema>;

export type ProviderNativeRequest = unknown;
export type ProviderNativeResponse = unknown;
