import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { apiKeys } from "../../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { hashApiKey } from "../../../crypto/hmac.js";
import { generateApiKey } from "../../../utils/id.js";
import { env } from "../../../config/env.js";

export async function apiKeysRoute(app: FastifyInstance): Promise<void> {
  // GET /api/user/api-keys — list keys (masked)
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const rows = await db
      .select({
        id: apiKeys.id,
        key_prefix: apiKeys.key_prefix,
        name: apiKeys.name,
        rate_limit_rpm: apiKeys.rate_limit_rpm,
        rate_limit_tokens_day: apiKeys.rate_limit_tokens_day,
        status: apiKeys.status,
        created_at: apiKeys.created_at,
      })
      .from(apiKeys)
      .where(eq(apiKeys.userId, user.id))
      .orderBy(apiKeys.created_at);

    return reply.status(200).send({ data: rows });
  });

  // POST /api/user/api-keys — create new key
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const body = request.body as { name?: string; rate_limit_rpm?: number; rate_limit_tokens_day?: number };

    const rawKey = generateApiKey();
    const hashedKey = hashApiKey(rawKey, env.API_KEY_PEPPER);
    const keyPrefix = rawKey.slice(0, 12);

    const inserted = await db
      .insert(apiKeys)
      .values({
        userId: user.id,
        hashed_key: hashedKey,
        key_prefix: keyPrefix,
        name: body.name ?? "API Key",
        rate_limit_rpm: body.rate_limit_rpm ?? env.DEFAULT_RPM,
        rate_limit_tokens_day: body.rate_limit_tokens_day ?? env.DEFAULT_TOKENS_PER_DAY,
      })
      .returning({ id: apiKeys.id });

    return reply.status(201).send({
      id: inserted[0]?.id,
      key: rawKey, // shown ONCE only
      key_prefix: keyPrefix,
      name: body.name ?? "API Key",
      rate_limit_rpm: body.rate_limit_rpm ?? env.DEFAULT_RPM,
      rate_limit_tokens_day: body.rate_limit_tokens_day ?? env.DEFAULT_TOKENS_PER_DAY,
    });
  });

  // DELETE /api/user/api-keys/:id — revoke key
  app.delete("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const { id } = request.params as { id: string };

    const result = await db
      .update(apiKeys)
      .set({ status: "revoked" })
      .where(and(eq(apiKeys.id, id), eq(apiKeys.userId, user.id)))
      .returning({ id: apiKeys.id });

    if (result.length === 0) {
      return reply.status(404).send({
        error: { message: "API key not found", type: "not_found_error", code: "api_key_not_found", param: null },
      });
    }

    return reply.status(200).send({ revoked: true });
  });
}
