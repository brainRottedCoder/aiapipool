import type { z } from "zod";
import type { OpenAIChatRequestSchema, OpenAIChatResponseSchema, OpenAIStreamChunkSchema } from "./schemas.js";
export type OpenAIChatRequest = z.infer<typeof OpenAIChatRequestSchema>;
export type OpenAIChatResponse = z.infer<typeof OpenAIChatResponseSchema>;
export type OpenAIStreamChunk = z.infer<typeof OpenAIStreamChunkSchema>;
//# sourceMappingURL=types.d.ts.map