import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { db } from "../../db/client.js";
import { users, usageLedger } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export async function balanceReconciliationsRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    const rows = await db
      .select({
        user_id: users.id,
        db_balance: users.balance,
        ledger_sum: sql<string>`COALESCE(SUM(${usageLedger.amount}), 0)`.as("ledger_sum"),
      })
      .from(users)
      .leftJoin(usageLedger, eq(users.id, usageLedger.user_id))
      .groupBy(users.id, users.balance);

    const discrepancies = rows
      .map((r: { user_id: string; db_balance: string; ledger_sum: string }) => ({
        user_id: r.user_id,
        db_balance: parseFloat(r.db_balance),
        ledger_sum: parseFloat(r.ledger_sum),
        diff: parseFloat(r.db_balance) - parseFloat(r.ledger_sum),
      }))
      .filter((r: { diff: number }) => Math.abs(r.diff) > 0.01);

    return reply.status(200).send({ data: discrepancies });
  });
}
