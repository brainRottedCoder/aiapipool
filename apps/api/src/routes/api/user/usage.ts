import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../../db/client.js";
import { requestLogs } from "../../../db/schema.js";
import { eq, sql, and } from "drizzle-orm";

export async function usageRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const query = request.query as { period?: string; model?: string };
    const period = query.period ?? "day";
    const modelFilter = query.model;

    const conditions = [eq(requestLogs.user_id, user.id)];
    if (modelFilter) {
      conditions.push(eq(requestLogs.model, modelFilter));
    }

    let groupByExpr;
    if (period === "month") {
      groupByExpr = sql`DATE_TRUNC('month', ${requestLogs.created_at})`;
    } else {
      groupByExpr = sql`DATE(${requestLogs.created_at})`;
    }

    const rows = await db
      .select({
        period: groupByExpr.as("period"),
        tokens_input: sql<number>`COALESCE(SUM(${requestLogs.tokens_input}), 0)`.as("tokens_input"),
        tokens_output: sql<number>`COALESCE(SUM(${requestLogs.tokens_output}), 0)`.as("tokens_output"),
        requests: sql<number>`COUNT(*)`.as("requests"),
        upstream_cost: sql<number>`COALESCE(SUM(${requestLogs.upstream_cost}), 0)`.as("upstream_cost"),
        user_charge: sql<number>`COALESCE(SUM(${requestLogs.user_charge}), 0)`.as("user_charge"),
      })
      .from(requestLogs)
      .where(and(...conditions))
      .groupBy(groupByExpr)
      .orderBy(sql`period DESC`);

    return reply.status(200).send({ data: rows });
  });

  app.get("/:requestId", async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.locals?.user;
    if (!user) {
      return reply.status(401).send({
        error: { message: "Unauthorized", type: "authentication_error", code: null, param: null },
      });
    }

    const { requestId } = request.params as { requestId: string };

    const rows = await db
      .select({
        id: requestLogs.id,
        provider: requestLogs.provider,
        model: requestLogs.model,
        tokens_input: requestLogs.tokens_input,
        tokens_output: requestLogs.tokens_output,
        upstream_cost: requestLogs.upstream_cost,
        user_charge: requestLogs.user_charge,
        margin: requestLogs.margin,
        latency_ms: requestLogs.latency_ms,
        status: requestLogs.status,
        created_at: requestLogs.created_at,
      })
      .from(requestLogs)
      .where(and(eq(requestLogs.id, requestId), eq(requestLogs.user_id, user.id)))
      .limit(1);

    if (rows.length === 0) {
      return reply.status(404).send({
        error: { message: "Request not found", type: "not_found_error", code: "request_not_found", param: null },
      });
    }

    return reply.status(200).send(rows[0]);
  });
}
