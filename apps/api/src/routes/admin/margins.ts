import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { requestLogs } from "../../db/schema.js";
import { sql, gte } from "drizzle-orm";

export async function marginsRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { period?: string };
    const period = query.period ?? "daily";

    let dateTrunc;
    if (period === "weekly") {
      dateTrunc = sql`DATE_TRUNC('week', ${requestLogs.created_at})`;
    } else if (period === "monthly") {
      dateTrunc = sql`DATE_TRUNC('month', ${requestLogs.created_at})`;
    } else {
      dateTrunc = sql`DATE(${requestLogs.created_at})`;
    }

    const since = new Date();
    if (period === "weekly") since.setDate(since.getDate() - 90);
    else if (period === "monthly") since.setMonth(since.getMonth() - 12);
    else since.setDate(since.getDate() - 30);

    const rows = await db
      .select({
        period: dateTrunc.as("period"),
        provider: requestLogs.provider,
        model: requestLogs.model,
        total_upstream_cost: sql<number>`COALESCE(SUM(${requestLogs.upstream_cost}), 0)`.as("total_upstream_cost"),
        total_user_charges: sql<number>`COALESCE(SUM(${requestLogs.user_charge}), 0)`.as("total_user_charges"),
        total_margin: sql<number>`COALESCE(SUM(${requestLogs.margin}), 0)`.as("total_margin"),
        requests: sql<number>`COUNT(*)`.as("requests"),
      })
      .from(requestLogs)
      .where(gte(requestLogs.created_at, since))
      .groupBy(dateTrunc, requestLogs.provider, requestLogs.model)
      .orderBy(sql`period DESC`);

    return reply.status(200).send({ data: rows, period });
  });
}
