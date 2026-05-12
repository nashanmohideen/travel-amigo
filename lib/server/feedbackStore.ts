/**
 * Temporary in-memory feedback storage for MVP backend wiring.
 *
 * This is a development-only store that holds feedback submissions in memory.
 * It persists only for the lifetime of the Node.js process.
 *
 * IMPORTANT: This is NOT production-ready persistence.
 * Future phases will replace this with a real database (Postgres, Supabase, etc.).
 *
 * Usage:
 *   - Server-side only (imported in app/api/feedback/route.ts)
 *   - Do NOT import into client components or hooks
 *   - Do NOT use localStorage or browser APIs here
 */

import type { FeedbackSubmission } from "@/types";
import type { FeedbackInput } from "@/features/feedback/feedbackApi";

/** Module-level in-memory array. Shared across all API calls within the same process. */
let feedbackSubmissions: FeedbackSubmission[] = [];

/**
 * Add a new feedback submission to the in-memory store.
 *
 * @param input - Validated feedback input (everything except id and createdAt)
 * @returns The created FeedbackSubmission with auto-generated id and createdAt
 */
export function addFeedback(input: FeedbackInput): FeedbackSubmission {
  // Generate a unique ID using Node.js crypto (available in Next.js server context)
  const id =
    Math.random().toString(36).substring(2, 11) +
    Math.random().toString(36).substring(2, 11);

  const now = new Date().toISOString();

  const submission: FeedbackSubmission = {
    id,
    createdAt: now,
    ...input,
  };

  feedbackSubmissions.push(submission);
  return submission;
}

/**
 * Get all stored feedback submissions.
 *
 * @returns Array of all FeedbackSubmission objects in the store.
 */
export function getFeedbackSubmissions(): FeedbackSubmission[] {
  return [...feedbackSubmissions]; // Return a copy to prevent external mutation
}

/**
 * Clear all feedback submissions (development/testing only).
 * Not exposed via API.
 */
export function clearFeedbackSubmissions(): void {
  feedbackSubmissions = [];
}
