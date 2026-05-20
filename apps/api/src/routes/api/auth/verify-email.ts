import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { eq, and, gt } from "drizzle-orm";
import { VerifyEmailRequestSchema } from "@fluxai/shared";
import { db } from "../../../db/client.js";
import { users, verificationTokens } from "../../../db/schema.js";
import { sendOpenAIError } from "../../../utils/errors.js";
import { redis } from "../../../redis/client.js";
import pino from "pino";

const logger = pino({ name: "verify-email" });

const VERIFY_MAX_ATTEMPTS = 5;
const VERIFY_WINDOW_SEC = 15 * 60;

async function checkVerifyRateLimit(identifier: string): Promise<boolean> {
  try {
    const key = `rl:verify-email:${identifier}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, VERIFY_WINDOW_SEC);
    }
    return count <= VERIFY_MAX_ATTEMPTS;
  } catch (err) {
    logger.warn({ err, identifier }, "Redis unreachable; verify-email rate limiter failing open");
    return true;
  }
}

export async function verifyEmailRoute(app: FastifyInstance): Promise<void> {
  app.post(
    "/verify-email",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = VerifyEmailRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        const issue = parsed.error.issues[0];
        return sendOpenAIError(
          reply,
          400,
          issue?.message ?? "Invalid request",
          "invalid_request",
          issue?.path.length ? issue.path.join(".") : null
        );
      }

      const { email, otp } = parsed.data;

      const rateLimited = !(await checkVerifyRateLimit(email));
      if (rateLimited) {
        return sendOpenAIError(
          reply,
          429,
          "Too many verification attempts. Try again later.",
          "rate_limit_exceeded",
          "email"
        );
      }

      const tokenRows = await db
        .select()
        .from(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, otp),
            gt(verificationTokens.expires, new Date())
          )
        )
        .limit(1);

      if (tokenRows.length === 0) {
        return sendOpenAIError(
          reply,
          400,
          "Invalid or expired verification code.",
          "invalid_otp",
          "otp"
        );
      }

      await db
        .update(users)
        .set({ emailVerified: new Date() })
        .where(eq(users.email, email));

      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.token, otp)
          )
        );

      return reply.status(200).send({ success: true, verified: true });
    }
  );
}
