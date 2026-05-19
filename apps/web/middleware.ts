import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hasDashboardSession } from "@/lib/session-cookies";

const ADMIN_SESSION_COOKIE = "flux-admin.session-token";

function hasAdminSession(req: NextRequest): boolean {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  return Boolean(token?.length);
}

export default function middleware(req: NextRequest) {
  const isLoggedIn = hasDashboardSession(req);
  const pathname = req.nextUrl.pathname;

  if (pathname === "/admin/login") {
    if (hasAdminSession(req)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!hasAdminSession(req)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/settings") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (
    isLoggedIn &&
    (pathname === "/login" || pathname === "/register" || pathname.startsWith("/forgot-password"))
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/admin/login",
    "/login",
    "/register",
    "/forgot-password",
  ],
};
