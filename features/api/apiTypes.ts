/**
 * Shared API contract types for Travel Amigo.
 *
 * Standard response shapes, error types, and validation results used across
 * all RTK Query endpoints. This ensures consistency between frontend and
 * backend API contracts.
 *
 * Philosophy:
 *   - Reuse domain types (TripInput, GeneratedItinerary, etc.) from types/index.ts
 *   - Use these contract types for API boundaries only
 *   - Keep type flatter for JSON serialization
 */

// ── Error Handling ────────────────────────────────────────────────────────

/**
 * Standard API error object.
 * Returned when an endpoint fails.
 */
export interface ApiError {
  /** Human-readable error message */
  message: string;
  /** Machine-readable error code (e.g., "VALIDATION_ERROR", "NOT_FOUND") */
  code?: string;
  /** Additional context (could be validation errors, stack trace in dev, etc.) */
  details?: unknown;
}

// ── Success Responses ──────────────────────────────────────────────────────

/**
 * Standard success response envelope.
 * Indicates the operation completed without error.
 */
export interface ApiSuccessResponse {
  ok: true;
  message?: string;
}

/**
 * Generic mutation response with resource ID.
 * Used for create/update operations that generate a resource ID.
 */
export interface ApiMutationResponse {
  ok: boolean;
  id?: string;
  message?: string;
}

/**
 * Generic list response with optional pagination.
 * Used for query endpoints that return collections.
 */
export interface ApiListResponse<T> {
  items: T[];
  /** Total count (useful for pagination; may be omitted if not paginating) */
  total?: number;
}

/**
 * Generic delete/success response.
 * Used for DELETE endpoints.
 */
export interface ApiDeleteResponse {
  ok: boolean;
  message?: string;
}

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Single field validation error.
 */
export interface ApiValidationError {
  field: string;
  message: string;
}

/**
 * Result of validating a request payload.
 */
export interface ApiValidationResult {
  valid: boolean;
  errors: ApiValidationError[];
}

// ── Domain-Specific Responses ──────────────────────────────────────────────

/**
 * Response from creating or getting a shareable link.
 */
export interface ShareLinkResponse {
  ok: boolean;
  token: string;
  url: string;
  /** ISO string or null if no expiration */
  expiresAt?: string | null;
}

/**
 * Response from saving/persisting an itinerary to backend.
 */
export interface SaveItineraryResponse {
  ok: boolean;
  id: string;
  message?: string;
}

/**
 * Statistics for feedback on a specific itinerary.
 */
export interface ItineraryStatsResponse {
  count: number;
  avgUsefulnessRating: number;
  wouldUseBreakdown: Record<string, number>;
  topWantedFeatures?: string[];
}

// ── Request Input Types ────────────────────────────────────────────────────

/**
 * Payload for creating a share link.
 * Wraps the itinerary to be shared.
 */
export interface CreateShareLinkRequest {
  itinerary: import("@/types").GeneratedItinerary;
}
