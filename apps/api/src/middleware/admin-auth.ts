import type { FastifyReply, FastifyRequest } from "fastify";
import { timingSafeEqual } from "crypto";
import { env } from "../config/env.js";
import { sendOpenAIError } from "../utils/errors.js";
import { authenticateAdminSession } from "./admin-session-auth.js";

/**
 * Admin authentication middleware for /admin/* routes.
 *
 * Two paths to access:
 *   1. X-Admin-Key header — constant-time compared against env.ADMIN_API_KEY.
 *   2. Admin session — flux-admin.session-token cookie or Bearer token.
 */
export async function authenticateAdmin(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const adminKeyHeader = request.headers["x-admin-key"];
  if (typeof adminKeyHeader === "string" && adminKeyHeader.trim().length > 0) {
    const provided = Buffer.from(adminKeyHeader.trim(), "utf8");
    const expected = Buffer.from(env.ADMIN_API_KEY, "utf8");

    if (provided.length === expected.length) {
      try {
        if (timingSafeEqual(provided, expected)) {
          return;
        }
      } catch {
        /* fall through */
      }
    }
  }

  try {
    await authenticateAdminSession(request, reply);
    if (reply.sent) return;
  } catch {
    sendOpenAIError(reply, 401, "Unauthorized", "unauthorized", null);
    return;
  }

  if (!request.locals?.admin) {
    sendOpenAIError(reply, 401, "Unauthorized", "unauthorized", null);
  }
}
