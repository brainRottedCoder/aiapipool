import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { users, requestLogs, providerKeys } from "../../db/schema.js";
import { sql, gte } from "drizzle-orm";

export async function overviewRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [userStats] = await db
      .select({
        total_users: sql<number>`count(*)::int`,
        active_users: sql<number>`count(*) filter (where ${users.status} = 'active')::int`,
        suspended_users: sql<number>`count(*) filter (where ${users.status} = 'suspended')::int`,
        total_balance: sql<string>`coalesce(sum(${users.balance}), 0)::text`,
      })
      .from(users);

    const [requestStats] = await db
      .select({
        requests_24h: sql<number>`count(*)::int`,
        errors_24h: sql<number>`count(*) filter (where ${requestLogs.status} != 'success')::int`,
        revenue_24h: sql<string>`coalesce(sum(${requestLogs.user_charge}), 0)::text`,
      })
      .from(requestLogs)
      .where(gte(requestLogs.created_at, since24h));

    const keyCounts = await db
      .select({
        status: providerKeys.status,
        count: sql<number>`count(*)::int`,
      })
      .from(providerKeys)
      .where(sql`${providerKeys.archived_at} is null`)
      .groupBy(providerKeys.status);

    const providerKeyCounts = Object.fromEntries(
      keyCounts.map((row) => [row.status, row.count])
    ) as Record<string, number>;

    const exhaustedCount = providerKeyCounts.EXHAUSTED ?? 0;
    const errorCount = providerKeyCounts.ERROR ?? 0;

    const recentAlerts: Array<{ level: string; message: string }> = [];
    if (exhaustedCount > 0) {
      recentAlerts.push({
        level: "WARN",
        message: `${exhaustedCount} provider key(s) exhausted. Pool replenishment may be required.`,
      });
    }
    if (errorCount > 0) {
      recentAlerts.push({
        level: "WARN",
        message: `${errorCount} provider key(s) in ERROR state.`,
      });
    }
    if ((requestStats?.errors_24h ?? 0) > 0) {
      recentAlerts.push({
        level: "INFO",
        message: `${requestStats?.errors_24h} failed request(s) in the last 24 hours.`,
      });
    }
    if (recentAlerts.length === 0) {
      recentAlerts.push({
        level: "OK",
        message: "No critical alerts. All systems operational.",
      });
    }

    return reply.status(200).send({
      total_users: userStats?.total_users ?? 0,
      active_users: userStats?.active_users ?? 0,
      suspended_users: userStats?.suspended_users ?? 0,
      total_balance: userStats?.total_balance ?? "0",
      requests_24h: requestStats?.requests_24h ?? 0,
      errors_24h: requestStats?.errors_24h ?? 0,
      revenue_24h: requestStats?.revenue_24h ?? "0",
      provider_key_counts: providerKeyCounts,
      recent_alerts: recentAlerts,
    });
  });
}
