import { db } from "../db/client.js";
import { users, usageLedger } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import pino from "pino";

const logger = pino({ name: "worker:balance-reconciler" });

const DISCREPANCY_THRESHOLD = 0.01;

/**
 * Reconcile `users.balance` against the sum of `usage_ledger.amount`.
 *
 * If discrepancy > $0.01, log CRITICAL and insert an `adjustment` ledger entry.
 */
export async function runBalanceReconciler(): Promise<void> {
  logger.info("Running balance reconciler");

  // 1. Query all user balances
  const userRows = await db.select({ id: users.id, balance: users.balance }).from(users);

  // 2. Query ledger sums per user
  const ledgerRows = await db
    .select({
      user_id: usageLedger.user_id,
      total: sql<string>`SUM(${usageLedger.amount})`,
    })
    .from(usageLedger)
    .groupBy(usageLedger.user_id);

  const ledgerMap = new Map(ledgerRows.map((r) => [r.user_id, parseFloat(r.total ?? "0")]));

  for (const user of userRows) {
    const dbBalance = parseFloat(String(user.balance));
    const ledgerTotal = ledgerMap.get(user.id) ?? 0;
    const discrepancy = Math.abs(dbBalance - ledgerTotal);

    if (discrepancy > DISCREPANCY_THRESHOLD) {
      logger.fatal(
        { userId: user.id, dbBalance, ledgerTotal, discrepancy },
        "CRITICAL: Balance discrepancy detected"
      );

      // Insert adjustment ledger entry to reconcile
      const adjustmentAmount = (ledgerTotal - dbBalance).toFixed(4);
      const newBalance = ledgerTotal.toFixed(4);

      await db.insert(usageLedger).values({
        user_id: user.id,
        request_log_id: null,
        amount: adjustmentAmount,
        balance_after: newBalance,
        type: "adjustment",
        idempotency_key: `adjustment_${user.id}_${Date.now()}`,
      });

      // Also update users.balance to match ledger
      await db
        .update(users)
        .set({ balance: newBalance })
        .where(eq(users.id, user.id));

      logger.info({ userId: user.id, adjustmentAmount, newBalance }, "Adjustment applied");
    }
  }

  logger.info("Balance reconciler completed");
}
