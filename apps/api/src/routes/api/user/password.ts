import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { ChangePasswordRequestSchema } from "@fluxai/shared";
import { db } from "../../../db/client.js";
import { users } from "../../../db/schema.js";
import { sendOpenAIError } from "../../../utils/errors.js";
import { redis } from "../../../redis/client.js";
import { sendPasswordChangedEmail } from "../../../services/email.js";
import pino from "pino";

const logger = pino({ name: "change-password" });

const BCRYPT_ROUNDS = 12;
const MAX_ATTEMPTS = 5;
const WINDOW_SEC = 3600;

async function checkPasswordChangeRateLimit(userId: string): Promise<boolean> {
  try {
    const key = `rl:pwd-change:${userId}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, WINDOW_SEC);
    }
    return count <= MAX_ATTEMPTS;
  } catch (err) {
    logger.warn(
      { err, userId },
      "Redis unreachable; password change rate limiter failing open"
    );
    return true;
  }
}

export async function changePasswordRoute(app: FastifyInstance): Promise<void> {
  app.post(
    "/change-password",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const sessionUser = request.locals?.user;
      if (!sessionUser) {
        sendOpenAIError(reply, 401, "Unauthorized", "authentication_error");
        return;
      }

      const allowed = await checkPasswordChangeRateLimit(sessionUser.id);
      if (!allowed) {
        sendOpenAIError(
          reply,
          429,
          "Too many password change attempts. Try again later.",
          "rate_limit_exceeded",
          "password_change"
        );
        return;
      }

      const parsed = ChangePasswordRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        sendOpenAIError(
          reply,
          400,
          issue?.message ?? "Invalid request",
          "invalid_request",
          issue?.path.length ? issue.path.join(".") : null
        );
        return;
      }

      const { currentPassword, newPassword } = parsed.data;

      const userRows = await db
        .select({
          password_hash: users.password_hash,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, sessionUser.id))
        .limit(1);

      const dbUser = userRows[0];
      if (!dbUser) {
        sendOpenAIError(reply, 401, "Unauthorized", "authentication_error");
        return;
      }

      if (!dbUser.password_hash) {
        sendOpenAIError(
          reply,
          400,
          "This account uses social sign-in and has no password set. Use the forgot password flow to create one.",
          "no_password_set",
          "currentPassword"
        );
        return;
      }

      const valid = await compare(currentPassword, dbUser.password_hash);
      if (!valid) {
        sendOpenAIError(
          reply,
          400,
          "Current password is incorrect",
          "invalid_password",
          "currentPassword"
        );
        return;
      }

      const newHash = await hash(newPassword, BCRYPT_ROUNDS);
      await db
        .update(users)
        .set({ password_hash: newHash })
        .where(eq(users.id, sessionUser.id));

      void sendPasswordChangedEmail(dbUser.email).catch((err) => {
        logger.warn(
          { err, userId: sessionUser.id },
          "Failed to send password changed email"
        );
      });

      return reply.status(200).send({ success: true });
    }
  );
}
