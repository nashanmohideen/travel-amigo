/**
 * RTK Query endpoints for place and destination data.
 *
 * Phase 7 foundation: endpoints are defined but not yet called from UI.
 * All place/destination data is currently sourced from static files
 * (data/destinations.ts, data/places.ts).
 *
 * When Phase 8 backend is ready:
 *   1. Implement backend endpoints for destinations and place search
 *   2. Wire useGetDestinationsQuery into TripForm or a places selector
 *   3. Wire useSearchPlacesQuery into ReplacePlaceModal
 *   4. Cache responses in Redux for fast access
 */

import { baseApi } from "@/features/api/baseApi";
import type { Destination, Place, PlaceInterest, TravelStyle } from "@/types";

/**
 * Query parameters for searching places (optional).
 * Used by the search endpoint to filter results.
 */
export interface PlaceSearchParams {
  destination?: string;
  interests?: PlaceInterest[];
  travelStyle?: TravelStyle;
  category?: string;
}

export const placesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetch all available destinations.
     *
     * Future implementation:
     *   GET /api/destinations
     *   response: Destination[]
     *
     * Currently not used (static data from data/destinations.ts).
     */
    getDestinations: builder.query<Destination[], void>({
      query: () => "/destinations",
      providesTags: ["Destination"],
    }),

    /**
     * Fetch a single destination by ID.
     *
     * Future implementation:
     *   GET /api/destinations/:id
     *   response: Destination
     *
     * Currently not used.
     */
    getDestination: builder.query<Destination, string>({
      query: (id) => `/destinations/${id}`,
      providesTags: (result) => (result ? ["Destination"] : []),
    }),

    /**
     * Search places with optional filters.
     *
     * Future implementation:
     *   GET /api/places/search?destination=ella&interests=nature&travelStyle=budget
     *   response: Place[] (ranked by relevance)
     *
     * Params:
     *   - destination: filter by destination
     *   - interests: filter by user interests
     *   - travelStyle: filter by budget level
     *   - category: filter by place category
     *
     * Currently not used (static data + client-side ranking).
     */
    searchPlaces: builder.query<Place[], PlaceSearchParams>({
      query: (params) => ({
        url: "/places/search",
        params,
      }),
      providesTags: ["Place"],
    }),

    /**
     * Fetch places for a specific destination.
     *
     * Future implementation:
     *   GET /api/destinations/:id/places
     *   response: Place[]
     *
     * Currently not used (static data from data/places.ts).
     */
    getDestinationPlaces: builder.query<Place[], string>({
      query: (destinationId) => `/destinations/${destinationId}/places`,
      providesTags: ["Place"],
    }),

    /**
     * Fetch a single place by ID.
     *
     * Future implementation:
     *   GET /api/places/:id
     *   response: Place
     *
     * Currently not used.
     */
    getPlace: builder.query<Place, string>({
      query: (id) => `/places/${id}`,
      providesTags: (result) => (result ? ["Place"] : []),
    }),
  }),
});

export const {
  useGetDestinationsQuery,
  useGetDestinationQuery,
  useSearchPlacesQuery,
  useGetDestinationPlacesQuery,
  useGetPlaceQuery,
} = placesApi;
