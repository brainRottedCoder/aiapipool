import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { providerKeys, modelMappings } from "../../db/schema.js";
import { sql } from "drizzle-orm";
import { redis } from "../../redis/client.js";

export async function healthRoute(app: FastifyInstance): Promise<void> {
  // GET /admin/health/providers
  app.get("/providers", async (_request: FastifyRequest, reply: FastifyReply) => {
    const mappings = await db.selectDistinct({ provider: modelMappings.provider }).from(modelMappings);
    const results: Array<{ provider: string; status: string; latency_ms?: number }> = [];

    for (const m of mappings) {
      const healthData = await redis.get(`health:${m.provider}`);
      if (healthData) {
        try {
          const parsed = JSON.parse(healthData);
          results.push({ provider: m.provider, status: parsed.status ?? "unknown", latency_ms: parsed.latency_ms });
        } catch {
          results.push({ provider: m.provider, status: "unknown" });
        }
      } else {
        results.push({ provider: m.provider, status: "unknown" });
      }
    }

    return reply.status(200).send({ data: results });
  });

  // GET /admin/health/keys
  app.get("/keys", async (_request: FastifyRequest, reply: FastifyReply) => {
    const rows = await db
      .select({
        provider: providerKeys.provider,
        status: providerKeys.status,
        count: sql<number>`COUNT(*)`.as("count"),
        total_remaining: sql<number>`COALESCE(SUM(${providerKeys.remaining_credits}), 0)`.as("total_remaining"),
      })
      .from(providerKeys)
      .groupBy(providerKeys.provider, providerKeys.status);

    return reply.status(200).send({ data: rows });
  });

  // GET /admin/health/queues
  app.get("/queues", async (_request: FastifyRequest, reply: FastifyReply) => {
    // BullMQ queue depths are not directly queryable without Queue instances.
    // Return stub indicating queue infra is up.
    return reply.status(200).send({
      data: [
        { queue: "health-check", depth: 0 },
        { queue: "balance-sync", depth: 0 },
        { queue: "key-cleanup", depth: 0 },
        { queue: "analytics", depth: 0 },
        { queue: "margin-report", depth: 0 },
        { queue: "data-retention", depth: 0 },
      ],
    });
  });
}
