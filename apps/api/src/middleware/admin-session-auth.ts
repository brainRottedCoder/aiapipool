import type { FastifyReply, FastifyRequest } from "fastify";
import { db } from "../db/client.js";
import { adminSessions, admins } from "../db/schema.js";
import { eq, and, gt } from "drizzle-orm";
import { sendOpenAIError } from "../utils/errors.js";

export const ADMIN_SESSION_COOKIE = "flux-admin.session-token";
const ADMIN_SESSION_MAX_AGE_SEC = 30 * 24 * 60 * 60;

export function getAdminSessionMaxAgeSec(): number {
  return ADMIN_SESSION_MAX_AGE_SEC;
}

/**
 * Resolves admin session from flux-admin.session-token cookie or Authorization: Bearer.
 */
export async function authenticateAdminSession(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  let sessionToken: string | undefined;

  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/flux-admin\.session-token=([^;]+)/);
    if (match?.[1]) {
      sessionToken = decodeURIComponent(match[1]);
    }
  }

  if (!sessionToken) {
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      sessionToken = authHeader.slice("Bearer ".length).trim();
    }
  }

  if (!sessionToken) {
    sendOpenAIError(reply, 401, "Invalid or expired admin session", "invalid_session", null);
    return;
  }

  const sessionRows = await db
    .select({
      sessionId: adminSessions.id,
      adminId: adminSessions.adminId,
    })
    .from(adminSessions)
    .where(
      and(eq(adminSessions.sessionToken, sessionToken), gt(adminSessions.expires, new Date()))
    )
    .limit(1);

  if (sessionRows.length === 0) {
    sendOpenAIError(reply, 401, "Invalid or expired admin session", "invalid_session", null);
    return;
  }

  const session = sessionRows[0]!;

  const adminRows = await db
    .select({
      id: admins.id,
      email: admins.email,
      name: admins.name,
      status: admins.status,
    })
    .from(admins)
    .where(eq(admins.id, session.adminId))
    .limit(1);

  if (adminRows.length === 0) {
    sendOpenAIError(reply, 401, "Invalid or expired admin session", "invalid_session", null);
    return;
  }

  const admin = adminRows[0]!;

  if (admin.status !== "active") {
    sendOpenAIError(reply, 403, "Admin account suspended", "account_suspended", null);
    return;
  }

  request.locals = {
    ...request.locals,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
    },
  };
}
