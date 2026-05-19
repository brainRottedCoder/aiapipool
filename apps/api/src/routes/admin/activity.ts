import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import {
  requestLogs,
  usageLedger,
  adminAuditLogs,
  users,
  admins,
} from "../../db/schema.js";
import { desc, eq, sql } from "drizzle-orm";

export async function activityRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { limit?: string };
    const limit = Math.min(parseInt(query.limit ?? "50", 10), 100);

    const perSection = Math.ceil(limit / 3);

    const requests = await db
      .select({
        id: requestLogs.id,
        type: sql<string>`'request'`,
        user_email: users.email,
        model: requestLogs.model,
        user_charge: requestLogs.user_charge,
        status: requestLogs.status,
        latency_ms: requestLogs.latency_ms,
        created_at: requestLogs.created_at,
      })
      .from(requestLogs)
      .innerJoin(users, eq(requestLogs.user_id, users.id))
      .orderBy(desc(requestLogs.created_at))
      .limit(perSection);

    const ledger = await db
      .select({
        id: usageLedger.id,
        type: sql<string>`'ledger'`,
        user_email: users.email,
        amount: usageLedger.amount,
        ledger_type: usageLedger.type,
        balance_after: usageLedger.balance_after,
        created_at: usageLedger.created_at,
      })
      .from(usageLedger)
      .innerJoin(users, eq(usageLedger.user_id, users.id))
      .orderBy(desc(usageLedger.created_at))
      .limit(perSection);

    const audits = await db
      .select({
        id: adminAuditLogs.id,
        type: sql<string>`'audit'`,
        admin_email: admins.email,
        action: adminAuditLogs.action,
        target_type: adminAuditLogs.target_type,
        target_id: adminAuditLogs.target_id,
        metadata: adminAuditLogs.metadata,
        created_at: adminAuditLogs.created_at,
      })
      .from(adminAuditLogs)
      .innerJoin(admins, eq(adminAuditLogs.admin_id, admins.id))
      .orderBy(desc(adminAuditLogs.created_at))
      .limit(perSection);

    return reply.status(200).send({
      requests,
      ledger,
      audits,
    });
  });
}
