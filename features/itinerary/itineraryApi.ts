/**
 * RTK Query endpoints for itinerary operations.
 *
 * Phase 8 contract standardization: endpoints are defined with standard response types.
 * All generation still happens client-side via useEditableItinerary.
 *
 * When backend is ready:
 *   1. Implement the actual backend endpoints
 *   2. Ensure responses match the defined types
 *   3. Wire useGenerateItineraryMutation into TripForm or flow
 */

import { baseApi } from "@/features/api/baseApi";
import type { GeneratedItinerary, TripInput } from "@/types";
import type { SaveItineraryResponse } from "@/features/api/apiTypes";

export const itineraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Generate a new itinerary from trip input.
     *
     * Future implementation:
     *   POST /api/itinerary/generate
     *   body: TripInput
     *   response: GeneratedItinerary
     *
     * Currently not used (client-side generation via lib/generateItinerary.ts).
     */
    generateItinerary: builder.mutation<GeneratedItinerary, TripInput>({
      query: (tripInput) => ({
        url: "/itinerary/generate",
        method: "POST",
        body: tripInput,
      }),
      invalidatesTags: ["Itinerary"],
    }),

    /**
     * Save/persist an edited itinerary to the backend.
     *
     * Future implementation:
     *   POST /api/itineraries
     *   body: GeneratedItinerary
     *   response: SaveItineraryResponse { ok: boolean; id: string; message?: string }
     *
     * Currently not used (localStorage via useEditableItinerary).
     */
    saveItinerary: builder.mutation<SaveItineraryResponse, GeneratedItinerary>({
      query: (itinerary) => ({
        url: "/itineraries",
        method: "POST",
        body: itinerary,
      }),
      invalidatesTags: ["Itinerary"],
    }),

    /**
     * Fetch an itinerary by ID from the backend.
     *
     * Future implementation:
     *   GET /api/itineraries/:id
     *   response: GeneratedItinerary
     *
     * Currently not used.
     */
    getItinerary: builder.query<GeneratedItinerary, string>({
      query: (id) => `/itineraries/${id}`,
      providesTags: (result) => (result ? ["Itinerary"] : []),
    }),
  }),
});

export const {
  useGenerateItineraryMutation,
  useSaveItineraryMutation,
  useGetItineraryQuery,
} = itineraryApi;
