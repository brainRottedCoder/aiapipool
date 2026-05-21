import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getTableName } from "drizzle-orm";
import {
  users,
  accounts,
  sessions,
  verificationTokens,
} from "@fluxai/shared/db-schema";
import { db } from "@/lib/db";

const authSchema = {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
  verificationTokensTable: verificationTokens,
};

// #region agent log
fetch("http://127.0.0.1:7686/ingest/193e14e7-baa8-49ac-a5cb-fbbfc48f0ac6", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "9cec04" },
  body: JSON.stringify({
    sessionId: "9cec04",
    runId: "post-fix-v2",
    hypothesisId: "C",
    location: "lib/auth-adapter.ts",
    message: "Auth adapter schema table names",
    data: {
      users: getTableName(users),
      accounts: getTableName(accounts),
      sessions: getTableName(sessions),
      verificationTokens: getTableName(verificationTokens),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion

export const authAdapter = DrizzleAdapter(
  db,
  authSchema as unknown as Parameters<typeof DrizzleAdapter<typeof db>>[1],
);
