import type { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../redis/client.js";
import { env } from "../config/env.js";
import { sendOpenAIError } from "../utils/errors.js";
import pino from "pino";

const logger = pino({ name: "rate-limiter" });

/**
 * Redis sliding-window rate limiter for /v1/* routes.
 *
 * Enforces three limits per API key:
 *   1. RPM  (requests per minute)     — Redis key: rl:rpm:{apiKeyId}
 *   2. TPD  (tokens per day)           — Redis key: rl:tpd:{apiKeyId}
 *   3. Concurrent requests             — Redis key: rl:concurrent:{apiKeyId}
 *
 * The concurrent counter is INCR'd here and DECR'd in an onResponse hook.
 *
 * If the request has no API key context (unauthenticated), a very lenient
 * IP-based limit is applied as a pre-auth DDoS guard.
 *
 * CRITICAL: If Redis is unreachable, the rate limiter FAILS OPEN (allows
 * traffic) to avoid a total outage. The request is logged at warn level.
 */
export async function rateLimiter(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const apiKey = request.locals?.apiKey;

    if (apiKey) {
      // ── Authenticated: API-key-based limits ──
      const keyId = apiKey.id;
      const rpmLimit = apiKey.rate_limit_rpm;
      const tpdLimit = apiKey.rate_limit_tokens_day;

      // 1. RPM check (sliding window, 60s TTL)
      const rpmKey = `rl:rpm:${keyId}`;
      const rpmCount = await redis.incr(rpmKey);
      if (rpmCount === 1) {
        await redis.expire(rpmKey, 60);
      }
      if (rpmCount > rpmLimit) {
        sendOpenAIError(
          reply,
          429,
          "Rate limit exceeded: requests per minute",
          "rate_limit_exceeded",
          "rpm"
        );
        return;
      }

      // 2. Tokens-per-day check (pre-flight accumulated value)
      const tpdKey = `rl:tpd:${keyId}`;
      const tpdCountStr = await redis.get(tpdKey);
      const tpdCount = tpdCountStr ? parseInt(tpdCountStr, 10) : 0;
      if (tpdCount >= tpdLimit) {
        sendOpenAIError(
          reply,
          429,
          "Rate limit exceeded: tokens per day",
          "rate_limit_exceeded",
          "tokens_per_day"
        );
        return;
      }
      // Ensure TTL exists on first write (set by post-request accumulator)
      if (!tpdCountStr) {
        // Placeholder: actual accumulation happens post-request
        await redis.set(tpdKey, "0", "EX", 86400);
      }

      // 3. Concurrent request check
      const concurrentKey = `rl:concurrent:${keyId}`;
      const concurrentCount = await redis.incr(concurrentKey);
      if (concurrentCount === 1) {
        // Use a long TTL so a crashed process doesn't leak forever,
        // but short enough that the key expires reasonably.
        await redis.expire(concurrentKey, 300);
      }
      if (concurrentCount > env.MAX_CONCURRENT_REQUESTS) {
        // Roll back the INCR before rejecting
        await redis.decr(concurrentKey);
        sendOpenAIError(
          reply,
          429,
          "Rate limit exceeded: too many concurrent requests",
          "rate_limit_exceeded",
          "concurrent"
        );
        return;
      }

      // Schedule DECR when response finishes (best-effort)
      reply.raw.on("finish", () => {
        redis.decr(concurrentKey).catch(() => {
          /* ignore late errors */
        });
      });
    } else {
      // ── Unauthenticated: lenient IP-based DDoS guard ──
      let clientIp = request.ip;
      if (!clientIp) {
        const forwarded = request.headers["x-forwarded-for"];
        if (typeof forwarded === "string") {
          clientIp = forwarded.split(",")[0]?.trim() ?? "unknown";
        } else if (Array.isArray(forwarded) && forwarded.length > 0) {
          const first = forwarded[0];
          clientIp = first ? first.trim() : "unknown";
        } else {
          clientIp = "unknown";
        }
      }

      const ipKey = `rl:ip:${clientIp}`;
      const ipCount = await redis.incr(ipKey);
      if (ipCount === 1) {
        await redis.expire(ipKey, 60);
      }
      // Hard-coded lenient limit for unauthenticated traffic
      if (ipCount > 10) {
        sendOpenAIError(
          reply,
          429,
          "Rate limit exceeded",
          "rate_limit_exceeded",
          "ip"
        );
        return;
      }
    }
  } catch (err) {
    // FAIL OPEN: Redis is unreachable — log and allow traffic
    logger.warn(
      { err, requestId: request.id, route: request.url },
      "Redis unreachable; rate limiter failing open"
    );
    return;
  }
}
