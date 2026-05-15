import { Redis, RedisOptions } from "ioredis";
import { env } from "../config/env.js";
import pino from "pino";

const logger = pino({ name: "redis" });

const baseRedisOptions: RedisOptions = {
  enableOfflineQueue: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError(err) {
    const message = err.message;
    if (message.includes("READONLY")) {
      // Reconnect when Redis master fails over to slave
      return true;
    }
    return false;
  },
};

// ── General-purpose Redis (commands + caching) ──
const generalOptions: RedisOptions = {
  ...baseRedisOptions,
  maxRetriesPerRequest: 3,
};

export const redis = new Redis(env.REDIS_URL, generalOptions);

redis.on("error", (err) => {
  logger.error({ err }, "Redis error");
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

// ── Subscriber Redis (pub/sub for SSE events) ──
export const subscriberRedis = new Redis(env.REDIS_URL, generalOptions);

subscriberRedis.on("error", (err) => {
  logger.error({ err }, "Redis subscriber error");
});

subscriberRedis.on("connect", () => {
  logger.info("Redis subscriber connection established");
});

// ── BullMQ Redis (blocking commands require maxRetriesPerRequest: null) ──
const bullmqOptions: RedisOptions = {
  ...baseRedisOptions,
  maxRetriesPerRequest: null,
};

export const bullmqRedis = new Redis(env.REDIS_URL, bullmqOptions);

bullmqRedis.on("error", (err) => {
  logger.error({ err }, "Redis BullMQ error");
});

bullmqRedis.on("connect", () => {
  logger.info("Redis BullMQ connection established");
});

/** Health check — returns true if Redis responds to PING */
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const pong = await redis.ping();
    return pong === "PONG";
  } catch {
    return false;
  }
}
