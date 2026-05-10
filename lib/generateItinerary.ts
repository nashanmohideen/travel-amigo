/**
 * Rule-based itinerary generator for Travel Amigo.
 *
 * Takes a TripInput and produces a GeneratedItinerary using the mock place
 * data, transport estimates, and helper functions from Phase 3.
 *
 * No backend, no AI, no external APIs.
 */

import type {
  TripInput,
  Place,
  PlaceInterest,
  PlaceCategory,
  ItineraryItem,
  GeneratedItineraryDay,
  GeneratedBudgetBreakdown,
  GeneratedItinerary,
  BudgetStatus,
  BudgetConfidence,
} from "@/types";
import {
  getFilteredPlaces,
  getPlacesByDestination,
  getDailyCapacity,
  rankPlaces,
  selectPlacesForDay,
  getTipsForDestination,
  categoryEmoji,
} from "@/lib/placeHelpers";
import {
  getTransportLeg,
  accommodationCostLkrPerNight,
  foodCostLkrPerPersonPerDay,
} from "@/data/transport";

// ── Human-readable destination labels ────────────────────────────────────────

const DESTINATION_LABEL: Record<string, string> = {
  ella: "Ella",
  kandy: "Kandy",
  galle: "Galle",
  "nuwara-eliya": "Nuwara Eliya",
  colombo: "Colombo",
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: createDefaultTripInput
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the fallback TripInput used when no data is found in localStorage.
 */
export function createDefaultTripInput(): TripInput {
  return {
    destination: "ella",
    duration: 2,
    travelers: 2,
    budgetLKR: 50000,
    travelStyle: "balanced",
    interests: ["nature", "photography", "food"],
    transportMode: "mixed",
    pace: "balanced",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: time helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Total minutes from midnight → "HH:MM" string. */
function toTimeString(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

const DAY_START_MINUTES = 8 * 60; // 08:00
const TRAVEL_BUFFER_MINUTES = 30; // gap between places

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: assignTimeSlots
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts an ordered list of Place objects into ItineraryItem[] with
 * sequential time-slot labels beginning at 08:00 and a 30-minute travel
 * buffer inserted between each place.
 */
export function assignTimeSlots(
  places: Place[],
  travelers: number
): ItineraryItem[] {
  let cursor = DAY_START_MINUTES;

  return places.map((place, idx) => {
    const startMin = cursor;
    const endMin = cursor + place.estimatedVisitDurationMinutes;
    cursor = endMin + TRAVEL_BUFFER_MINUTES;

    return {
      id: `item-${place.id}-${idx}`,
      placeId: place.id,
      placeName: place.name,
      category: place.category as PlaceCategory,
      startTime: toTimeString(startMin),
      endTime: toTimeString(endMin),
      estimatedCostLkr: place.estimatedCostLkr * travelers,
      notes: place.travelTip,
      emoji: categoryEmoji[place.category] ?? "📍",
      shortDescription: place.shortDescription,
      bestTimeToVisit: place.bestTimeToVisit,
      estimatedVisitDurationMinutes: place.estimatedVisitDurationMinutes,
      gradientPlaceholder: place.gradientPlaceholder,
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: reassignTimeSlots
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Re-computes sequential start/end times for an existing ItineraryItem[].
 * Preserves all other fields. Use after reordering, removing, or replacing items.
 */
export function reassignTimeSlots(items: ItineraryItem[]): ItineraryItem[] {
  let cursor = DAY_START_MINUTES;
  return items.map((item) => {
    const startMin = cursor;
    const endMin = cursor + item.estimatedVisitDurationMinutes;
    cursor = endMin + TRAVEL_BUFFER_MINUTES;
    return { ...item, startTime: toTimeString(startMin), endTime: toTimeString(endMin) };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: placeToItineraryItem
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a Place to an ItineraryItem with placeholder times.
 * Call reassignTimeSlots on the full items array afterwards.
 */
export function placeToItineraryItem(place: Place, travelers: number): ItineraryItem {
  return {
    id: `item-${place.id}-${Date.now()}`,
    placeId: place.id,
    placeName: place.name,
    category: place.category as PlaceCategory,
    startTime: "00:00",
    endTime: "00:00",
    estimatedCostLkr: place.estimatedCostLkr * travelers,
    notes: place.travelTip,
    emoji: categoryEmoji[place.category] ?? "📍",
    shortDescription: place.shortDescription,
    bestTimeToVisit: place.bestTimeToVisit,
    estimatedVisitDurationMinutes: place.estimatedVisitDurationMinutes,
    gradientPlaceholder: place.gradientPlaceholder,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: recalculateBudgetFromDays
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recomputes the budget after place-level edits (remove/replace).
 * Accommodation, food, and base transport are fixed (depend on TripInput, not places).
 * Only activities, buffer, total, and perPerson are updated.
 */
export function recalculateBudgetFromDays(
  originalBudget: GeneratedBudgetBreakdown,
  days: GeneratedItineraryDay[],
  input: TripInput
): GeneratedBudgetBreakdown {
  const activities = days
    .flatMap((d) => d.items)
    .reduce((sum, item) => sum + item.estimatedCostLkr, 0);

  const { accommodation, food, transport, miscellaneous } = originalBudget;
  const subtotal = activities + accommodation + food + transport;
  const buffer = Math.round(subtotal * 0.1);
  const total = subtotal + buffer;
  const perPerson = Math.round(total / Math.max(input.travelers, 1));

  return { accommodation, food, transport, activities, buffer, miscellaneous, total, perPerson, currency: "LKR" };
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: day-title lookup
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORY_TITLES: Partial<Record<PlaceCategory, string[]>> = {
  nature: ["Into the Wilderness", "Nature & Trails", "Green Horizons", "Hills & Valleys"],
  culture: ["Cultural Immersion", "Heritage Trail", "Temples & Traditions", "Living History"],
  food: ["Taste of Sri Lanka", "Flavours & Markets", "Culinary Discovery"],
  adventure: ["Adventure Day", "Off the Beaten Path", "Trails & Peaks"],
  beach: ["Coastal Day", "Sun & Surf", "Seaside Escape"],
  photography: ["Golden Hour", "Through the Lens", "Frames & Light"],
  viewpoint: ["The Long View", "Elevated Horizons", "Panoramic Day"],
  shopping: ["Local Finds", "Markets & Crafts"],
  wellness: ["Rest & Restore", "Slow Travel Day"],
  wildlife: ["Wildlife Encounter", "Into the Wild"],
};

function getDayTitle(places: Place[], dayNum: number): string {
  const lead = places[0];
  if (!lead) return `Day ${dayNum} — Explore`;
  const options = CATEGORY_TITLES[lead.category] ?? ["Explore"];
  return options[(dayNum - 1) % options.length];
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: splitPlacesIntoDays
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Distributes all candidate places into per-day buckets.
 *
 * - Uses `getDailyCapacity(pace)` to cap places per day.
 * - Marks each place as used so it never appears twice.
 * - If the pool is exhausted before all days are filled the remaining days
 *   will have fewer or zero places (handled gracefully by the caller).
 */
export function splitPlacesIntoDays(
  candidates: Place[],
  duration: number,
  pace: "relaxed" | "balanced" | "packed",
  interests: PlaceInterest[]
): Place[][] {
  const capacity = getDailyCapacity(pace);
  const MAX_DAY_MINUTES = 9 * 60; // 9 hours available per day

  const ranked = rankPlaces(candidates, interests);
  const used = new Set<string>();
  const days: Place[][] = [];

  for (let d = 0; d < duration; d++) {
    const pool = ranked.filter((p) => !used.has(p.id));
    const dayPlaces = selectPlacesForDay(pool, interests, capacity, MAX_DAY_MINUTES);
    dayPlaces.forEach((p) => used.add(p.id));
    days.push(dayPlaces);
  }

  return days;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: transport note builder
// ─────────────────────────────────────────────────────────────────────────────

const LOCAL_TRANSPORT_NOTES: Record<string, string> = {
  public: "Getting around by local buses and three-wheelers (tuk-tuks).",
  private: "Private hired vehicle with driver for comfortable door-to-door travel.",
  mixed: "Mix of tuk-tuks for short hops and local buses for longer stretches.",
};

function buildTransportNote(dayNum: number, input: TripInput): string {
  if (dayNum === 1 && input.destination !== "colombo") {
    const leg = getTransportLeg("colombo", input.destination);
    const option =
      leg?.options.find((o) => o.mode === input.transportMode) ??
      leg?.options.find((o) => o.mode === "mixed") ??
      leg?.options[0];
    if (option) return option.notes;
  }
  return LOCAL_TRANSPORT_NOTES[input.transportMode] ?? "Tuk-tuk recommended.";
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: local daily transport estimate
// ─────────────────────────────────────────────────────────────────────────────

const DAILY_LOCAL_TRANSPORT_LKR: Record<string, number> = {
  public: 800,
  private: 2500,
  mixed: 1200,
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: calculateBudgetBreakdown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Estimates the full trip budget in LKR.
 *
 * Components:
 *  • activities   — sum of entry / participation costs × travelers
 *  • accommodation — rooms × nights × nightly_rate (1 room per 2 guests)
 *  • food         — daily food allowance × travelers × duration
 *  • transport    — arrival leg (Colombo → destination) + daily local transport
 *  • buffer       — 10 % contingency on the subtotal
 *  • miscellaneous — 0 (kept as explicit field for forward compatibility)
 */
export function calculateBudgetBreakdown(
  input: TripInput,
  dayBuckets: Place[][]
): GeneratedBudgetBreakdown {
  const { destination, duration, travelers, travelStyle, transportMode } =
    input;

  // Activities
  const activities = dayBuckets
    .flat()
    .reduce((sum, p) => sum + p.estimatedCostLkr * travelers, 0);

  // Accommodation — assume 1 room per 2 travelers (rounded up)
  const rooms = Math.ceil(travelers / 2);
  const nightRate =
    accommodationCostLkrPerNight[travelStyle]?.[destination] ?? 6000;
  const accommodation = rooms * duration * nightRate;

  // Food
  const foodRate = foodCostLkrPerPersonPerDay[travelStyle] ?? 2000;
  const food = foodRate * travelers * duration;

  // Transport — arrival leg from Colombo + daily local spend
  const leg = getTransportLeg("colombo", destination);
  const arrivalOption =
    leg?.options.find((o) => o.mode === transportMode) ??
    leg?.options.find((o) => o.mode === "mixed") ??
    leg?.options[0];
  const arrivalCost =
    destination === "colombo" ? 0 : (arrivalOption?.estimatedCostLkr ?? 3000);
  const localCost =
    (DAILY_LOCAL_TRANSPORT_LKR[transportMode] ?? 1200) * duration;
  const transport = arrivalCost + localCost;

  // Buffer
  const subtotal = activities + accommodation + food + transport;
  const buffer = Math.round(subtotal * 0.1);
  const miscellaneous = 0;

  const total = subtotal + buffer;
  const perPerson = Math.round(total / Math.max(travelers, 1));

  return {
    accommodation,
    food,
    transport,
    activities,
    buffer,
    miscellaneous,
    total,
    perPerson,
    currency: "LKR",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: getBudgetStatus
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compares the total estimated cost against the user's stated budget.
 *
 *  ≤ 90 %  → within_budget
 *  ≤ 110 % → tight_budget
 *  > 110 % → over_budget
 */
export function getBudgetStatus(
  breakdown: GeneratedBudgetBreakdown,
  input: TripInput
): BudgetStatus {
  const ratio = breakdown.total / Math.max(input.budgetLKR, 1);
  if (ratio <= 0.9) return "within_budget";
  if (ratio <= 1.1) return "tight_budget";
  return "over_budget";
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: getBudgetConfidence
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rates our confidence in the budget estimate.
 *
 *  high   — ≥ 6 matching places, no critical warnings, within budget
 *  low    — over_budget OR fewer than 4 matching places
 *  medium — everything else
 */
export function getBudgetConfidence(
  breakdown: GeneratedBudgetBreakdown,
  input: TripInput,
  matchingPlacesCount: number,
  status: BudgetStatus
): BudgetConfidence {
  if (
    status === "within_budget" &&
    matchingPlacesCount >= 6
  ) {
    return "high";
  }
  if (status === "over_budget" || matchingPlacesCount < 4) {
    return "low";
  }
  return "medium";
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: warning builder
// ─────────────────────────────────────────────────────────────────────────────

function buildWarnings(
  input: TripInput,
  matchingPlacesCount: number,
  status: BudgetStatus
): string[] {
  const warnings: string[] = [];

  // Very low per-person-per-day budget
  const perPersonPerDay =
    input.budgetLKR / (Math.max(input.travelers, 1) * Math.max(input.duration, 1));
  if (perPersonPerDay < 3500) {
    warnings.push(
      "Very low daily budget — some accommodation and activity costs may exceed this allowance."
    );
  }

  // Not enough matching places for every day
  const neededPlaces = getDailyCapacity(input.pace) * input.duration;
  if (matchingPlacesCount < neededPlaces) {
    warnings.push(
      `Only ${matchingPlacesCount} place${matchingPlacesCount === 1 ? "" : "s"} match your selected interests. Some days may have fewer activities than planned.`
    );
  }

  // Budget overrun / tight
  if (status === "over_budget") {
    warnings.push(
      "Estimated total cost exceeds your stated budget. Consider reducing the trip length, number of travellers, or choosing a lower travel style."
    );
  } else if (status === "tight_budget") {
    warnings.push(
      "Estimated costs are close to your budget. Build in a small contingency for tuk-tuks, snacks, and unexpected extras."
    );
  }

  // Packed pace caveat
  if (input.pace === "packed") {
    warnings.push(
      "Packed pace may feel rushed in Sri Lanka — roads and tuk-tuks can be slower than expected. Allow buffer time between activities."
    );
  }

  // Always include an estimate caveat
  warnings.push(
    "All costs are estimates based on approximate 2024–2025 traveller prices and may vary significantly."
  );

  return warnings;
}

// ─────────────────────────────────────────────────────────────────────────────
//  INTERNAL: itinerary title
// ─────────────────────────────────────────────────────────────────────────────

function buildTitle(input: TripInput): string {
  const dest = DESTINATION_LABEL[input.destination] ?? input.destination;
  const styleLabel: Record<string, string> = {
    budget: "Budget",
    balanced: "Classic",
    premium: "Luxury",
  };
  return `${input.duration}-Day ${styleLabel[input.travelStyle] ?? "Classic"} ${dest}`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC: generateItinerary
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main generator. Takes a TripInput, returns a GeneratedItinerary.
 *
 * Algorithm:
 *  1. Filter places by destination + interests + travel style.
 *  2. If too few filtered results, fall back to all places for the destination.
 *  3. Split into day buckets using pace-controlled daily capacity.
 *  4. Assign start/end times to each place within each day.
 *  5. Calculate the full budget breakdown.
 *  6. Determine budget status and confidence.
 *  7. Build warnings and tips.
 *  8. Return the assembled GeneratedItinerary.
 */
export function generateItinerary(input: TripInput): GeneratedItinerary {
  const interests = input.interests as PlaceInterest[];

  // ── 1. Filter ─────────────────────────────────────────────────────────────
  let candidates = getFilteredPlaces(
    input.destination,
    interests,
    input.travelStyle
  );
  const matchingCount = candidates.length;

  // ── 2. Fallback if pool is thin ───────────────────────────────────────────
  const neededTotal = getDailyCapacity(input.pace) * input.duration;
  if (candidates.length < neededTotal) {
    // Broaden: drop interest & style filter, keep only destination
    candidates = getPlacesByDestination(input.destination);
  }

  // ── 3. Split into days ────────────────────────────────────────────────────
  const dayBuckets = splitPlacesIntoDays(
    candidates,
    input.duration,
    input.pace,
    interests
  );

  // ── 4. Build GeneratedItineraryDay[] ──────────────────────────────────────
  const location = DESTINATION_LABEL[input.destination] ?? input.destination;

  const days: GeneratedItineraryDay[] = dayBuckets.map((places, idx) => {
    const dayNum = idx + 1;
    const items = assignTimeSlots(places, input.travelers);
    const totalCostLkr = items.reduce((s, item) => s + item.estimatedCostLkr, 0);

    return {
      day: dayNum,
      title: getDayTitle(places, dayNum),
      location,
      items,
      transportNote: buildTransportNote(dayNum, input),
      totalCostLkr,
    };
  });

  // ── 5. Budget ─────────────────────────────────────────────────────────────
  const budget = calculateBudgetBreakdown(input, dayBuckets);

  // ── 6. Status & confidence ────────────────────────────────────────────────
  const budgetStatus = getBudgetStatus(budget, input);
  const budgetConfidence = getBudgetConfidence(
    budget,
    input,
    matchingCount,
    budgetStatus
  );

  // ── 7. Warnings & tips ────────────────────────────────────────────────────
  const warnings = buildWarnings(input, matchingCount, budgetStatus);
  const tips = getTipsForDestination(input.destination);

  // ── 8. Assemble ───────────────────────────────────────────────────────────
  const now = new Date().toISOString();

  return {
    id: `gen-${input.destination}-${input.duration}d-${Date.now()}`,
    title: buildTitle(input),
    destination: input.destination,
    tripInput: input,
    days,
    budget,
    budgetStatus,
    budgetConfidence,
    warnings,
    tips,
    createdAt: now,
    generatedAt: now,
  };
}
