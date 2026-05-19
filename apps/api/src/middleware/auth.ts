import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { apiKeys, users } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { env } from "../config/env.js";
import { hashApiKey } from "../crypto/hmac.js";
import { sendOpenAIError } from "../utils/errors.js";

declare module "fastify" {
  interface FastifyRequest {
    locals?: {
      user?: {
        id: string;
        email: string;
        balance: string;
        status: string;
        role: string;
      };
      apiKey?: {
        id: string;
        rate_limit_rpm: number;
        rate_limit_tokens_day: number;
      };
      admin?: {
        id: string;
        email: string;
        name: string | null;
      };
    };
  }
}

/**
 * Bearer API key authentication middleware for /v1/* and /billing/* routes.
 *
 * Steps:
 * 1. Extract Bearer token from Authorization header.
 * 2. If missing → 401
 * 3. Compute HMAC-SHA256(token, API_KEY_PEPPER).
 * 4. Query api_keys WHERE hashed_key = hash AND status = 'active'.
 * 5. If not found → 401
 * 6. Join with users table to get user record.
 * 7. If user.status !== 'active' → 403
 * 8. Attach { user, apiKey } to request context.
 */
export async function authenticateUser(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendOpenAIError(
      reply,
      401,
      "Missing API key",
      "missing_api_key",
      null
    );
    return;
  }

  const rawKey = authHeader.slice("Bearer ".length).trim();
  if (!rawKey) {
    sendOpenAIError(
      reply,
      401,
      "Missing API key",
      "missing_api_key",
      null
    );
    return;
  }

  const hashedKey = hashApiKey(rawKey, env.API_KEY_PEPPER);

  // Query active API key and join with user in one go
  const rows = await db
    .select()
    .from(apiKeys)
    .innerJoin(users, eq(apiKeys.userId, users.id))
    .where(
      and(
        eq(apiKeys.hashed_key, hashedKey),
        eq(apiKeys.status, "active")
      )
    )
    .limit(1);

  if (rows.length === 0) {
    sendOpenAIError(
      reply,
      401,
      "Invalid API key",
      "invalid_api_key",
      null
    );
    return;
  }

  const row = rows[0];
  if (!row) return;
  const keyRow = row.api_keys;
  const userRow = row.users;

  if (userRow.status !== "active") {
    sendOpenAIError(
      reply,
      403,
      "Account suspended",
      "account_suspended",
      null
    );
    return;
  }

  request.locals = {
    ...request.locals,
    user: {
      id: userRow.id,
      email: userRow.email,
      balance: String(userRow.balance),
      status: userRow.status,
      role: userRow.role,
    },
    apiKey: {
      id: keyRow.id,
      rate_limit_rpm: keyRow.rate_limit_rpm,
      rate_limit_tokens_day: keyRow.rate_limit_tokens_day,
    },
  };
}
