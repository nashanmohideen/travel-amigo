/**
 * POST /api/itineraries
 *
 * Save/persist a generated or edited itinerary to the backend.
 *
 * Request body: GeneratedItinerary
 * Response: SaveItineraryResponse { ok: boolean; id: string; message?: string }
 * Status: 201 on success, 400 on validation error, 500 on server error
 *
 * Current implementation: temporary in-memory storage (MVP only)
 * Future: will be replaced by real database
 */

import { saveItinerary } from "@/lib/server/itineraryStore";
import { isValidItinerary } from "@/lib/itinerary/itineraryHelpers";
import type { ApiError, SaveItineraryResponse } from "@/features/api/apiTypes";

// ── Error response helper ──────────────────────────────────────────────────

function errorResponse(
  message: string,
  code: string,
  status: 400 | 500,
  details?: unknown
): [ApiError, number] {
  const error: ApiError = { message, code };
  if (details) {
    error.details = details;
  }
  return [error, status];
}

// ── POST Handler ───────────────────────────────────────────────────────────

/**
 * POST /api/itineraries
 *
 * Save an itinerary.
 *
 * Request body: GeneratedItinerary
 * Response: SaveItineraryResponse { ok: boolean; id: string; message?: string }
 * Status: 201 on success, 400 on validation error, 500 on server error
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const [error, status] = errorResponse(
        "Invalid JSON body",
        "INVALID_JSON",
        400
      );
      return Response.json(error, { status });
    }

    // 2. Validate itinerary shape
    if (!isValidItinerary(body)) {
      const [error, status] = errorResponse(
        "Invalid itinerary input",
        "VALIDATION_ERROR",
        400
      );
      return Response.json(error, { status });
    }

    // 3. Save to in-memory store
    const savedItinerary = saveItinerary(body);

    // 4. Return success response
    const response: SaveItineraryResponse = {
      ok: true,
      id: savedItinerary.id,
      message: "Itinerary saved",
    };

    return Response.json(response, { status: 201 });
  } catch (err) {
    // Unexpected error — log for debugging, but don't expose details
    console.error("Failed to save itinerary:", err);

    const error: ApiError = {
      message: "Failed to save itinerary",
      code: "ITINERARY_SAVE_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
