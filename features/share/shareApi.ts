/**
 * RTK Query endpoints for itinerary sharing.
 *
 * Phase 8 contract standardization: endpoints are defined with standard response types.
 * All sharing still uses localStorage via ShareModal and SharedItineraryView.
 *
 * When backend is ready:
 *   1. Implement backend endpoints at POST /api/share/create-link, GET /api/share/:token/view
 *   2. Wire useCreateShareLinkMutation into ShareModal
 *   3. Wire useGetSharedItineraryQuery into SharedItineraryView
 *   4. Replace localStorage-based links with real UUID-based URLs
 */

import { baseApi } from "@/features/api/baseApi";
import type { GeneratedItinerary } from "@/types";
import type { ShareLinkResponse, CreateShareLinkRequest, ApiDeleteResponse } from "@/features/api/apiTypes";

export const shareApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Create a shareable link for an itinerary.
     *
     * POST /api/v1/share/create-link
     * body: CreateShareLinkRequest { itinerary: GeneratedItinerary }
     * response: ShareLinkResponse { ok: boolean; token: string; url: string; expiresAt?: string }
     *
     * Currently not used (localStorage + mock URL in ShareModal).
     */
    createShareLink: builder.mutation<ShareLinkResponse, CreateShareLinkRequest>({
      query: (payload) => ({
        url: "/share/create-link",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Share"],
    }),

    /**
     * Fetch a shared itinerary by token.
     *
     * GET /api/v1/share/:token/view
     * response: GeneratedItinerary (public, no auth required)
     *
     * Currently not used (localStorage in SharedItineraryView).
     */
    getSharedItinerary: builder.query<GeneratedItinerary, string>({
      query: (token) => `/share/${token}/view`,
      providesTags: (result) => (result ? ["Share"] : []),
    }),

    /**
     * Delete a share link (optional, for future privacy controls).
     *
     * DELETE /api/v1/share/:token
     * response: ApiDeleteResponse { ok: boolean; message?: string }
     *
     * Currently not used.
     */
    deleteShareLink: builder.mutation<ApiDeleteResponse, string>({
      query: (token) => ({
        url: `/share/${token}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Share"],
    }),
  }),
});

export const {
  useCreateShareLinkMutation,
  useGetSharedItineraryQuery,
  useDeleteShareLinkMutation,
} = shareApi;
