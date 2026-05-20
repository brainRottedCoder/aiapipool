import "./config/load-env.js";
import { env } from "./config/env.js";
import { buildApp } from "./app.js";
import { pool } from "./db/client.js";
import { redis, subscriberRedis } from "./redis/client.js";
import { bootstrapWorkers, closeWorkers } from "./workers/index.js";

const app = await buildApp();

app.listen({ port: env.PORT, host: env.HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info({ redisUrl: env.REDIS_URL }, `Server listening at ${address}`);

  void bootstrapWorkers().catch((workerErr) => {
    app.log.warn(
      { err: workerErr },
      "Background workers not started (is Redis running on REDIS_URL?)"
    );
  });
});

async function shutdown(signal: string) {
  app.log.info({ signal }, "Shutting down gracefully");

  // 1. Stop accepting new HTTP connections
  await app.close();

  // 2. Close BullMQ workers
  await closeWorkers();

  // 3. Close Redis connections
  await redis.quit();
  await subscriberRedis.quit();

  // 4. Close DB pool
  await pool.end();

  app.log.info("Graceful shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
