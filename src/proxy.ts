import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isPortalRole } from "@/lib/portal";

/**
 * Next.js 16 proxy (formerly middleware).
 * - /admin/* → ADMIN only (except login)
 * - /portal/* → CUSTOMER or ADMIN (except login)
 */
export const proxy = auth((req) => {
  const path = req.nextUrl.pathname;
  const role = req.auth?.user?.role;

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
          callback?.startsWith("/portal") && !callback.startsWith("/portal/login")
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
});

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
