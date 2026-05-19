import { cookies } from "next/headers";
import { SESSION_COOKIE_NAMES } from "@/lib/session-cookies";

/** Exposes the database session token for cross-origin API Bearer auth (httpOnly cookie). */
export async function GET() {
  const store = await cookies();

  for (const name of SESSION_COOKIE_NAMES) {
    const cookie = store.get(name);
    if (cookie?.value) {
      return Response.json({ token: cookie.value });
    }
  }

  return Response.json(
    { error: { message: "Not authenticated", type: "authentication_error", code: null, param: null } },
    { status: 401 }
  );
}
