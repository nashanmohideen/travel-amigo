/**
 * RTK Query endpoints for feedback operations.
 *
 * Phase 8 contract standardization: endpoints are defined with standard response types.
 * All feedback still uses localStorage via FeedbackForm and FeedbackDashboard.
 *
 * When backend is ready:
 *   1. Implement backend endpoints at POST /api/feedback, GET /api/feedback
 *   2. Wire useSubmitFeedbackMutation into FeedbackForm
 *   3. Wire useGetFeedbackSubmissionsQuery into FeedbackDashboard
 */

import { baseApi } from "@/features/api/baseApi";
import type { FeedbackSubmission } from "@/types";
import type { ApiMutationResponse, ItineraryStatsResponse } from "@/features/api/apiTypes";

/**
 * Request type for submitting feedback.
 * Omits fields that are auto-generated on the server (id, createdAt).
 */
export interface FeedbackInput
  extends Omit<FeedbackSubmission, "id" | "createdAt"> {}

export const feedbackApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Submit new feedback for an itinerary.
     *
     * Future implementation:
     *   POST /api/feedback
     *   body: FeedbackInput
     *   response: ApiMutationResponse { ok: boolean; id?: string; message?: string }
     *
     * Currently not used (localStorage via FeedbackForm).
     */
    submitFeedback: builder.mutation<ApiMutationResponse, FeedbackInput>({
      query: (feedback) => ({
        url: "/feedback",
        method: "POST",
        body: feedback,
      }),
      invalidatesTags: ["Feedback"],
    }),

    /**
     * Fetch all feedback submissions.
     *
     * Future implementation:
     *   GET /api/feedback
     *   response: FeedbackSubmission[]
     *
     * Currently not used (localStorage via FeedbackDashboard).
     */
    getFeedbackSubmissions: builder.query<FeedbackSubmission[], void>({
      query: () => "/feedback",
      providesTags: ["Feedback"],
    }),

    /**
     * Get feedback stats for a specific itinerary.
     *
     * Future implementation:
     *   GET /api/feedback/:itineraryId/stats
     *   response: ItineraryStatsResponse
     *
     * Currently not used.
     */
    getItineraryStats: builder.query<ItineraryStatsResponse, string>({
      query: (itineraryId) => `/feedback/${itineraryId}/stats`,
      providesTags: ["Feedback"],
    }),
  }),
});

export const {
  useSubmitFeedbackMutation,
  useGetFeedbackSubmissionsQuery,
  useGetItineraryStatsQuery,
} = feedbackApi;
