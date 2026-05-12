/**
 * GET /api/share/[token]
 *
 * Retrieve a shared itinerary by token.
 *
 * Looks up the token in the in-memory share store and returns the
 * GeneratedItinerary if found.
 *
 * Current implementation: temporary in-memory storage (MVP only)
 * Future: will be replaced by real database
 */

import { getShareRecord } from "@/lib/server/shareStore";
import type { ApiError } from "@/features/api/apiTypes";
import type { GeneratedItinerary } from "@/types";

// ── Error response helper ──────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: string,
  status: 400 | 404 | 500
): [ApiError, number] {
  const error: ApiError = { message, code };
  return [error, status];
}

// ── GET Handler ────────────────────────────────────────────────────────────

/**
 * GET /api/share/[token]
 *
 * Retrieve a shared itinerary.
 *
 * Response: GeneratedItinerary object
 * Status: 200 on success, 400 if token missing, 404 if not found, 500 on error
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
): Promise<Response> {
  try {
    // 1. Extract token from URL params
    const params = await context.params;
    const token = params.token;

    if (!token) {
      const [error, status] = errorResponse(
        "Missing share token",
        "MISSING_TOKEN",
        400
      );
      return Response.json(error, { status });
    }

    // 2. Look up in share store
    const record = getShareRecord(token);

    if (!record) {
      const [error, status] = errorResponse(
        "Shared itinerary not found",
        "SHARE_NOT_FOUND",
        404
      );
      return Response.json(error, { status });
    }

    // 3. Return the itinerary directly
    const itinerary: GeneratedItinerary = record.itinerary;
    return Response.json(itinerary, { status: 200 });
  } catch (err) {
    // Unexpected error
    console.error("Failed to retrieve shared itinerary:", err);

    const error: ApiError = {
      message: "Failed to retrieve shared itinerary",
      code: "SHARE_RETRIEVE_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
