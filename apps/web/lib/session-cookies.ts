import type { NextRequest } from "next/server";

/** Auth.js v5 and legacy NextAuth v4 session cookie names. */
export const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
] as const;

/** Edge-safe check: dashboard session cookie present (existence only, no DB). */
export function hasDashboardSession(req: NextRequest): boolean {
  return SESSION_COOKIE_NAMES.some((name) => Boolean(req.cookies.get(name)?.value));
}

/** Read the dashboard session token from a Cookie header value. */
export function parseSessionTokenFromCookieHeader(
  cookieHeader: string | undefined | null
): string | undefined {
  if (!cookieHeader) return undefined;

  for (const name of SESSION_COOKIE_NAMES) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = cookieHeader.match(new RegExp(`${escaped}=([^;]+)`));
    if (match?.[1]) return decodeURIComponent(match[1]);
  }

  return undefined;
}
