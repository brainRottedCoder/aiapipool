import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { compare } from "bcryptjs";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { admins, adminSessions } from "../../db/schema.js";
import { sendOpenAIError } from "../../utils/errors.js";
import { redis } from "../../redis/client.js";
import {
  authenticateAdminSession,
  ADMIN_SESSION_COOKIE,
  getAdminSessionMaxAgeSec,
} from "../../middleware/admin-session-auth.js";
import pino from "pino";

const logger = pino({ name: "admin-auth" });

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_SEC = 15 * 60;
const SESSION_MAX_AGE_MS = getAdminSessionMaxAgeSec() * 1000;

async function checkAdminLoginRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rl:admin-login:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, LOGIN_WINDOW_SEC);
    }
    return count <= LOGIN_MAX_ATTEMPTS;
  } catch (err) {
    logger.warn({ err, ip }, "Redis unreachable; admin login rate limiter failing open");
    return true;
  }
}

function clientIp(request: FastifyRequest): string {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0]?.trim() ?? request.ip;
  }
  return request.ip;
}

function setSessionCookie(reply: FastifyReply, token: string): void {
  const maxAge = getAdminSessionMaxAgeSec();
  reply.header(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  );
}

export async function adminAuthRoute(app: FastifyInstance): Promise<void> {
  app.post("/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = clientIp(request);
    const allowed = await checkAdminLoginRateLimit(ip);
    if (!allowed) {
      return sendOpenAIError(
        reply,
        429,
        "Too many login attempts. Try again later.",
        "rate_limit_exceeded",
        "admin_login"
      );
    }

    const body = request.body as { email?: string; password?: string };
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!email || !password) {
      return sendOpenAIError(reply, 400, "Email and password are required", "invalid_request", null);
    }

    const adminRows = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    const admin = adminRows[0];
    if (!admin || admin.status !== "active") {
      return sendOpenAIError(reply, 401, "Invalid email or password", "invalid_credentials", null);
    }

    const valid = await compare(password, admin.password_hash);
    if (!valid) {
      return sendOpenAIError(reply, 401, "Invalid email or password", "invalid_credentials", null);
    }

    const sessionToken = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + SESSION_MAX_AGE_MS);

    await db.insert(adminSessions).values({
      sessionToken,
      adminId: admin.id,
      expires,
    });

    await db
      .update(admins)
      .set({ last_login_at: new Date(), updated_at: new Date() })
      .where(eq(admins.id, admin.id));

    setSessionCookie(reply, sessionToken);

    return reply.status(200).send({
      token: sessionToken,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  });

  app.post("/logout", async (request: FastifyRequest, reply: FastifyReply) => {
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

    if (sessionToken) {
      await db.delete(adminSessions).where(eq(adminSessions.sessionToken, sessionToken));
    }

    reply.header(
      "Set-Cookie",
      `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );

    return reply.status(200).send({ success: true });
  });

  app.get("/me", async (request: FastifyRequest, reply: FastifyReply) => {
    await authenticateAdminSession(request, reply);
    if (reply.sent) return;

    const admin = request.locals?.admin;
    if (!admin) {
      return sendOpenAIError(reply, 401, "Unauthorized", "unauthorized", null);
    }

    return reply.status(200).send({ admin });
  });
}
