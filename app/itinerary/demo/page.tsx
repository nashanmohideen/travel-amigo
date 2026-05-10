import type { Metadata } from "next";
import GeneratedItineraryView from "@/components/features/GeneratedItineraryView";

export const metadata: Metadata = {
  title: "Your Itinerary — Travel Amigo",
  description:
    "Your personalised Sri Lanka day-by-day itinerary with places, times, and estimated costs.",
};

/**
 * Server component shell — keeps metadata export working.
 * All data work (localStorage read + itinerary generation) happens inside
 * the GeneratedItineraryView client component.
 */
export default function DemoItineraryPage() {
  return <GeneratedItineraryView />;
}
