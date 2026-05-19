import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "../config/env.js";
import pino from "pino";

const logger = pino({ name: "db" });

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 30000,
});

pool.on("error", (err) => {
  logger.error({ err }, "PostgreSQL pool error");
});

pool.on("connect", () => {
  logger.info("PostgreSQL connection established");
});

export const db = drizzle(pool);
export { pool };
