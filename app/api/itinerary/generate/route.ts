/**
 * POST /api/itinerary/generate
 *
 * Server-side itinerary generation endpoint.
 *
 * Accepts a TripInput JSON request body and returns a GeneratedItinerary.
 * Validates input and handles errors with standard API error responses.
 *
 * This endpoint can be called from:
 *   - RTK Query mutations (when wired in Phase 10)
 *   - Direct fetch calls
 *   - Future server components
 *
 * Example request:
 *   POST /api/itinerary/generate
 *   Content-Type: application/json
 *   {
 *     "destination": "ella",
 *     "duration": 3,
 *     "travelers": 2,
 *     "budgetLKR": 75000,
 *     "travelStyle": "balanced",
 *     "interests": ["nature", "photography"],
 *     "transportMode": "mixed",
 *     "pace": "balanced"
 *   }
 *
 * Success response (200):
 *   GeneratedItinerary { id, title, destination, tripInput, days[], budget, ... }
 *
 * Error responses:
 *   400: Malformed JSON or invalid TripInput
 *   500: Unexpected server error
 */

import { generateItinerary } from "@/lib/generateItinerary";
import { validateTripInput } from "@/lib/validation/tripValidation";
import type { TripInput, GeneratedItinerary } from "@/types";
import type { ApiError } from "@/features/api/apiTypes";

// ── Type guards ────────────────────────────────────────────────────────────

/**
 * Parse and validate the request body as TripInput.
 */
function parseRequestBody(body: unknown): TripInput | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const obj = body as Record<string, unknown>;

  // Basic safety checks — ensure all required fields exist
  // Full validation happens in validateTripInput
  const required = [
    "destination",
    "duration",
    "travelers",
    "budgetLKR",
    "travelStyle",
    "interests",
    "transportMode",
    "pace",
  ];

  for (const field of required) {
    if (!(field in obj)) {
      return null;
    }
  }

  return obj as unknown as TripInput;
}

// ── Error response helper ─────────────────────────────────────────────────

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

// ── Handler ──────────────────────────────────────────────────────────────

/**
 * POST /api/itinerary/generate
 *
 * Main request handler.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // 1. Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      const [error, status] = errorResponse(
        "Malformed JSON in request body",
        "INVALID_JSON",
        400
      );
      return Response.json(error, { status });
    }

    // 2. Extract TripInput from body
    const tripInput = parseRequestBody(body);
    if (!tripInput) {
      const [error, status] = errorResponse(
        "Missing required fields in request body",
        "MISSING_FIELDS",
        400
      );
      return Response.json(error, { status });
    }

    // 3. Validate TripInput
    const validation = validateTripInput(tripInput);
    if (!validation.valid) {
      const [error, status] = errorResponse(
        "Invalid trip input",
        "VALIDATION_ERROR",
        400,
        validation.errors
      );
      return Response.json(error, { status });
    }

    // 4. Generate itinerary
    const itinerary: GeneratedItinerary = generateItinerary(tripInput);

    // 5. Return success
    return Response.json(itinerary, { status: 200 });
  } catch (err) {
    // Unexpected error — log for debugging, but don't expose details
    console.error("Failed to generate itinerary:", err);

    const error: ApiError = {
      message: "Failed to generate itinerary",
      code: "ITINERARY_GENERATION_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
