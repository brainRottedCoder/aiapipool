import type { FastifyInstance } from "fastify";
import { checkRedisHealth } from "../redis/client.js";
import { pool } from "../db/client.js";

export async function healthRoute(app: FastifyInstance): Promise<void> {
  app.get("/", async (_request, reply) => {
    const dbHealthy = await checkDbHealth();
    const redisHealthy = await checkRedisHealth();

    if (!dbHealthy) {
      return reply.status(503).send({
        status: "unhealthy",
        reason: "database",
        uptime: process.uptime(),
        timestamp: Date.now(),
      });
    }

    return reply.status(200).send({
      status: "ok",
      degraded: !redisHealthy,
      uptime: process.uptime(),
      timestamp: Date.now(),
    });
  });
}

async function checkDbHealth(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    return true;
  } catch {
    return false;
  }
}
