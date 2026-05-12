/**
 * Temporary in-memory itinerary storage for MVP backend wiring.
 *
 * This is a development-only store that holds generated/edited itineraries in memory.
 * It persists only for the lifetime of the Node.js process.
 *
 * IMPORTANT: This is NOT production-ready persistence.
 * Future phases will replace this with a real database (Postgres, Supabase, etc.).
 *
 * Usage:
 *   - Server-side only (imported in app/api/itineraries/route.ts)
 *   - Do NOT import into client components or hooks
 *   - Do NOT use localStorage or browser APIs here
 */

import type { GeneratedItinerary } from "@/types";

/** Module-level in-memory Map. Shared across all API calls within the same process. */
let itineraryStore = new Map<string, GeneratedItinerary>();

/**
 * Generate a unique itinerary ID if one is not provided.
 * Uses a combination of timestamp and random hex for simplicity.
 * In production, would use crypto.randomUUID() or a cryptographically secure approach.
 */
function generateItineraryId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 11);
  return `itin-${timestamp}${random}`;
}

/**
 * Save an itinerary to the in-memory store.
 *
 * If the itinerary has a valid id, it is preserved.
 * If the id is missing or empty, a new one is generated.
 *
 * @param itinerary - The GeneratedItinerary to save
 * @returns The saved GeneratedItinerary (with final id)
 */
export function saveItinerary(itinerary: GeneratedItinerary): GeneratedItinerary {
  // Preserve existing id if valid, otherwise generate a new one
  let id = itinerary.id;
  if (!id || typeof id !== "string" || id.trim() === "") {
    id = generateItineraryId();
  }

  // Create a copy with the final id
  const storedItinerary: GeneratedItinerary = {
    ...itinerary,
    id,
  };

  // Store in the in-memory map
  itineraryStore.set(id, storedItinerary);

  return storedItinerary;
}

/**
 * Retrieve an itinerary by ID from the store.
 *
 * @param id - The itinerary ID to look up
 * @returns GeneratedItinerary if found, null otherwise
 */
export function getItinerary(id: string): GeneratedItinerary | null {
  return itineraryStore.get(id) ?? null;
}

/**
 * Clear all itineraries (development/testing only).
 * Not exposed via API.
 */
export function clearItineraries(): void {
  itineraryStore.clear();
}
