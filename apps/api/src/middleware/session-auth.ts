import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { sessions, users } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { sendOpenAIError } from "../utils/errors.js";

/**
 * NextAuth session authentication middleware for /api/user/* dashboard routes.
 *
 * Supports two session token sources:
 *   a) Cookie: next-auth.session-token (same-domain / subdomain)
 *   b) Authorization: Bearer <token> (cross-domain: Vercel → Azure)
 *
 * Steps:
 * 1. Extract session token from cookie or Authorization header.
 * 2. If neither present → 401
 * 3. Query sessions WHERE session_token = token AND expires > NOW().
 * 4. If not found or expired → 401
 * 5. Query users table to get user record.
 * 6. If user.status !== 'active' → 403
 * 7. Attach { user } to request context.
 */
export async function authenticateSession(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  let sessionToken: string | undefined;

  // Source A: Cookie header (next-auth.session-token)
  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/next-auth\.session-token=([^;]+)/);
    if (match && match[1]) {
      sessionToken = decodeURIComponent(match[1]);
    }
  }

  // Source B: Authorization Bearer header (cross-domain)
  if (!sessionToken) {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      sessionToken = authHeader.slice("Bearer ".length).trim();
    }
  }

  if (!sessionToken) {
    sendOpenAIError(
      reply,
      401,
      "Invalid or expired session",
      "invalid_session",
      null
    );
    return;
  }

  // Look up valid session
  const sessionRows = await db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.sessionToken, sessionToken),
        gt(sessions.expires, new Date())
      )
    )
    .limit(1);

  if (sessionRows.length === 0) {
    sendOpenAIError(
      reply,
      401,
      "Invalid or expired session",
      "invalid_session",
      null
    );
    return;
  }

  const session = sessionRows[0];
  if (!session) {
    sendOpenAIError(
      reply,
      401,
      "Invalid or expired session",
      "invalid_session",
      null
    );
    return;
  }

  // Load user record
  const userRows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (userRows.length === 0) {
    sendOpenAIError(
      reply,
      401,
      "Invalid or expired session",
      "invalid_session",
      null
    );
    return;
  }

  const user = userRows[0];
  if (!user) {
    sendOpenAIError(
      reply,
      401,
      "Invalid or expired session",
      "invalid_session",
      null
    );
    return;
  }

  if (user.status !== "active") {
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
      id: user.id,
      email: user.email,
      balance: String(user.balance),
      status: user.status,
      role: user.role,
    },
  };
}
