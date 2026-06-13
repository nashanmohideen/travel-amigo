/**
 * Next.js middleware — coarse auth gate for protected paths.
 *
 * Only checks for the presence of the refresh-token cookie (the frontend
 * mirrors the backend-issued refresh token there; see lib/authCookie.ts).
 * Token validity is established client-side by the silent refresh in
 * AuthBootstrap and the per-route guards (ProtectedRoute / AdminRoute) —
 * admin role checks are client-side only.
 *
 * Public paths (/, /login, /register, /verify-email, /share/*, /shared/*,
 * /itinerary/*, /feedback, …) are never redirected: the matcher below simply
 * doesn't include them.
 */

import { NextRequest, NextResponse } from "next/server";
import { REFRESH_TOKEN_COOKIE } from "@/lib/authCookie";

export function middleware(request: NextRequest) {
  const hasRefreshToken = request.cookies.has(REFRESH_TOKEN_COOKIE);

  if (!hasRefreshToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Cookie present — let the client-side silent refresh validate it
  return NextResponse.next();
}

export const config = {
  // Protected: /trips/*, /profile/* (auth) and /admin/* (auth here; the
  // admin role itself is enforced client-side by AdminRoute)
  matcher: ["/trips/:path*", "/trips", "/profile/:path*", "/profile", "/admin/:path*"],
};
