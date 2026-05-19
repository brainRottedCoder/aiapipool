import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { providerKeys } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { sendOpenAIError } from "../../utils/errors.js";

export async function emergencyRoute(app: FastifyInstance): Promise<void> {
  // POST /admin/emergency/drain-provider
  app.post("/drain-provider", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { provider?: string };
    if (!body.provider) {
      return sendOpenAIError(reply, 400, "Missing provider", "missing_field", null);
    }

    const result = await db
      .update(providerKeys)
      .set({ status: "ROTATING" })
      .where(eq(providerKeys.provider, body.provider))
      .returning({ id: providerKeys.id });

    request.log.error(
      { provider: body.provider, count: result.length },
      "EMERGENCY: Drained all keys for provider"
    );

    return reply.status(200).send({ drained: true, count: result.length });
  });

  // POST /admin/emergency/rotate-all-keys
  app.post("/rotate-all-keys", async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await db
      .update(providerKeys)
      .set({ status: "ROTATING", archived_at: new Date() })
      .returning({ id: providerKeys.id });

    request.log.error(
      { count: result.length },
      "EMERGENCY: Force-rotated all provider keys"
    );

    return reply.status(200).send({ rotated: true, count: result.length });
  });
}
