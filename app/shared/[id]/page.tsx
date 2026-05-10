import type { Metadata } from "next";
import SharedItineraryView from "@/components/features/SharedItineraryView";

export const metadata: Metadata = {
  title: "Shared Itinerary — Travel Amigo",
  description: "View a shared Sri Lanka travel itinerary created with Travel Amigo.",
};

/**
 * /shared/[id]
 *
 * Server shell — rendering is delegated to the client component which reads
 * ta_shared_itinerary_demo from localStorage. The [id] segment is kept for
 * future extensibility; "demo" is the only supported value in this prototype.
 */
export default async function SharedItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 16 App Router
  await params;

  return <SharedItineraryView />;
}
