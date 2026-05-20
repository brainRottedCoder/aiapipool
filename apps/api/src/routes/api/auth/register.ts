import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import { randomInt } from "crypto";
import { resolveMx } from "dns/promises";
import { eq } from "drizzle-orm";
import { RegisterRequestSchema } from "@fluxai/shared";
import { db } from "../../../db/client.js";
import { users, accounts, verificationTokens } from "../../../db/schema.js";
import { sendOpenAIError } from "../../../utils/errors.js";
import { redis } from "../../../redis/client.js";
import { sendVerificationEmail } from "../../../services/email.js";
import pino from "pino";

const logger = pino({ name: "register" });

const BCRYPT_ROUNDS = 12;
const REGISTER_MAX_ATTEMPTS = 3;
const REGISTER_WINDOW_SEC = 15 * 60;
const OTP_EXPIRY_MINUTES = 15;

const DISPOSABLE_DOMAINS = new Set([
  "0-mail.com", "10minutemail.com", "20minutemail.com", "33mail.com",
  "anonaddy.com", "anonmails.de", "bccmail.com", "binkmail.com",
  "byom.de", "candymail.de", "crazymailing.com", "deadaddress.com",
  "discard.email", "discardmail.com", "dispostable.com", "dodsi.com",
  "dropmail.me", "email60.com", "emailondeck.com", "emailsensei.com",
  "fakeinbox.com", "fakemail.net", "getnada.com", "guerrillamail.com",
  "guerrillamail.net", "guerrillamail.org", "harakirimail.com",
  "hushmail.com", "imstations.com", "inboxalias.com", "incognitomail.com",
  "jetable.net", "kasmail.com", "klzlk.com", "mail-temporaire.fr",
  "mailcatch.com", "maildrop.cc", "maildu.de", "mailexpire.com",
  "mailfence.com", "mailinator.com", "mailnesia.com", "mailnull.com",
  "mailsac.com", "mailshiv.com", "mohmal.com", "moakt.cc",
  "moakt.com", "mytemp.email", "no-spam.ws", "nospamfor.us",
  "oneoffemail.com", "opayq.com", "sharklasers.com", "spam4.me",
  "spamgourmet.com", "spamhole.com", "spamspot.com", "spoofmail.de",
  "supere.ml", "temp-mail.org", "tempemail.co", "tempmail.com",
  "tempmail.de", "tempmail.ninja", "tempmails.net", "throwaway.email",
  "throwawaymail.com", "tmpmail.org", "trash-mail.com", "trashmail.com",
  "trashmail.de", "trashmail.net", "txen.de", "wegwerfmail.de",
  "wegwerfmail.net", "wh4f.org", "whyspam.me", "yopmail.com",
  "yopmail.fr", "yopmail.net", "zehnminutenmail.de",
]);

async function checkRegistrationRateLimit(ip: string): Promise<boolean> {
  try {
    const key = `rl:register:${ip}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, REGISTER_WINDOW_SEC);
    }
    return count <= REGISTER_MAX_ATTEMPTS;
  } catch (err) {
    logger.warn({ err, ip }, "Redis unreachable; registration rate limiter failing open");
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

async function checkDomainHasMx(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function registerRoute(app: FastifyInstance): Promise<void> {
  app.post(
    "/register",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const ip = clientIp(request);

      const rateLimited = !(await checkRegistrationRateLimit(ip));
      if (rateLimited) {
        return sendOpenAIError(
          reply,
          429,
          "Too many registration attempts. Try again later.",
          "rate_limit_exceeded",
          null
        );
      }

      const parsed = RegisterRequestSchema.safeParse(request.body);
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

      const { name, email, password } = parsed.data;

      const domain = email.split("@")[1]!;

      if (DISPOSABLE_DOMAINS.has(domain)) {
        return sendOpenAIError(
          reply,
          400,
          "Disposable email addresses are not allowed. Please use a permanent email address.",
          "disposable_email",
          "email"
        );
      }

      const hasMx = await checkDomainHasMx(domain);
      if (!hasMx) {
        return sendOpenAIError(
          reply,
          400,
          "Email domain does not appear to accept mail. Please check the address and try again.",
          "invalid_email_domain",
          "email"
        );
      }

      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        return sendOpenAIError(
          reply,
          409,
          "An account with this email already exists.",
          "email_exists",
          "email"
        );
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const [newUser] = await db
        .insert(users)
        .values({
          email,
          password_hash: passwordHash,
          name,
          status: "active",
        })
        .returning({ id: users.id });

      await db.insert(accounts).values({
        userId: newUser.id,
        type: "credentials",
        provider: "credentials",
        providerAccountId: newUser.id,
      });

      const otp = String(randomInt(100000, 1000000)).padStart(6, "0");
      const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

      await db.insert(verificationTokens).values({
        identifier: email,
        token: otp,
        expires,
      });

      void sendVerificationEmail(email, otp).catch((err) => {
        logger.warn({ err, email }, "Failed to send verification email during registration");
      });

      return reply.status(201).send({ success: true });
    }
  );
}
