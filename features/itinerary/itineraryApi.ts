/**
 * RTK Query endpoints for itinerary operations, wired to the NestJS backend
 * (TripsModule, /api/v1/trips).
 */

import { baseApi } from "@/features/api/baseApi";
import type { GeneratedItinerary, TripInput } from "@/types";
import type { SaveItineraryResponse } from "@/features/api/apiTypes";
import { toGenerateDTO } from "@/lib/mappers/toGenerateDTO";

/** Backend Trip row shape (subset the frontend consumes). */
export interface TripRecord {
  id: string;
  title: string;
  itinerarySnapshot: GeneratedItinerary;
}

export const itineraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Generate a new itinerary from trip input.
     *
     * POST /api/v1/trips/generate-itinerary
     * body: TripInput → response: GeneratedItinerary
     * Requires auth (JWT); rate-limited server-side (10/hour per IP).
     */
    generateItinerary: builder.mutation<GeneratedItinerary, TripInput>({
      query: (tripInput) => ({
        url: "/trips/generate-itinerary",
        method: "POST",
        body: toGenerateDTO(tripInput),
      }),
      invalidatesTags: ["Itinerary"],
    }),

    /**
     * Save/persist an edited itinerary as a Trip (requires auth).
     *
     * POST /api/v1/trips/save-itinerary
     * body: { title, budget, itinerarySnapshot } → response: Trip record
     */
    saveItinerary: builder.mutation<SaveItineraryResponse, GeneratedItinerary>({
      query: (itinerary) => ({
        url: "/trips/save-itinerary",
        method: "POST",
        body: {
          title: itinerary.title,
          budget: itinerary.tripInput.budgetLKR,
          itinerarySnapshot: itinerary,
        },
      }),
      transformResponse: (trip: TripRecord): SaveItineraryResponse => ({
        ok: true,
        id: trip.id,
      }),
      invalidatesTags: ["Itinerary", "Trip"],
    }),

    /**
     * List the user's saved trips (requires auth).
     *
     * GET /api/v1/trips/my-trips → Trip records.
     */
    listTrips: builder.query<TripRecord[], void>({
      query: () => "/trips/my-trips",
      providesTags: ["Trip"],
    }),

    /**
     * Fetch a saved trip's itinerary by trip ID (requires auth).
     *
     * GET /api/v1/trips/:id/details → Trip record; the snapshot is the exact
     * GeneratedItinerary as last rendered.
     */
    getItinerary: builder.query<GeneratedItinerary, string>({
      query: (id) => `/trips/${id}/details`,
      transformResponse: (trip: TripRecord): GeneratedItinerary => trip.itinerarySnapshot,
      providesTags: (result) => (result ? ["Itinerary"] : []),
    }),
  }),
});

export const {
  useGenerateItineraryMutation,
  useSaveItineraryMutation,
  useListTripsQuery,
  useGetItineraryQuery,
} = itineraryApi;
