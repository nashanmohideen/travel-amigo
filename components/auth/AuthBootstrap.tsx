"use client";

/**
 * AuthBootstrap — silent session rehydration on app mount.
 *
 * Reads the refresh-token cookie and exchanges it for a fresh token pair via
 * POST /api/v1/auth/refresh (lib/api-client bootstrapSession):
 *   - success → setUser with the returned user + access token
 *   - failure / no cookie → logout (no redirect — public pages stay put)
 *
 * Renders nothing; mounted once inside ReduxProvider in app/layout.tsx.
 */

import { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { authLoading, setUser, logout } from "@/features/auth/authSlice";
import { toAuthUser } from "@/features/auth/authHelpers";
import { bootstrapSession } from "@/lib/api-client";

export default function AuthBootstrap() {
  const dispatch = useAppDispatch();
  // React 19 StrictMode double-invokes effects in dev — refresh-token
  // rotation makes the second exchange revoke the first, so run once.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let cancelled = false;
    dispatch(authLoading());

    bootstrapSession().then((session) => {
      if (cancelled) return;
      if (session) {
        dispatch(setUser({ user: toAuthUser(session.user), token: session.accessToken }));
      } else {
        dispatch(logout());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
}
