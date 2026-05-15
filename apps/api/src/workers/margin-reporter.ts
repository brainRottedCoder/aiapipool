import { db } from "../db/client.js";
import { requestLogs } from "../db/schema.js";
import { gte, sql } from "drizzle-orm";
import { redis } from "../redis/client.js";
import pino from "pino";

const logger = pino({ name: "worker:margin-reporter" });

/**
 * Generate daily margin report from request_logs.
 *
 * Aggregates total_upstream_cost, total_user_charges, total_margin
 * grouped by provider and model. Stores the report in Redis.
 */
export async function runMarginReporter(): Promise<void> {
  logger.info("Running margin reporter");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await db
    .select({
      provider: requestLogs.provider,
      model: requestLogs.model,
      total_requests: sql<number>`COUNT(*)::int`,
      total_upstream_cost: sql<string>`SUM(${requestLogs.upstream_cost})`,
      total_user_charges: sql<string>`SUM(${requestLogs.user_charge})`,
      total_margin: sql<string>`SUM(${requestLogs.margin})`,
    })
    .from(requestLogs)
    .where(gte(requestLogs.created_at, today))
    .groupBy(requestLogs.provider, requestLogs.model);

  const dateKey = today.toISOString().slice(0, 10); // YYYY-MM-DD
  const report = {
    date: dateKey,
    generated_at: new Date().toISOString(),
    totals: {
      total_requests: rows.reduce((sum, r) => sum + (r.total_requests ?? 0), 0),
      total_upstream_cost: rows.reduce((sum, r) => sum + parseFloat(r.total_upstream_cost ?? "0"), 0),
      total_user_charges: rows.reduce((sum, r) => sum + parseFloat(r.total_user_charges ?? "0"), 0),
      total_margin: rows.reduce((sum, r) => sum + parseFloat(r.total_margin ?? "0"), 0),
    },
    breakdown: rows.map((r) => ({
      provider: r.provider,
      model: r.model,
      total_requests: r.total_requests,
      upstream_cost: parseFloat(r.total_upstream_cost ?? "0"),
      user_charges: parseFloat(r.total_user_charges ?? "0"),
      margin: parseFloat(r.total_margin ?? "0"),
    })),
  };

  await redis.setex(`margin:daily:${dateKey}`, 86400 * 30, JSON.stringify(report)); // 30-day TTL

  logger.info({ date: dateKey, rows: rows.length, totalMargin: report.totals.total_margin }, "Margin report generated");
}
