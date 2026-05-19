import { db } from "../db/client.js";
import { modelMappings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { redis } from "../redis/client.js";
import { getAdapter } from "../providers/registry.js";
import { recordFailure, recordSuccess } from "../services/circuit-breaker.js";
import pino from "pino";

const logger = pino({ name: "worker:health-checker" });

/**
 * Send lightweight health checks to each active provider.
 *
 * 1. Determine distinct active providers from model_mappings.
 * 2. For each provider, fetch its adapter baseUrl.
 * 3. Perform a lightweight HTTP GET/HEAD to the provider endpoint
 *    with a short timeout (5s).
 * 4. Record latency in Redis `health:{provider}` with 120s TTL.
 * 5. On network failure → recordFailure(); on success → recordSuccess().
 */
export async function runHealthChecker(): Promise<void> {
  logger.info("Running health checker");

  // 1. Distinct active providers from model mappings
  const rows = await db
    .selectDistinct({ provider: modelMappings.provider })
    .from(modelMappings)
    .where(eq(modelMappings.status, "ACTIVE"));

  const providers = rows.map((r) => r.provider);

  for (const provider of providers) {
    try {
      const adapter = getAdapter(provider);
      const baseUrl = adapter.baseUrl;

      // Lightweight connectivity check: GET /models (standard OpenAI endpoint)
      // or just HEAD to baseUrl. We use a short timeout.
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const start = performance.now();
      const response = await fetch(`${baseUrl}/models`, {
        method: "GET",
        signal: controller.signal,
      }).catch(() => null);
      clearTimeout(timeout);

      const latencyMs = Math.round(performance.now() - start);

      if (response && (response.ok || response.status === 401 || response.status === 403)) {
        // 401/403 means the endpoint exists but requires auth — that's "up"
        logger.info({ provider, latencyMs }, "Provider healthy");
        await redis.setex(`health:${provider}`, 120, JSON.stringify({ healthy: true, latencyMs, checkedAt: Date.now() }));
        await recordSuccess(provider);
      } else {
        const status = response?.status ?? 0;
        logger.warn({ provider, status, latencyMs }, "Provider unhealthy (non-OK status)");
        await redis.setex(`health:${provider}`, 120, JSON.stringify({ healthy: false, latencyMs, checkedAt: Date.now(), status }));
        await recordFailure(provider);
      }
    } catch (err: unknown) {
      logger.error({ err, provider }, "Health check failed with exception");
      await redis.setex(`health:${provider}`, 120, JSON.stringify({ healthy: false, checkedAt: Date.now(), error: true }));
      await recordFailure(provider);
    }
  }

  logger.info("Health checker completed");
}
