import { redis } from "../redis/client.js";
import { CONSTANTS } from "../config/constants.js";
import pino from "pino";

const logger = pino({ name: "circuit-breaker" });

const FAILURE_WINDOW_SECONDS = 5 * 60; // 5 minutes
const COOLDOWN_MS = CONSTANTS.CIRCUIT_BREAKER_COOLDOWN_MS; // 10 minutes

function failureKey(provider: string, keyId?: string): string {
  return keyId ? `cb:${provider}:${keyId}:failures` : `cb:${provider}:global:failures`;
}

function stateKey(provider: string, keyId?: string): string {
  return keyId ? `cb:${provider}:${keyId}:state` : `cb:${provider}:global:state`;
}

function lastFailureKey(provider: string, keyId?: string): string {
  return keyId ? `cb:${provider}:${keyId}:lastFailure` : `cb:${provider}:global:lastFailure`;
}

/**
 * Check if the circuit breaker is OPEN for a provider/key.
 *
 * - If failures >= threshold within 5 min → OPEN (return true).
 * - After cooldown (10 min) → HALF-OPEN (return false, but next failure re-opens).
 */
export async function isOpen(provider: string, keyId?: string): Promise<boolean> {
  const fKey = failureKey(provider, keyId);
  const sKey = stateKey(provider, keyId);
  const lfKey = lastFailureKey(provider, keyId);

  const [failuresStr, state, lastFailureStr] = await redis.mget(fKey, sKey, lfKey);
  const failures = failuresStr ? parseInt(failuresStr, 10) : 0;
  const lastFailure = lastFailureStr ? parseInt(lastFailureStr, 10) : 0;

  // If OPEN and still within cooldown → stay open
  if (state === "open") {
    const now = Date.now();
    if (now - lastFailure < COOLDOWN_MS) {
      return true;
    }
    // Cooldown elapsed → transition to half-open
    await redis.setex(sKey, FAILURE_WINDOW_SECONDS, "half-open");
    logger.info({ provider, keyId }, "Circuit breaker transitioned to half-open");
    return false;
  }

  // If half-open or closed → check failure count
  if (failures >= CONSTANTS.CIRCUIT_BREAKER_THRESHOLD) {
    // Transition to open
    await redis.setex(sKey, FAILURE_WINDOW_SECONDS, "open");
    logger.warn({ provider, keyId, failures }, "Circuit breaker OPENED");
    return true;
  }

  return false;
}

/**
 * Record a failure for a provider/key.
 *
 * - INCR failure count with 5-minute TTL window.
 * - If threshold hit → open circuit, log alert.
 */
export async function recordFailure(provider: string, keyId?: string): Promise<void> {
  const fKey = failureKey(provider, keyId);
  const sKey = stateKey(provider, keyId);
  const lfKey = lastFailureKey(provider, keyId);

  const count = await redis.incr(fKey);
  if (count === 1) {
    await redis.expire(fKey, FAILURE_WINDOW_SECONDS);
  }

  await redis.setex(lfKey, FAILURE_WINDOW_SECONDS, String(Date.now()));

  if (count >= CONSTANTS.CIRCUIT_BREAKER_THRESHOLD) {
    await redis.setex(sKey, FAILURE_WINDOW_SECONDS, "open");
    logger.error({ provider, keyId, count }, "Circuit breaker threshold reached — OPENED");
  } else {
    logger.warn({ provider, keyId, count }, "Circuit breaker failure recorded");
  }
}

/**
 * Record a success for a provider/key.
 *
 * - Reset failure counter.
 * - If state was half-open → close circuit.
 */
export async function recordSuccess(provider: string, keyId?: string): Promise<void> {
  const fKey = failureKey(provider, keyId);
  const sKey = stateKey(provider, keyId);

  await redis.del(fKey);

  const state = await redis.get(sKey);
  if (state === "half-open") {
    await redis.setex(sKey, FAILURE_WINDOW_SECONDS, "closed");
    logger.info({ provider, keyId }, "Circuit breaker CLOSED after successful probe");
  }
}
