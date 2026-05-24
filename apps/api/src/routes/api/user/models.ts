import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { modelMappings } from "../../../db/schema.js";
import { eq } from "drizzle-orm";

export async function modelsRoute(app: FastifyInstance): Promise<void> {
  // GET /api/user/models — list active model mappings for dashboard
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const rows = await db
      .select({
        id: modelMappings.id,
        model_alias: modelMappings.model_alias,
        provider: modelMappings.provider,
        provider_model_id: modelMappings.provider_model_id,
        pricing_input: modelMappings.pricing_input,
        pricing_output: modelMappings.pricing_output,
        capabilities: modelMappings.capabilities,
        status: modelMappings.status,
      })
      .from(modelMappings)
      .where(eq(modelMappings.status, "ACTIVE"))
      .orderBy(modelMappings.model_alias);

    return reply.status(200).send({ data: rows });
  });
}
