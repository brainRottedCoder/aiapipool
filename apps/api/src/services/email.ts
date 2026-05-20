import { Resend } from "resend";
import { env } from "../config/env.js";
import pino from "pino";

const logger = pino({ name: "email" });

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) {
    logger.warn("RESEND_API_KEY not set; skipping email send");
    return null;
  }
  return new Resend(env.RESEND_API_KEY);
}

const from = env.FROM_EMAIL;

/**
 * Sends a one-time verification code to the user's email address.
 * Best-effort: missing API key in dev logs a warning and returns without throwing.
 */
export async function sendVerificationEmail(to: string, otp: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const { error } = await resend.emails.send({
    from,
    to,
    subject: "Verify your email — FluxAI Gateway",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Verify your email address</h2>
        <p>Thanks for signing up for FluxAI Gateway. Use the code below to verify your email:</p>
        <div style="background: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; font-family: monospace;">${otp}</span>
        </div>
        <p style="color: #71717a; font-size: 14px;">This code expires in 15 minutes. If you did not create this account, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    logger.warn({ error, to }, "Failed to send verification email");
  }
}

/**
 * Sends a notification when the user changes their password.
 * Best-effort: missing API key in dev logs a warning and returns without throwing.
 */
export async function sendPasswordChangedEmail(to: string): Promise<void> {
  const resend = getResend();
  if (!resend) return;

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
