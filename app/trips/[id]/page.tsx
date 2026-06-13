"use client";

/**
 * /trips/[id] — bookmarkable detail page for a saved trip.
 *
 * Wrapped in ProtectedRoute; the itinerary comes from GET /api/v1/trips/:id
 * (SavedItineraryView's useGetItineraryQuery) instead of localStorage.
 */

import { use } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SavedItineraryView from "@/components/features/SavedItineraryView";

export default function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <ProtectedRoute>
      <SavedItineraryView id={id} />
    </ProtectedRoute>
  );
}
