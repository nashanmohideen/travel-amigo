/**
 * Refresh-token cookie helpers.
 *
 * The NestJS backend returns the refresh token in the JSON body (it does not
 * set an httpOnly cookie), so the frontend mirrors it into this cookie to
 * survive page reloads:
 *   - app mount: AuthBootstrap reads the cookie and silently calls
 *     POST /api/v1/auth/refresh to rehydrate the session
 *   - middleware.ts: checks for the cookie's presence on protected paths
 *
 * The access token is never persisted anywhere — in-memory only.
 *
 * Security note: because this cookie is written from JS it cannot be
 * httpOnly. Moving refresh-token storage to a backend-set httpOnly cookie
 * would be strictly better and removes this file entirely.
 *
 * This module must stay dependency-free: middleware.ts (edge runtime)
 * imports REFRESH_TOKEN_COOKIE from here.
 */

export const REFRESH_TOKEN_COOKIE = "ta_refresh_token" as const;

/** Refresh tokens expire server-side after 7 days — match that here. */
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export function readRefreshTokenCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
  return match ? decodeURIComponent(match.slice(REFRESH_TOKEN_COOKIE.length + 1)) : null;
}

export function writeRefreshTokenCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${REFRESH_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearRefreshTokenCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFRESH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
