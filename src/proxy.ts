import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isPortalRole } from "@/lib/portal";

/**
 * Next.js 16 proxy (formerly middleware).
 * - /admin/* → ADMIN only (except login)
 * - /portal/* → CUSTOMER or ADMIN (except login)
 *
 * Uses getToken (JWT) instead of the auth() wrapper so Netlify/OpenNext
 * receives a normal async request handler ("nextHandler is not a function").
 */
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    // Auth.js v5 cookie names; secure prefix on HTTPS (Netlify)
    secureCookie: req.nextUrl.protocol === "https:",
  });

  const role =
    typeof token?.role === "string"
      ? token.role
      : typeof (token as { role?: string } | null)?.role === "string"
        ? (token as { role: string }).role
        : undefined;

  // ── Admin ──────────────────────────────────────────────────────────────
  if (path.startsWith("/admin")) {
    const isLogin =
      path === "/admin/login" || path.startsWith("/admin/login/");
    const isAdmin = role === "ADMIN";

    if (isLogin) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl));
      }
      return NextResponse.next();
    }

    if (!isAdmin) {
      const login = new URL("/admin/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  // ── Customer portal ────────────────────────────────────────────────────
  if (path.startsWith("/portal")) {
    const isLogin =
      path === "/portal/login" || path.startsWith("/portal/login/");
    const allowed = isPortalRole(role);

    if (isLogin) {
      if (allowed) {
        const callback = req.nextUrl.searchParams.get("callbackUrl");
        const dest =
          callback?.startsWith("/portal") &&
          !callback.startsWith("/portal/login")
            ? callback
            : "/portal";
        return NextResponse.redirect(new URL(dest, req.nextUrl.origin));
      }
      return NextResponse.next();
    }

    if (!allowed) {
      const login = new URL("/portal/login", req.nextUrl.origin);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
