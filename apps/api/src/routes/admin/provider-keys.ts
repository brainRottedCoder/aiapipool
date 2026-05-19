import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { providerKeys } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";
import { encrypt } from "../../crypto/encryption.js";
import { env } from "../../config/env.js";
import { sendOpenAIError } from "../../utils/errors.js";

const MASTER_KEY = Buffer.from(env.MASTER_ENCRYPTION_KEY);

export async function providerKeysRoute(app: FastifyInstance): Promise<void> {
  // GET /admin/provider-keys — list all keys (masked)
  app.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    const rows = await db
      .select({
        id: providerKeys.id,
        provider: providerKeys.provider,
        initial_credits: providerKeys.initial_credits,
        remaining_credits: providerKeys.remaining_credits,
        status: providerKeys.status,
        is_emergency_reserve: providerKeys.is_emergency_reserve,
        last_used: providerKeys.last_used,
        created_at: providerKeys.created_at,
        archived_at: providerKeys.archived_at,
      })
      .from(providerKeys)
      .orderBy(desc(providerKeys.created_at));

    return reply.status(200).send({ data: rows });
  });

  // POST /admin/provider-keys — add new encrypted key
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      provider: string;
      api_key: string;
      initial_credits?: number;
      is_emergency_reserve?: boolean;
    };

    if (!body.provider || !body.api_key) {
      return sendOpenAIError(reply, 400, "Missing provider or api_key", "missing_field", null);
    }

    const encrypted = encrypt(body.api_key, MASTER_KEY);

    const inserted = await db
      .insert(providerKeys)
      .values({
        provider: body.provider,
        api_key_encrypted: encrypted,
        initial_credits: String(body.initial_credits ?? 0),
        remaining_credits: String(body.initial_credits ?? 0),
        is_emergency_reserve: body.is_emergency_reserve ?? false,
      })
      .returning({ id: providerKeys.id });

    return reply.status(201).send({ id: inserted[0]?.id });
  });

  // PATCH /admin/provider-keys/:id/rotate — archive old, provision new
  app.patch("/:id/rotate", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { api_key: string };

    if (!body.api_key) {
      return sendOpenAIError(reply, 400, "Missing api_key for rotation", "missing_field", null);
    }

    const encrypted = encrypt(body.api_key, MASTER_KEY);

    await db.transaction(async (trx) => {
      // Archive old key
      await trx
        .update(providerKeys)
        .set({ status: "ROTATING", archived_at: new Date() })
        .where(eq(providerKeys.id, id));

      // Insert new key (same provider, fresh credits)
      const old = await trx
        .select({ provider: providerKeys.provider, initial_credits: providerKeys.initial_credits, is_emergency_reserve: providerKeys.is_emergency_reserve })
        .from(providerKeys)
        .where(eq(providerKeys.id, id))
        .limit(1);

      const firstOld = old[0];
      if (firstOld) {
        await trx.insert(providerKeys).values({
          provider: firstOld.provider,
          api_key_encrypted: encrypted,
          initial_credits: firstOld.initial_credits,
          remaining_credits: firstOld.initial_credits,
          is_emergency_reserve: firstOld.is_emergency_reserve ?? false,
        });
      }
    });

    return reply.status(200).send({ rotated: true });
  });

  // PATCH /admin/provider-keys/:id/status — set status
  app.patch("/:id/status", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status: "ACTIVE" | "EXHAUSTED" | "ERROR" | "ROTATING" };

    if (!body.status) {
      return sendOpenAIError(reply, 400, "Missing status", "missing_field", null);
    }

    const result = await db
      .update(providerKeys)
      .set({ status: body.status, archived_at: body.status === "EXHAUSTED" || body.status === "ROTATING" ? new Date() : undefined })
      .where(eq(providerKeys.id, id))
      .returning({ id: providerKeys.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "Provider key not found", "not_found", null);
    }

    return reply.status(200).send({ updated: true });
  });

  // DELETE /admin/provider-keys/:id — soft delete (archive)
  app.delete("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .update(providerKeys)
      .set({ status: "ROTATING", archived_at: new Date() })
      .where(eq(providerKeys.id, id))
      .returning({ id: providerKeys.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "Provider key not found", "not_found", null);
    }

    return reply.status(200).send({ deleted: true });
  });
}
