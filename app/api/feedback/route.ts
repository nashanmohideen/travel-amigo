/**
 * POST /api/feedback
 * GET /api/feedback
 *
 * Feedback submission and retrieval endpoints.
 *
 * POST: Accept feedback JSON, validate, store in in-memory array, return ApiMutationResponse
 * GET: Return all stored feedback submissions
 *
 * Current implementation: temporary in-memory storage (MVP only)
 * Future: will be replaced by real database
 */

import { validateFeedbackInput } from "@/lib/validation/feedbackValidation";
import { addFeedback, getFeedbackSubmissions } from "@/lib/server/feedbackStore";
import type { ApiError, ApiMutationResponse } from "@/features/api/apiTypes";
import type { FeedbackSubmission } from "@/types";

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
 * POST /api/feedback
 *
 * Submit feedback for an itinerary.
 *
 * Request body: FeedbackInput (all FeedbackSubmission fields except id and createdAt)
 * Response: ApiMutationResponse { ok: boolean; id?: string; message?: string }
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

    // 2. Validate feedback input
    const validation = validateFeedbackInput(body);
    if (!validation.valid) {
      const [error, status] = errorResponse(
        "Invalid feedback input",
        "VALIDATION_ERROR",
        400,
        validation.errors
      );
      return Response.json(error, { status });
    }

    // 3. Add to in-memory store (body is now validated)
    const submission = addFeedback(body as any);

    // 4. Return success response
    const response: ApiMutationResponse = {
      ok: true,
      id: submission.id,
      message: "Feedback submitted",
    };

    return Response.json(response, { status: 201 });
  } catch (err) {
    // Unexpected error — log for debugging, but don't expose details
    console.error("Failed to process feedback:", err);

    const error: ApiError = {
      message: "Failed to process feedback",
      code: "FEEDBACK_PROCESSING_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}

// ── GET Handler ────────────────────────────────────────────────────────────

/**
 * GET /api/feedback
 *
 * Retrieve all feedback submissions.
 *
 * Response: FeedbackSubmission[]
 * Status: 200 on success, 500 on server error
 */
export async function GET(): Promise<Response> {
  try {
    const submissions: FeedbackSubmission[] = getFeedbackSubmissions();
    return Response.json(submissions, { status: 200 });
  } catch (err) {
    // Unexpected error
    console.error("Failed to retrieve feedback:", err);

    const error: ApiError = {
      message: "Failed to retrieve feedback",
      code: "FEEDBACK_RETRIEVAL_FAILED",
    };

    return Response.json(error, { status: 500 });
  }
}
