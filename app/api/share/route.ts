/**
 * POST /api/share
 *
 * Create a shareable link for an itinerary.
 *
 * Accepts a GeneratedItinerary, stores it in the in-memory share store,
 * generates a share token, and returns a ShareLinkResponse.
 *
 * Current implementation: temporary in-memory storage (MVP only)
 * Future: will be replaced by real database
 */

import { isValidItinerary } from "@/lib/itinerary/itineraryHelpers";
import { createShareRecord } from "@/lib/server/shareStore";
import type { ApiError } from "@/features/api/apiTypes";
import type { ShareLinkResponse } from "@/features/api/apiTypes";
import type { GeneratedItinerary } from "@/types";

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
 * POST /api/share
 *
 * Create a share link for an itinerary.
 *
 * Request body: { itinerary: GeneratedItinerary }
 * Response: ShareLinkResponse { ok: true; token: string; url: string; expiresAt?: string | null }
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
        "Malformed JSON in request body",
        "INVALID_JSON",
        400
      );
      return Response.json(error, { status });
    }

    // 2. Extract and validate itinerary
    if (!body || typeof body !== "object") {
      const [error, status] = errorResponse(
        "Request body must be a non-null object",
        "INVALID_REQUEST",
        400
      );
      return Response.json(error, { status });
    }

    const bodyObj = body as Record<string, unknown>;
    const itinerary = bodyObj.itinerary;

    // 3. Validate that itinerary is a valid GeneratedItinerary
    if (!isValidItinerary(itinerary)) {
      const [error, status] = errorResponse(
        "Invalid share itinerary",
        "VALIDATION_ERROR",
        400
      );
      return Response.json(error, { status });
    }

    // 4. Create share record and generate token
    const record = createShareRecord(itinerary);

    // 5. Build public share URL
    // Prefer /shared/{token} route for the UI
    const host = request.headers.get("host") || "localhost:3000";
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${protocol}://${host}`;
    const publicUrl = `${baseUrl}/shared/${record.token}`;

    // 6. Return success response
    const response: ShareLinkResponse = {
      ok: true,
      token: record.token,
      url: publicUrl,
      expiresAt: record.expiresAt,
    };

    return Response.json(response, { status: 201 });
  } catch (err) {
    // Unexpected error — log for debugging, but don't expose details
    console.error("Failed to create share link:", err);

    const error: ApiError = {
      message: "Failed to create share link",
      code: "SHARE_CREATE_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
