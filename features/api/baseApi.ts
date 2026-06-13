/**
 * Base RTK Query API configuration for Travel Amigo.
 *
 * All requests are executed through the shared axios instance in
 * lib/api-client.ts, which targets the NestJS backend
 * (NEXT_PUBLIC_API_URL + /api/v1) and handles:
 *   - access-token attachment (in-memory store, not localStorage)
 *   - 401 → refresh-token rotation → single retry → /login redirect
 *
 * Errors surface in the standard ApiError shape returned by the backend
 * ({ message, code, details? }), matching features/api/apiTypes.ts.
 */

import { createApi, type BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { AxiosError, type AxiosRequestConfig } from "axios";
import { apiClient } from "@/lib/api-client";
import type { ApiError } from "@/features/api/apiTypes";

// ── Axios-backed base query ───────────────────────────────────────────────

interface AxiosBaseQueryArgs {
  url: string;
  method?: AxiosRequestConfig["method"];
  body?: unknown;
  params?: AxiosRequestConfig["params"];
}

const axiosBaseQuery: BaseQueryFn<
  AxiosBaseQueryArgs | string,
  unknown,
  { status?: number; data: ApiError }
> = async (args) => {
  const config: AxiosBaseQueryArgs = typeof args === "string" ? { url: args } : args;
  try {
    const result = await apiClient.request({
      url: config.url,
      method: config.method ?? "GET",
      data: config.body,
      params: config.params,
    });
    return { data: result.data };
  } catch (err) {
    const axiosError = err as AxiosError<ApiError>;
    return {
      error: {
        status: axiosError.response?.status,
        data: axiosError.response?.data ?? {
          message: axiosError.message,
          code: "NETWORK_ERROR",
        },
      },
    };
  }
};

// ── Tag Types ─────────────────────────────────────────────────────────────

/**
 * Entities for cache invalidation.
 * Used to automatically refetch or invalidate cache after mutations.
 */
export const tagTypes = [
  "Itinerary",   // Generated and edited itineraries
  "Trip",        // Trip drafts and preferences
  "Share",       // Shared itinerary links
  "Feedback",    // Feedback submissions and analytics
  "Place",       // Points of interest
  "Destination", // Destination data
  "User",        // User profile (future auth)
] as const;

// ── API Definition ────────────────────────────────────────────────────────

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery,
  tagTypes,
  endpoints: () => ({}),
});

/**
 * Export the middleware for Redux store setup.
 * Add to store configuration:
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(baseApi.middleware)
 */
export const { middleware: baseApiMiddleware } = baseApi;
