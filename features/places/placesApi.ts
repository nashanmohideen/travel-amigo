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
 * Lightweight destination string list returned by
 * GET /api/v1/places/destinations.
 * Each entry is the exact lowercase DB value (e.g. "ella", "nuwara-eliya").
 */
export type DestinationName = string;

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
     * Live destination list from the DB.
     * GET /api/v1/places/destinations → string[]
     * Each string is the exact lowercase value stored in Place.destination.
     */
    getDestinationNames: builder.query<DestinationName[], void>({
      query: () => "/places/destinations",
      providesTags: ["Destination"],
    }),

    /**
     * Full Destination objects (legacy — backed by static data/destinations.ts,
     * not yet wired to a backend endpoint).
     * TODO: add GET /api/v1/destinations returning Destination[] and wire here.
     */
    getDestinations: builder.query<Destination[], void>({
      query: () => "/destinations",
      providesTags: ["Destination"],
    }),

    /**
     * Fetch a single destination by ID (not yet backed by a backend endpoint).
     */
    getDestination: builder.query<Destination, string>({
      query: (id) => `/destinations/${id}`,
      providesTags: (result) => (result ? ["Destination"] : []),
    }),

    /**
     * Search places with optional filters (PlacesModule).
     *
     * GET /api/v1/places?destination=ella&interests=nature,photography&travelStyle=budget&category=nature
     * response: Place[]
     */
    searchPlaces: builder.query<Place[], PlaceSearchParams>({
      query: (params) => ({
        url: "/places",
        params: {
          destination: params.destination,
          category: params.category,
          travelStyle: params.travelStyle,
          interests: params.interests?.join(","),
        },
      }),
      providesTags: ["Place"],
    }),

    /**
     * Fetch places for a specific destination (PlacesModule).
     *
     * GET /api/v1/places?destination=:id
     * response: Place[]
     */
    getDestinationPlaces: builder.query<Place[], string>({
      query: (destinationId) => ({
        url: "/places",
        params: { destination: destinationId },
      }),
      providesTags: ["Place"],
    }),

    /**
     * Fetch a single place by ID (PlacesModule).
     *
     * GET /api/v1/places/:id
     * response: Place (+ rating/openingHours enriched via cached Google data)
     */
    getPlace: builder.query<Place, string>({
      query: (id) => `/places/${id}`,
      providesTags: (result) => (result ? ["Place"] : []),
    }),
  }),
});

export const {
  useGetDestinationNamesQuery,
  useGetDestinationsQuery,
  useGetDestinationQuery,
  useSearchPlacesQuery,
  useGetDestinationPlacesQuery,
  useGetPlaceQuery,
} = placesApi;
