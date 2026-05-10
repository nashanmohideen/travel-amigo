import { redirect } from "next/navigation";

/**
 * /itinerary redirects to the active demo itinerary page.
 * The old Phase 1 client-component version of this page has been superseded
 * by /itinerary/demo (GeneratedItineraryView).
 */
export default function ItineraryRootPage() {
  redirect("/itinerary/demo");
}
