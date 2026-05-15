import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { modelMappings } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { sendOpenAIError } from "../../utils/errors.js";

export async function modelMappingsRoute(app: FastifyInstance): Promise<void> {
  // GET /admin/model-mappings
  app.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    const rows = await db.select().from(modelMappings).orderBy(modelMappings.created_at);
    return reply.status(200).send({ data: rows });
  });

  // POST /admin/model-mappings
  app.post("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as {
      model_alias: string;
      provider: string;
      provider_model_id: string;
      pricing_input?: number;
      pricing_output?: number;
      capabilities?: Record<string, unknown>;
    };

    if (!body.model_alias || !body.provider || !body.provider_model_id) {
      return sendOpenAIError(reply, 400, "Missing required fields", "missing_field", null);
    }

    const inserted = await db
      .insert(modelMappings)
      .values({
        model_alias: body.model_alias,
        provider: body.provider,
        provider_model_id: body.provider_model_id,
        pricing_input: body.pricing_input ? String(body.pricing_input) : undefined,
        pricing_output: body.pricing_output ? String(body.pricing_output) : undefined,
        capabilities: body.capabilities ?? {},
      })
      .returning({ id: modelMappings.id });

    return reply.status(201).send({ id: inserted[0]?.id });
  });

  // PATCH /admin/model-mappings/:id
  app.patch("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Partial<{
      provider_model_id: string;
      pricing_input: number;
      pricing_output: number;
      capabilities: Record<string, unknown>;
      status: "ACTIVE" | "INACTIVE";
    }>;

    const updateData: Record<string, unknown> = {};
    if (body.provider_model_id !== undefined) updateData.provider_model_id = body.provider_model_id;
    if (body.pricing_input !== undefined) updateData.pricing_input = String(body.pricing_input);
    if (body.pricing_output !== undefined) updateData.pricing_output = String(body.pricing_output);
    if (body.capabilities !== undefined) updateData.capabilities = body.capabilities;
    if (body.status !== undefined) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return sendOpenAIError(reply, 400, "No fields to update", "invalid_request", null);
    }

    const result = await db
      .update(modelMappings)
      .set(updateData)
      .where(eq(modelMappings.id, id))
      .returning({ id: modelMappings.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "Model mapping not found", "not_found", null);
    }

    return reply.status(200).send({ updated: true });
  });

  // DELETE /admin/model-mappings/:id
  app.delete("/:id", async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };

    const result = await db
      .delete(modelMappings)
      .where(eq(modelMappings.id, id))
      .returning({ id: modelMappings.id });

    if (result.length === 0) {
      return sendOpenAIError(reply, 404, "Model mapping not found", "not_found", null);
    }

    return reply.status(200).send({ deleted: true });
  });
}
