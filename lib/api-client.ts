/**
 * Axios API client for the Travel Amigo NestJS backend.
 *
 * - Base URL: NEXT_PUBLIC_API_URL env var (backend origin, e.g.
 *   http://localhost:3001) + the backend's /api/v1 prefix.
 * - Request interceptor: attaches the access token from the in-memory token
 *   store (never localStorage — tokens do not survive a refresh by design).
 * - Response interceptor: on 401 for an authenticated session, calls
 *   POST /auth/refresh once, retries the original request, and redirects to
 *   /login if the retry fails. Guest requests (no tokens held) pass 401s
 *   through untouched so guest flows keep working.
 */

import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import {
  readRefreshTokenCookie,
  writeRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "@/lib/authCookie";

// ── In-memory token store ──────────────────────────────────────────────────

let accessToken: string | null = null;
let refreshToken: string | null = null;

/**
 * Store the token pair returned by /auth/login, /auth/register, /auth/refresh.
 * The refresh token is mirrored into a cookie so the session survives a page
 * reload (see lib/authCookie.ts) — the access token stays in memory only.
 */
export function setAuthTokens(tokens: { accessToken: string; refreshToken: string }): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
  writeRefreshTokenCookie(tokens.refreshToken);
}

/** Drop both tokens (logout / refresh failure). */
export function clearAuthTokens(): void {
  accessToken = null;
  refreshToken = null;
  clearRefreshTokenCookie();
}

/** True when the client holds an authenticated session. */
export function hasAuthSession(): boolean {
  return accessToken !== null;
}

/** User payload returned alongside every backend token pair. */
export interface AuthUserPayload {
  id: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

/**
 * Silent session rehydration on app mount: read the refresh-token cookie and
 * trade it for a fresh token pair. Returns the user + access token on
 * success, null when there is no cookie or the token was rejected (the
 * cookie is cleared then).
 */
export async function bootstrapSession(): Promise<{
  user: AuthUserPayload;
  accessToken: string;
} | null> {
  const cookieToken = readRefreshTokenCookie();
  if (!cookieToken) return null;
  try {
    const res = await axios.post<{
      accessToken: string;
      refreshToken: string;
      user: AuthUserPayload;
    }>(`${API_ORIGIN}/api/v1/auth/refresh`, { refreshToken: cookieToken });
    setAuthTokens(res.data);
    return { user: res.data.user, accessToken: res.data.accessToken };
  } catch {
    clearAuthTokens();
    return null;
  }
}

// ── Axios instance ─────────────────────────────────────────────────────────

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const apiClient = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

/** Single in-flight refresh shared by concurrent 401s. */
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!refreshToken) return false;
  refreshPromise ??= axios
    .post<{ accessToken: string; refreshToken: string }>(
      `${API_ORIGIN}/api/v1/auth/refresh`,
      { refreshToken }
    )
    .then((res) => {
      setAuthTokens(res.data);
      return true;
    })
    .catch(() => {
      clearAuthTokens();
      return false;
    })
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    // Only intercept 401s for authenticated sessions; guests pass through
    if (error.response?.status !== 401 || !original || original._retried || !refreshToken) {
      throw error;
    }

    original._retried = true;
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiClient.request(original);
    }

    // Second failure: session is gone — send the user to login
    if (typeof window !== "undefined") {
      window.location.assign("/login");
    }
    throw error;
  }
);
