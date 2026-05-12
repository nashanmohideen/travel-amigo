/**
 * Base RTK Query API configuration for Travel Amigo.
 *
 * This is foundation-only; no actual backend endpoints are called yet.
 * The API layer is prepared for Phase 8 backend integration.
 *
 * Configuration:
 *   - Base URL: NEXT_PUBLIC_API_BASE_URL env var, or "/api" fallback
 *   - Credentials: include (for future cookie-based auth)
 *   - TagTypes: entities for cache invalidation
 *
 * Philosophy:
 *   - All reducers and hooks are generated but not yet wired to UI
 *   - localStorage remains the source of truth for now
 *   - When backend endpoints are ready, simply implement endpoint definitions
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ── Configuration ─────────────────────────────────────────────────────────

const baseUrl =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL || "/api"
    : process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

// ── Base Query ────────────────────────────────────────────────────────────

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include", // For future cookie-based auth
  headers: {
    "Content-Type": "application/json",
  },
});

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
  baseQuery,
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
