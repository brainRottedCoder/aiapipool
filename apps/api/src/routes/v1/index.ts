import type { FastifyInstance } from "fastify";
import { authenticateUser } from "../../middleware/auth.js";
import { rateLimiter } from "../../middleware/rate-limiter.js";
import chatCompletionRoutes from "./chat-completions.js";

/**
 * v1 API routes — inference API protected by API-key auth + rate limiting.
 *
 * Note on hook order:
 *   authenticateUser runs first to populate req.locals.user/apiKey.
 *   rateLimiter then uses the apiKey context for per-key limits.
 *   For unauthenticated requests, rateLimiter falls back to IP-based limits.
 */
export async function v1Routes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticateUser);
  app.addHook("preHandler", rateLimiter);

  await app.register(chatCompletionRoutes, { prefix: "" });
}
