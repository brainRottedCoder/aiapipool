import { db } from "../db/client.js";
import { providerKeys } from "../db/schema.js";
import { eq, and, gt, sql } from "drizzle-orm";
import { redis } from "../redis/client.js";
import { decrypt } from "../crypto/encryption.js";
import { env } from "../config/env.js";
import pino from "pino";

const logger = pino({ name: "key-pool" });

const MASTER_KEY = Buffer.from(env.MASTER_ENCRYPTION_KEY);

export interface AcquiredKey {
  id: string;
  provider: string;
  plaintextKey: string;
  remaining_credits: string;
}

/**
 * Acquire the best available provider key for a given provider.
 *
 * Priority:
 * 1. Normal key with highest remaining_credits > 1.00
 * 2. Emergency reserve key (logs CRITICAL)
 * 3. Throw 503 if none available
 */
export async function acquireKey(provider: string): Promise<AcquiredKey> {
  // 1. Query normal active keys with sufficient credits
  const normalRows = await db
    .select()
    .from(providerKeys)
    .where(
      and(
        eq(providerKeys.provider, provider),
        eq(providerKeys.status, "ACTIVE"),
        eq(providerKeys.is_emergency_reserve, false),
        gt(providerKeys.remaining_credits, "1.00")
      )
    )
    .orderBy(sql`${providerKeys.remaining_credits} DESC`)
    .limit(1);

  const normalRow = normalRows[0];

  if (normalRow) {
    const plaintextKey = decrypt(
      normalRow.api_key_encrypted as Buffer,
      MASTER_KEY
    );

    logger.debug({ keyId: normalRow.id, provider }, "Acquired normal provider key");

    return {
      id: normalRow.id,
      provider: normalRow.provider,
      plaintextKey,
      remaining_credits: String(normalRow.remaining_credits),
    };
  }

  // 2. No normal keys → check emergency reserve
  const emergencyRows = await db
    .select()
    .from(providerKeys)
    .where(
      and(
        eq(providerKeys.provider, provider),
        eq(providerKeys.status, "ACTIVE"),
        eq(providerKeys.is_emergency_reserve, true)
      )
    )
    .limit(1);

  const emergencyRow = emergencyRows[0];

  if (emergencyRow) {
    const plaintextKey = decrypt(
      emergencyRow.api_key_encrypted as Buffer,
      MASTER_KEY
    );

    logger.fatal(
      { keyId: emergencyRow.id, provider },
      "CRITICAL: Using emergency reserve key — normal keys exhausted"
    );

    return {
      id: emergencyRow.id,
      provider: emergencyRow.provider,
      plaintextKey,
      remaining_credits: String(emergencyRow.remaining_credits),
    };
  }

  // 3. Nothing available
  logger.error({ provider }, "No available keys for provider");
  throw new Error("No available keys for provider");
}

/**
 * Release a key after use, deducting upstream credits.
 *
 * 1. Atomically decrement remaining_credits in Redis.
 * 2. Update last_used timestamp in DB.
 * 3. If credits exhausted → mark as EXHAUSTED.
 * 4. Sync to PostgreSQL in background (eventual consistency).
 */
export async function releaseKey(
  keyId: string,
  creditsUsed: number
): Promise<void> {
  const redisKey = `pk:credits:${keyId}`;

  // 1. Atomically decrement in Redis (best-effort; falls back to DB if Redis unavailable)
  try {
    const newValue = await redis.decrby(redisKey, Math.round(creditsUsed * 100));
    if (newValue <= 0) {
      // Credits exhausted → mark in DB immediately
      await markKeyExhausted(keyId);
      return;
    }
  } catch {
    // Redis unavailable → skip Redis counter, rely on DB update
  }

  // 2. Update DB in background (fire-and-forget, eventual consistency)
  db.update(providerKeys)
    .set({
      remaining_credits: sql`${providerKeys.remaining_credits} - ${creditsUsed.toFixed(4)}`,
      last_used: new Date(),
    })
    .where(eq(providerKeys.id, keyId))
    .then(() => {
      logger.debug({ keyId, creditsUsed }, "Key credits updated in DB");
    })
    .catch((err) => {
      logger.error({ err, keyId }, "Failed to update key credits in DB");
    });
}

/**
 * Mark a provider key as EXHAUSTED and set archived_at.
 */
export async function markKeyExhausted(keyId: string): Promise<void> {
  await db
    .update(providerKeys)
    .set({
      status: "EXHAUSTED",
      archived_at: new Date(),
    })
    .where(eq(providerKeys.id, keyId));

  logger.warn({ keyId }, "Provider key marked EXHAUSTED");
}

/**
 * Mark a provider key as unhealthy (ERROR status).
 *
 * 1. Set status = 'ERROR' in DB.
 * 2. Log reason.
 */
export async function markKeyUnhealthy(
  keyId: string,
  reason: string
): Promise<void> {
  await db
    .update(providerKeys)
    .set({
      status: "ERROR",
    })
    .where(eq(providerKeys.id, keyId));

  logger.error({ keyId, reason }, "Provider key marked ERROR");
}
