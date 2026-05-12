/**
 * Centralised localStorage key constants for Travel Amigo.
 *
 * All localStorage reads and writes must use these constants — never
 * inline string literals. This makes it safe to rename a key in one place
 * and guarantees no typo-driven key mismatches across components.
 *
 * Keys in use during the prototype phase:
 *   ta_trip_input             — TripInput saved by /plan form
 *   ta_edited_itinerary       — User-edited GeneratedItinerary
 *   ta_shared_itinerary_demo  — Itinerary written by ShareModal, read by /shared/demo
 *   ta_feedback_submissions   — Array of FeedbackSubmission objects
 *
 * MVP migration note:
 *   ta_trip_input and ta_edited_itinerary will be replaced by server-side
 *   persistence once auth + DB are added (Phase 4).
 *   ta_shared_itinerary_demo will be replaced by a real UUID share endpoint.
 *   ta_feedback_submissions will be replaced by POST /api/feedback.
 */

export const LS_TRIP_INPUT = "ta_trip_input" as const;
export const LS_EDITED_ITINERARY = "ta_edited_itinerary" as const;
export const LS_SHARED_ITINERARY_DEMO = "ta_shared_itinerary_demo" as const;
export const LS_FEEDBACK_SUBMISSIONS = "ta_feedback_submissions" as const;
