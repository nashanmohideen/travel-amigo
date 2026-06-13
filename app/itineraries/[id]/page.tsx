import type { Metadata } from "next";
import SavedItineraryView from "@/components/features/SavedItineraryView";

export const metadata: Metadata = {
  title: "Saved Itinerary — Travel Amigo",
  description: "View your saved Travel Amigo itinerary.",
};

/**
 * /itineraries/[id]
 *
 * Server shell for viewing a saved itinerary.
 * Renders a client component and passes the itinerary id from the route.
 *
 * Phase 19: Added for saved itinerary read-only view.
 *   - Uses GET /api/itineraries/[id] to fetch the itinerary
 *   - Displays in read-only format
 *   - No editing, sharing, or feedback on this page
 */
export default async function SavedItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 16 App Router
  const { id } = await params;

  return <SavedItineraryView id={id} />;
}
