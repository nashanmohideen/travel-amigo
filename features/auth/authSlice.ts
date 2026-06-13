/**
 * authSlice — single source of truth for the logged-in user.
 *
 * The access token lives here and in lib/api-client's in-memory store only —
 * never localStorage. Session persistence works via the silent refresh in
 * components/auth/AuthBootstrap.tsx (setUser on success, logout on failure).
 *
 * Side effects stay outside reducers (repo rule): callers are responsible for
 * calling setAuthTokens/clearAuthTokens on lib/api-client alongside the
 * loginSuccess/setUser/logout dispatches.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ── Types ─────────────────────────────────────────────────────────────────────

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  user: AuthUser | null;
  /** In-memory only, never localStorage. */
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  status: "idle",
  error: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.status = "loading";
      state.error = null;
    },

    loginSuccess(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.status = "authenticated";
      state.error = null;
    },

    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.error = action.payload;
    },

    registerStart(state) {
      state.status = "loading";
      state.error = null;
    },

    /** Registration does not log the user in — email is still unverified. */
    registerSuccess(state) {
      state.status = "unauthenticated";
      state.error = null;
    },

    registerFailure(state, action: PayloadAction<string>) {
      state.status = "unauthenticated";
      state.error = action.payload;
    },

    /** Caller must also call clearAuthTokens() on lib/api-client. */
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
      state.error = null;
    },

    /** App-load rehydration from the silent refresh-token exchange. */
    setUser(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.token;
      state.status = "authenticated";
      state.error = null;
    },

    /** Mark the silent refresh as in flight so guards show a spinner. */
    authLoading(state) {
      state.status = "loading";
    },

    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  setUser,
  authLoading,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
