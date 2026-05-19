import { Resend } from "resend";
import { env } from "../config/env.js";
import pino from "pino";

const logger = pino({ name: "email" });

/**
 * Sends a notification when the user changes their password.
 * Best-effort: missing API key in dev logs a warning and returns without throwing.
 */
export async function sendPasswordChangedEmail(to: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set; skipping password changed email");
    return;
  }

  const from = env.FROM_EMAIL;
  const resend = new Resend(env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Your FluxAI password was changed",
    html: `
      <p>Hello,</p>
      <p>Your FluxAI Gateway account password was successfully changed.</p>
      <p>If you did not make this change, please contact support immediately.</p>
      <p>— FluxAI Gateway</p>
    `,
  });

  if (error) {
    logger.warn({ error, to }, "Failed to send password changed email");
  }
}
