import { db } from "../db/client.js";
import { requestLogs } from "../db/schema.js";
import { lt } from "drizzle-orm";
import pino from "pino";

const logger = pino({ name: "worker:data-retention" });

const METADATA_RETENTION_DAYS = 90;
const LEDGER_RETENTION_YEARS = 7;

/**
 * Enforce data retention policies.
 *
 * 1. Delete request_logs metadata older than 90 days.
 * 2. Log warning for immutable ledger entries older than 7 years
 *    (cold-storage archiving is a future production task).
 */
export async function runDataRetention(): Promise<void> {
  logger.info("Running data retention enforcer");

  // 1. Purge request_logs older than 90 days
  const metadataCutoff = new Date(Date.now() - METADATA_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  await db
    .delete(requestLogs)
    .where(lt(requestLogs.created_at, metadataCutoff));

  // Drizzle returns the deleted rows in some drivers; log generically
  logger.info({ cutoff: metadataCutoff.toISOString() }, "Purged request_logs metadata older than 90 days");

  // 2. Identify ledger entries older than 7 years (logging only — cold storage archive is future)
  const ledgerCutoff = new Date(Date.now() - LEDGER_RETENTION_YEARS * 365 * 24 * 60 * 60 * 1000);
  logger.info(
    { ledgerCutoff: ledgerCutoff.toISOString() },
    "Ledger entries older than 7 years should be archived to cold storage (not yet implemented)"
  );

  logger.info("Data retention enforcer completed");
}
