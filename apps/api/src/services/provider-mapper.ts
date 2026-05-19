import { db } from "../db/client.js";
import { modelMappings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../redis/client.js";
import pino from "pino";

const logger = pino({ name: "provider-mapper" });

const CACHE_TTL_SECONDS = 60;

export interface ModelMapping {
  id: string;
  model_alias: string;
  provider: string;
  provider_model_id: string;
  pricing_input: string;
  pricing_output: string;
  capabilities: Record<string, unknown> | null;
  status: string;
}

/**
 * Resolve a model alias to its provider mapping.
 *
 * 1. Check Redis cache first (`model:{alias}`).
 * 2. Cache miss → query PostgreSQL for ACTIVE mapping.
 * 3. Cache hit → return parsed mapping.
 * 4. Not found → return null (caller returns 404).
 */
export async function resolveModel(modelAlias: string): Promise<ModelMapping | null> {
  const cacheKey = `model:${modelAlias}`;

  // 1. Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as ModelMapping;
      logger.debug({ modelAlias, source: "cache" }, "Model mapping cache hit");
      return parsed;
    } catch {
      // Invalid cache entry — fall through to DB
      logger.warn({ modelAlias }, "Corrupted model cache entry");
    }
  }

  // 2. Cache miss → query DB
  const rows = await db
    .select()
    .from(modelMappings)
    .where(
      eq(modelMappings.model_alias, modelAlias)
      // Note: status is an enum in DB, but we check it in the query via the enum value
    )
    .limit(1);

  const row = rows[0];
  if (!row || row.status !== "ACTIVE") {
    logger.info({ modelAlias }, "Model mapping not found or inactive");
    return null;
  }

  const mapping: ModelMapping = {
    id: row.id,
    model_alias: row.model_alias,
    provider: row.provider,
    provider_model_id: row.provider_model_id,
    pricing_input: String(row.pricing_input),
    pricing_output: String(row.pricing_output),
    capabilities: row.capabilities ?? {},
    status: row.status,
  };

  // 3. Cache in Redis with TTL (atomic SETEX)
  await redis.setex(cacheKey, CACHE_TTL_SECONDS, JSON.stringify(mapping));

  logger.debug({ modelAlias, provider: mapping.provider }, "Model mapping cached from DB");
  return mapping;
}
