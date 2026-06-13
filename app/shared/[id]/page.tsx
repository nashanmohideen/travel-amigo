import type { Metadata } from "next";
import SharedItineraryView from "@/components/features/SharedItineraryView";

export const metadata: Metadata = {
  title: "Shared Itinerary — Travel Amigo",
  description: "View a shared Sri Lanka travel itinerary created with Travel Amigo.",
};

/**
 * /shared/[id]
 *
 * Server shell — rendering is delegated to the client component.
 * The [id] segment is the share token or "demo" for localStorage-only fallback.
 *
 * Phase 16: Passes token to SharedItineraryView for RTK Query integration.
 *   - If [id] === "demo": uses localStorage only (LS_SHARED_ITINERARY_DEMO)
 *   - If [id] is a real token: tries API GET /api/share/[token], falls back to localStorage
 */
export default async function SharedItineraryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params as required by Next.js 16 App Router
  const { id } = await params;

  return <SharedItineraryView token={id} />;
}
