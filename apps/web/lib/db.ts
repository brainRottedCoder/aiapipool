import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@fluxai/shared/db-schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

// #region agent log
pool
  .query("SELECT 1")
  .then(() => {
    fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
      body: JSON.stringify({
        sessionId: "9cec04",
        runId: "post-fix",
        hypothesisId: "B",
        location: "lib/db.ts:pool",
        message: "Postgres pool connected",
        data: { ok: true },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  })
  .catch((err: { code?: string; message?: string }) => {
    fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
      body: JSON.stringify({
        sessionId: "9cec04",
        runId: "post-fix",
        hypothesisId: "B",
        location: "lib/db.ts:pool",
        message: "Postgres pool connection failed",
        data: { code: err?.code ?? null, error: err?.message ?? "unknown" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  });
// #endregion

export const db = drizzle(pool, { schema });
