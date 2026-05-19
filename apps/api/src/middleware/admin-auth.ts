import type { FastifyReply, FastifyRequest } from "fastify";
import { timingSafeEqual } from "crypto";
import { env } from "../config/env.js";
import { sendOpenAIError } from "../utils/errors.js";
import { authenticateSession } from "./session-auth.js";

/**
 * Admin authentication middleware for /admin/* routes.
 *
 * Two paths to access:
 *   1. X-Admin-Key header — constant-time compared against env.ADMIN_API_KEY.
 *   2. Session auth — valid NextAuth session with user.role === 'admin'.
 *
 * If neither passes → 401.
 */
export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Path 1: X-Admin-Key static API key
  const adminKeyHeader = request.headers["x-admin-key"];
  if (typeof adminKeyHeader === "string" && adminKeyHeader.trim().length > 0) {
    const provided = Buffer.from(adminKeyHeader.trim(), "utf8");
    const expected = Buffer.from(env.ADMIN_API_KEY, "utf8");

    if (provided.length === expected.length) {
      try {
        if (timingSafeEqual(provided, expected)) {
          return; // Admin key valid — proceed
        }
      } catch {
        /* fall through to 401 */
      }
    }
  }

  // Path 2: Session auth with admin role
  try {
    await authenticateSession(request, reply);
    if (reply.sent) return; // Session auth already sent an error
  } catch {
    sendOpenAIError(reply, 401, "Unauthorized", "unauthorized", null);
    return;
  }

  if (!request.locals?.user || request.locals.user.role !== "admin") {
    sendOpenAIError(reply, 401, "Unauthorized", "unauthorized", null);
    return;
  }
}
