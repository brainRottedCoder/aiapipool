import { db } from "../db/client.js";
import { requestLogs } from "../db/schema.js";
import { gte, sql } from "drizzle-orm";
import { redis } from "../redis/client.js";
import pino from "pino";

const logger = pino({ name: "worker:analytics-aggregator" });

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Roll up per-user/per-model stats from recent request_logs into Redis.
 *
 * Stores JSON blobs under `analytics:{userId}:{model}:{timestamp}`
 * and a summary list under `analytics:latest`.
 */
export async function runAnalyticsAggregator(): Promise<void> {
  logger.info("Running analytics aggregator");

  const since = new Date(Date.now() - WINDOW_MS);

  const rows = await db
    .select({
      user_id: requestLogs.user_id,
      provider: requestLogs.provider,
      model: requestLogs.model,
      total_requests: sql<number>`COUNT(*)::int`,
      total_input_tokens: sql<number>`SUM(${requestLogs.tokens_input})::int`,
      total_output_tokens: sql<number>`SUM(${requestLogs.tokens_output})::int`,
      avg_latency_ms: sql<number>`ROUND(AVG(${requestLogs.latency_ms}))::int`,
      total_user_charge: sql<string>`SUM(${requestLogs.user_charge})`,
    })
    .from(requestLogs)
    .where(gte(requestLogs.created_at, since))
    .groupBy(requestLogs.user_id, requestLogs.provider, requestLogs.model);

  const timestamp = Date.now();
  const pipeline = redis.pipeline();

  for (const row of rows) {
    const key = `analytics:${row.user_id}:${row.model}:${timestamp}`;
    const data = JSON.stringify({
      user_id: row.user_id,
      provider: row.provider,
      model: row.model,
      total_requests: row.total_requests,
      total_input_tokens: row.total_input_tokens,
      total_output_tokens: row.total_output_tokens,
      avg_latency_ms: row.avg_latency_ms,
      total_user_charge: parseFloat(row.total_user_charge ?? "0"),
      window_start: since.toISOString(),
      window_end: new Date().toISOString(),
    });
    pipeline.setex(key, 3600, data); // 1 hour TTL
  }

  // Store a lightweight summary index for fast dashboard lookup
  const summary = rows.map((r) => ({
    user_id: r.user_id,
    model: r.model,
    total_requests: r.total_requests,
    total_tokens: (r.total_input_tokens ?? 0) + (r.total_output_tokens ?? 0),
  }));

  pipeline.setex("analytics:latest", 3600, JSON.stringify({ timestamp, summary }));

  await pipeline.exec();

  logger.info({ aggregatedRows: rows.length }, "Analytics aggregator completed");
}
