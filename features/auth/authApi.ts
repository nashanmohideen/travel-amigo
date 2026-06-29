/**
 * RTK Query endpoints for the auth module (NestJS AuthModule, /api/v1/auth).
 *
 * All endpoints run through the shared axios apiClient, so errors arrive in
 * the standard ApiError shape ({ message, code, details? }).
 *
 * Contract notes (verified against the backend):
 *   - login/register/refresh all return { accessToken, refreshToken, user }
 *   - login returns 403 with code EMAIL_NOT_VERIFIED for unverified accounts
 *   - logout is POST (not DELETE) and requires a Bearer token
 *   - resend-verification accepts { email } and always returns 200
 */

import { baseApi } from "@/features/api/baseApi";
import type { ApiSuccessResponse } from "@/features/api/apiTypes";
import type { AuthUserPayload } from "@/lib/api-client";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
}

export interface CredentialsInput {
  email: string;
  password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** POST /api/v1/auth/login */
    login: builder.mutation<AuthResponse, CredentialsInput>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["User", "Trip"],
    }),

    /** POST /api/v1/auth/register — creates the account + queues the verification email. */
    register: builder.mutation<AuthResponse, CredentialsInput>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    /** POST /api/v1/auth/verify-email { token } */
    verifyEmail: builder.mutation<ApiSuccessResponse, { token: string }>({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    /** POST /api/v1/auth/resend-verification { email } — always returns 200. */
    resendVerification: builder.mutation<ApiSuccessResponse, { email: string }>({
      query: (body) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body,
      }),
    }),

    /** POST /api/v1/auth/logout — revokes the stored refresh token server-side. */
    logout: builder.mutation<ApiSuccessResponse, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useLogoutMutation,
} = authApi;
