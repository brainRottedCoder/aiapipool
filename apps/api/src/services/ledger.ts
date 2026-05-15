import { db } from "../db/client.js";
import { requestLogs } from "../db/schema.js";
import pino from "pino";

const logger = pino({ name: "ledger" });

export interface RequestLogData {
  user_id: string;
  api_key_id?: string | null;
  provider_key_id?: string | null;
  provider: string;
  model: string;
  tokens_input: number;
  tokens_output: number;
  upstream_cost: string;
  user_charge: string;
  margin: string;
  latency_ms: number;
  status: "success" | "error" | "timeout";
  idempotency_key: string;
}

/**
 * Write an immutable request log and usage ledger entry.
 *
 * All writes carry an idempotency_key (UNIQUE constraint prevents duplicates).
 * Never stores message content (prompts/completions).
 * Only metadata: tokens, cost, latency, model, provider, status.
 */
export async function logRequest(data: RequestLogData): Promise<void> {
  try {
    await db.insert(requestLogs).values({
      user_id: data.user_id,
      api_key_id: data.api_key_id ?? null,
      provider_key_id: data.provider_key_id ?? null,
      provider: data.provider,
      model: data.model,
      tokens_input: data.tokens_input,
      tokens_output: data.tokens_output,
      upstream_cost: data.upstream_cost,
      user_charge: data.user_charge,
      margin: data.margin,
      latency_ms: data.latency_ms,
      status: data.status,
      idempotency_key: data.idempotency_key,
    });

    logger.debug(
      { idempotencyKey: data.idempotency_key },
      "Request logged to ledger"
    );
  } catch (err) {
    // Duplicate idempotency_key is expected on retries — ignore
    if (err instanceof Error && err.message.includes("duplicate key")) {
      logger.info(
        { idempotencyKey: data.idempotency_key },
        "Duplicate request log — idempotency protection"
      );
      return;
    }

    logger.error({ err, idempotencyKey: data.idempotency_key }, "Failed to write request log");
    throw err;
  }
}
