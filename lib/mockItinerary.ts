import type { Itinerary, TripDetails } from "@/types";
import { sampleItinerary } from "@/data/itineraries";

/**
 * Mock itinerary generator.
 * In a real app this would call an AI API (e.g. OpenAI).
 * For the prototype it returns the sample itinerary with the user's trip details
 * and a freshly generated ID injected, making the UI feel dynamic.
 */
export function generateMockItinerary(details: TripDetails): Itinerary {
  const id = `trip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  // Slice days to match the requested duration
  const days = sampleItinerary.days.slice(0, details.duration).map((day, i) => {
    const date = new Date(details.startDate);
    date.setDate(date.getDate() + i);
    return {
      ...day,
      day: i + 1,
      date: date.toISOString().split("T")[0],
    };
  });

  // Scale budget to actual traveler count and duration
  const scaleFactor = (details.travelers / 2) * (details.duration / 7);
  const rawBudget = sampleItinerary.budget;

  return {
    ...sampleItinerary,
    id,
    createdAt: new Date().toISOString(),
    tripDetails: details,
    days,
    budget: {
      accommodation: Math.round(rawBudget.accommodation * scaleFactor),
      food: Math.round(rawBudget.food * scaleFactor),
      transport: Math.round(rawBudget.transport * scaleFactor),
      activities: Math.round(rawBudget.activities * scaleFactor),
      miscellaneous: Math.round(rawBudget.miscellaneous * scaleFactor),
      total: Math.round(rawBudget.total * scaleFactor),
    },
  };
}
