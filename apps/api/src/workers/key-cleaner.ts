import { db } from "../db/client.js";
import { providerKeys } from "../db/schema.js";
import { eq, and, lte, ne } from "drizzle-orm";
import pino from "pino";

const logger = pino({ name: "worker:key-cleaner" });

/**
 * Archive provider keys that have exhausted their credits.
 *
 * 1. Query provider_keys WHERE remaining_credits <= 0 AND status != 'EXHAUSTED'.
 * 2. Set status = 'EXHAUSTED', archived_at = NOW().
 * 3. Log archived key count.
 */
export async function runKeyCleaner(): Promise<void> {
  logger.info("Running key cleaner");

  const exhausted = await db
    .select({ id: providerKeys.id, provider: providerKeys.provider })
    .from(providerKeys)
    .where(
      and(
        lte(providerKeys.remaining_credits, "0.00"),
        ne(providerKeys.status, "EXHAUSTED")
      )
    );

  if (exhausted.length === 0) {
    logger.info("No exhausted keys to archive");
    return;
  }

  for (const key of exhausted) {
    await db
      .update(providerKeys)
      .set({
        status: "EXHAUSTED",
        archived_at: new Date(),
      })
      .where(eq(providerKeys.id, key.id));

    logger.warn({ keyId: key.id, provider: key.provider }, "Provider key archived (exhausted)");
  }

  logger.info({ archivedCount: exhausted.length }, "Key cleaner completed");
}
