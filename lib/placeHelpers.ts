import { places } from "@/data/places";
import type { Place, PlaceInterest, TravelStyle } from "@/types";

// ── Core filters ──────────────────────────────────────────────────────────────

/**
 * Returns all places for a specific destination id (e.g. "ella", "kandy").
 */
export function getPlacesByDestination(destination: string): Place[] {
  return places.filter((p) => p.destination === destination);
}

/**
 * Returns all places matching at least one of the given interest tags.
 */
export function getPlacesByInterests(interests: PlaceInterest[]): Place[] {
  if (interests.length === 0) return places;
  return places.filter((p) =>
    p.interests.some((i) => interests.includes(i))
  );
}

/**
 * Returns places for a destination filtered by interests and suitable travel style.
 * This is the primary selector used by the itinerary generator.
 *
 * @param destination  - destination id ("ella" | "kandy" | "galle" | "nuwara-eliya" | "colombo")
 * @param interests    - user-selected interest tags from TripInput
 * @param travelStyle  - user's travel style ("budget" | "balanced" | "premium")
 */
export function getFilteredPlaces(
  destination: string,
  interests: PlaceInterest[],
  travelStyle: TravelStyle
): Place[] {
  return places.filter((p) => {
    const matchesDestination = p.destination === destination;
    const matchesStyle = p.suitableFor.includes(travelStyle);
    const matchesInterest =
      interests.length === 0 ||
      p.interests.some((i) => interests.includes(i));
    return matchesDestination && matchesStyle && matchesInterest;
  });
}

// ── Scoring & ranking ─────────────────────────────────────────────────────────

/**
 * Scores a place 0–100 based on how many of the user's interests it matches.
 * Places matching more interests rank higher.
 */
export function scorePlaceByInterests(
  place: Place,
  interests: PlaceInterest[]
): number {
  if (interests.length === 0) return 50;
  const matches = place.interests.filter((i) => interests.includes(i)).length;
  return Math.round((matches / Math.max(place.interests.length, 1)) * 100);
}

/**
 * Returns places sorted by relevance to the user's interests, highest first.
 */
export function rankPlaces(
  candidates: Place[],
  interests: PlaceInterest[]
): Place[] {
  return [...candidates].sort(
    (a, b) =>
      scorePlaceByInterests(b, interests) -
      scorePlaceByInterests(a, interests)
  );
}

// ── Budget helpers ────────────────────────────────────────────────────────────

/**
 * Returns an estimated visit duration bracket for a place based on trip pace.
 * Used to determine how many places can fit in a day.
 *
 * pace: "relaxed" = 1–2 places/day; "balanced" = 2–3; "packed" = 3–5
 */
export function getDailyCapacity(pace: "relaxed" | "balanced" | "packed"): number {
  return { relaxed: 2, balanced: 3, packed: 4 }[pace];
}

/**
 * Filters out places that are too expensive for the per-person-per-day budget.
 */
export function filterByBudgetPerVisit(
  candidates: Place[],
  budgetLkrPerPerson: number
): Place[] {
  return candidates.filter(
    (p) => p.estimatedCostLkr <= budgetLkrPerPerson
  );
}

// ── Day planning selector ─────────────────────────────────────────────────────

/**
 * Selects an ordered list of places for a single itinerary day.
 *
 * - Picks up to `maxPlaces` from `candidates`.
 * - Prioritises places by interest relevance.
 * - Ensures total estimated visit time fits within `availableMinutes` (default 480 = 8 hrs).
 * - Puts heavier places (longer visits, outdoors) in the morning slot.
 */
export function selectPlacesForDay(
  candidates: Place[],
  interests: PlaceInterest[],
  maxPlaces: number,
  availableMinutes = 480
): Place[] {
  const ranked = rankPlaces(candidates, interests);
  const selected: Place[] = [];
  let totalMinutes = 0;

  for (const place of ranked) {
    if (selected.length >= maxPlaces) break;
    if (totalMinutes + place.estimatedVisitDurationMinutes > availableMinutes)
      continue;
    selected.push(place);
    totalMinutes += place.estimatedVisitDurationMinutes;
  }

  return selected;
}

// ── Cost estimation ───────────────────────────────────────────────────────────

/**
 * Calculates the total estimated entry/activity cost in LKR for a list of
 * places and a given number of travelers.
 */
export function estimatePlacesCost(places: Place[], travelers: number): number {
  return places.reduce((sum, p) => sum + p.estimatedCostLkr * travelers, 0);
}

/**
 * Returns a human-readable cost label.
 *
 * 0        → "Free"
 * < 1000   → "Under LKR 1,000"
 * >= 1000  → "~LKR X,XXX"
 */
export function costLabel(lkr: number): string {
  if (lkr === 0) return "Free";
  if (lkr < 1000) return `Under LKR 1,000`;
  return `~LKR ${new Intl.NumberFormat("en-LK").format(lkr)}`;
}

// ── Tip generation ────────────────────────────────────────────────────────────

const DESTINATION_TIPS: Record<string, string[]> = {
  ella: [
    "The Kandy–Ella train is world-famous — book reserved seats at least 3 days ahead.",
    "Start hikes before 7 am to beat the heat and cloud cover.",
    "Tuk-tuk fares in Ella are negotiable — agree on a price before you set off.",
    "Pack a layer for evenings; Ella gets cooler than expected at 1,000 m elevation.",
  ],
  kandy: [
    "The evening puja at the Temple of the Tooth (6:30 pm) is one of Sri Lanka's great experiences.",
    "Dress modestly (shoulders and knees covered) for all temple visits.",
    "Kandy's tuk-tuks don't always use meters — negotiate or use a ride-hailing app.",
    "The Kandyan dance show is touristy but genuinely impressive; the fire walk finale is unmissable.",
  ],
  galle: [
    "Galle Fort is best explored on foot — the rampart walk takes about 45 minutes at a leisurely pace.",
    "The south-coast sea can be rough May–October; check surf conditions before swimming.",
    "Pedlar Street and Church Street have the best cafés and boutiques inside the fort.",
    "Stilt fishermen near Koggala usually request a small fee for close-up photography.",
  ],
  "nuwara-eliya": [
    "Pack warm layers — Nuwara Eliya sits at 1,800 m and can dip below 10°C at night.",
    "The scenic train from Kandy to Nanu Oya station is one of the world's great rail journeys.",
    "Horton Plains clouds in after 10 am — start the World's End trail at dawn for the clearest views.",
    "April and August are the best months for the floral displays at Victoria Park and Hakgala Gardens.",
  ],
  colombo: [
    "Colombo's traffic can be severe — allow extra time between sights and travel during off-peak hours.",
    "The Fort and Pettah areas are safe for walking but keep valuables secure in market areas.",
    "Try kottu roti at a local spot for under LKR 500 — it's a better version than tourist restaurant prices.",
    "The Galle Face Green is at its best at sunset — arrive 30 minutes before for a good spot along the wall.",
  ],
};

/**
 * Returns 3–4 destination-specific travel tips for the itinerary output.
 */
export function getTipsForDestination(destination: string): string[] {
  return (
    DESTINATION_TIPS[destination] ?? [
      "Carry small LKR denominations for tuk-tuks and market stalls.",
      "Dress respectfully at religious sites — cover shoulders and knees.",
      "Bottled water is widely available; roadside king coconut (thambili) is safe and refreshing.",
    ]
  );
}

// ── Summary helpers ───────────────────────────────────────────────────────────

/**
 * Returns the category emoji for a PlaceCategory.
 */
export const categoryEmoji: Record<string, string> = {
  nature: "🌿",
  culture: "🛕",
  food: "🍛",
  adventure: "🧗",
  beach: "🏖️",
  photography: "📸",
  shopping: "🛍️",
  wellness: "🧘",
  wildlife: "🐆",
  viewpoint: "🔭",
  relaxation: "😌",
};
