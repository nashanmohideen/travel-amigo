/**
 * GET /api/itineraries/[id]
 *
 * Retrieve a saved itinerary by ID.
 *
 * Response: GeneratedItinerary object
 * Status: 200 on success, 400 if id missing, 404 if not found, 500 on error
 *
 * Current implementation: temporary in-memory storage (MVP only)
 * Future: will be replaced by real database
 */

import { getItinerary } from "@/lib/server/itineraryStore";
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
 * GET /api/itineraries/[id]
 *
 * Retrieve a saved itinerary by ID.
 *
 * Response: GeneratedItinerary object
 * Status: 200 on success, 400 if id missing, 404 if not found, 500 on error
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
): Promise<Response> {
  try {
    // 1. Extract id from URL params (Next.js 16 async params pattern)
    const params = await context.params;
    const id = params.id;

    if (!id) {
      const [error, status] = errorResponse(
        "Missing itinerary id",
        "MISSING_ITINERARY_ID",
        400
      );
      return Response.json(error, { status });
    }

    // 2. Look up in itinerary store
    const itinerary = getItinerary(id);

    if (!itinerary) {
      const [error, status] = errorResponse(
        "Itinerary not found",
        "ITINERARY_NOT_FOUND",
        404
      );
      return Response.json(error, { status });
    }

    // 3. Return the itinerary directly
    const response: GeneratedItinerary = itinerary;
    return Response.json(response, { status: 200 });
  } catch (err) {
    // Unexpected error
    console.error("Failed to retrieve itinerary:", err);

    const error: ApiError = {
      message: "Failed to retrieve itinerary",
      code: "ITINERARY_RETRIEVE_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
