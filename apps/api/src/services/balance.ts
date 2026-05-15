import { db } from "../db/client.js";
import { users, usageLedger, requestLogs } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../redis/client.js";
import { CONSTANTS } from "../config/constants.js";
import pino from "pino";
import type { ModelMapping } from "./provider-mapper.js";

const logger = pino({ name: "balance" });

/**
 * Check if a user has a positive balance.
 *
 * Reads from DB (can be enhanced with Redis cache later).
 */
export async function checkBalance(userId: string): Promise<boolean> {
  const rows = await db
    .select({ balance: users.balance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return false;

  const balance = parseFloat(String(row.balance));
  return balance > CONSTANTS.MIN_BALANCE_THRESHOLD;
}

export interface DeductionResult {
  user_charge: number;
  upstream_cost: number;
  margin: number;
}

/**
 * Atomically deduct credits from a user's balance.
 *
 * Uses SERIALIZABLE isolation + row-level lock (`FOR UPDATE`).
 *
 * Steps:
 * 1. Calculate user_charge from model pricing.
 * 2. Generate idempotency_key.
 * 3. SERIALIZABLE transaction:
 *    a. Check idempotency_key doesn't exist in usage_ledger.
 *    b. SELECT balance FOR UPDATE.
 *    c. UPDATE users SET balance = balance - charge WHERE balance >= charge.
 *    d. INSERT usage_ledger.
 *    e. INSERT request_logs.
 * 4. Return { user_charge, upstream_cost, margin }.
 */
export async function deductCredits(
  userId: string,
  requestId: string,
  tokensInput: number,
  tokensOutput: number,
  modelMapping: ModelMapping,
  metadata: {
    apiKeyId?: string;
    providerKeyId?: string;
    provider: string;
    model: string;
    latencyMs: number;
    status: "success" | "error" | "timeout";
  }
): Promise<DeductionResult | { error: string }> {
  const pricingInput = parseFloat(modelMapping.pricing_input);
  const pricingOutput = parseFloat(modelMapping.pricing_output);

  const userCharge =
    (tokensInput / 1_000_000) * pricingInput +
    (tokensOutput / 1_000_000) * pricingOutput;

  // Upstream cost is the same as user charge for now (margin = 0 until we have provider pricing)
  // In a real system, upstream_cost would come from the provider's actual pricing.
  const upstreamCost = userCharge;
  const margin = userCharge - upstreamCost;

  const idempotencyKey = `req_${requestId}_deduction`;

  try {
    await db.transaction(async (tx) => {
      // a. Check idempotency
      const existing = await tx
        .select({ id: usageLedger.id })
        .from(usageLedger)
        .where(eq(usageLedger.idempotency_key, idempotencyKey))
        .limit(1);

      if (existing.length > 0) {
        logger.info({ requestId, idempotencyKey }, "Idempotent deduction — skipping");
        return; // Already processed
      }

      // b. Lock user row and read balance
      const userRows = await tx
        .select({ balance: users.balance })
        .from(users)
        .where(eq(users.id, userId))
        .for("update")
        .limit(1);

      const userRow = userRows[0];
      if (!userRow) {
        throw new Error("User not found");
      }

      const currentBalance = parseFloat(String(userRow.balance));
      const chargeStr = userCharge.toFixed(4);
      const newBalance = currentBalance - parseFloat(chargeStr);

      if (newBalance < 0) {
        throw new Error("Insufficient balance");
      }

      // c. Update user balance
      await tx
        .update(users)
        .set({ balance: newBalance.toFixed(4) })
        .where(eq(users.id, userId));

      // d. Insert usage ledger
      await tx.insert(usageLedger).values({
        user_id: userId,
        request_log_id: null, // Will be updated after request_logs insert
        amount: `-${chargeStr}`,
        balance_after: newBalance.toFixed(4),
        type: "api_usage",
        idempotency_key: idempotencyKey,
      });

      // e. Insert request log
      await tx.insert(requestLogs).values({
        user_id: userId,
        api_key_id: metadata.apiKeyId ?? null,
        provider_key_id: metadata.providerKeyId ?? null,
        provider: metadata.provider,
        model: metadata.model,
        tokens_input: tokensInput,
        tokens_output: tokensOutput,
        upstream_cost: upstreamCost.toFixed(6),
        user_charge: userCharge.toFixed(6),
        margin: margin.toFixed(6),
        latency_ms: metadata.latencyMs,
        status: metadata.status,
        idempotency_key: idempotencyKey,
      });
    }, { isolationLevel: 'serializable' });

    logger.info(
      { userId, requestId, userCharge, upstreamCost, margin },
      "Credits deducted successfully"
    );

    return { user_charge: userCharge, upstream_cost: upstreamCost, margin };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("Insufficient balance")) {
      logger.warn({ userId, requestId, userCharge }, "Insufficient balance");
      return { error: "Insufficient balance" };
    }

    logger.error({ err, userId, requestId }, "Failed to deduct credits");
    throw err;
  }
}

/**
 * Accumulate streaming token counts in Redis.
 *
 * After the final chunk, call `deductCredits()` with the total.
 */
export async function accumulateStreamingTokens(
  requestId: string,
  chunkTokens: number
): Promise<number> {
  const redisKey = `stream_tokens:${requestId}`;
  const total = await redis.incrby(redisKey, chunkTokens);
  // Set a TTL so the key doesn't leak if the stream crashes
  await redis.expire(redisKey, 3600);
  return total;
}

/**
 * Check if a user's balance is depleted mid-stream.
 *
 * Returns true if balance <= 0 (stream should terminate).
 */
export async function isBalanceDepleted(userId: string): Promise<boolean> {
  const rows = await db
    .select({ balance: users.balance })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const row = rows[0];
  if (!row) return true;

  const balance = parseFloat(String(row.balance));
  return balance <= 0;
}
