"use client";

/**
 * useEditableItinerary
 *
 * Manages the editable itinerary state with localStorage persistence.
 *
 * localStorage keys:
 *   ta_trip_input       — original / current TripInput (set by /plan form)
 *   ta_edited_itinerary — saved after any user edit; cleared on reset
 *
 * Loading priority:
 *   1. ta_edited_itinerary (if valid)
 *   2. Generate from ta_trip_input
 *   3. Generate from createDefaultTripInput() (demo fallback)
 */

import { useState, useEffect, useCallback } from "react";
import type {
  GeneratedItinerary,
  GeneratedItineraryDay,
  TripInput,
  TripPace,
  Place,
  PlaceInterest,
} from "@/types";
import {
  generateItinerary,
  createDefaultTripInput,
  reassignTimeSlots,
  placeToItineraryItem,
  recalculateBudgetFromDays,
  getBudgetStatus,
} from "@/lib/generateItinerary";
import { getPlacesByDestination, rankPlaces } from "@/lib/placeHelpers";

export const LS_TRIP = "ta_trip_input";
export const LS_EDITED = "ta_edited_itinerary";

// ── helpers ───────────────────────────────────────────────────────────────────

function saveEdited(itinerary: GeneratedItinerary): void {
  try {
    localStorage.setItem(LS_EDITED, JSON.stringify(itinerary));
  } catch {
    /* quota exceeded — silently skip */
  }
}

function isValidItinerary(obj: unknown): obj is GeneratedItinerary {
  if (!obj || typeof obj !== "object") return false;
  const g = obj as Record<string, unknown>;
  return (
    typeof g.id === "string" &&
    Array.isArray(g.days) &&
    typeof g.budget === "object" &&
    typeof g.tripInput === "object"
  );
}

// ── hook ──────────────────────────────────────────────────────────────────────

export interface EditableItineraryState {
  /** The live itinerary — null only during SSR / initial load */
  itinerary: GeneratedItinerary | null;
  /** The current TripInput (may differ from itinerary.tripInput after pace change) */
  tripInput: TripInput | null;
  /** True if trip data came from localStorage (i.e. user came from /plan) */
  fromStorage: boolean;
  /** True if the user has made manual edits */
  isEdited: boolean;
  /** Latest action message for toast display; null when no pending notification */
  lastAction: string | null;

  removePlace(dayIndex: number, itemId: string): void;
  replacePlace(dayIndex: number, itemId: string, newPlace: Place): void;
  movePlaceUp(dayIndex: number, itemIndex: number): void;
  movePlaceDown(dayIndex: number, itemIndex: number): void;
  changePace(pace: TripPace): void;
  resetToGenerated(): void;
  startOver(): void;
  /** Returns ranked alternative places (excludes already-used ones) */
  getAlternatives(dayIndex: number, itemId: string): Place[];
  clearLastAction(): void;
}

export function useEditableItinerary(): EditableItineraryState {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [tripInput, setTripInput] = useState<TripInput | null>(null);
  const [fromStorage, setFromStorage] = useState(false);
  const [isEdited, setIsEdited] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  // ── Initialise from localStorage ──────────────────────────────────────────
  useEffect(() => {
    // 1. Load trip input
    let input: TripInput | null = null;
    let gotStorage = false;
    try {
      const raw = localStorage.getItem(LS_TRIP);
      if (raw) {
        input = JSON.parse(raw) as TripInput;
        gotStorage = true;
      }
    } catch {
      /* invalid JSON */
    }

    // 2. Try to restore edited itinerary
    let edited: GeneratedItinerary | null = null;
    try {
      const raw = localStorage.getItem(LS_EDITED);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValidItinerary(parsed)) edited = parsed;
      }
    } catch {
      /* malformed — ignore */
    }

    // 3. Decide what to display
    // Setting state synchronously in this effect is intentional: we only run on mount
    // to hydrate from localStorage, not in response to React state changes.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (edited) {
      // Sanity-check: destination must match current trip input (if any)
      const destMatch =
        !input || edited.tripInput?.destination === input.destination;
      if (destMatch) {
        setItinerary(edited);
        setTripInput(input ?? edited.tripInput ?? createDefaultTripInput());
        setFromStorage(gotStorage);
        setIsEdited(true);
        return;
      }
      // Edited itinerary is stale — discard it
      try {
        localStorage.removeItem(LS_EDITED);
      } catch {}
    }

    if (!input) input = createDefaultTripInput();
    const fresh = generateItinerary(input);
    setItinerary(fresh);
    setTripInput(input);
    setFromStorage(gotStorage);
    setIsEdited(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // ── Shared derived state mutator ──────────────────────────────────────────

  /** Applies a day-level transform, recalculates budget, saves, notifies. */
  function applyDayChange(
    transform: (days: GeneratedItineraryDay[]) => GeneratedItineraryDay[],
    message: string
  ): void {
    setItinerary((prev) => {
      if (!prev) return prev;
      const newDays = transform(prev.days);
      const newBudget = recalculateBudgetFromDays(prev.budget, newDays, prev.tripInput);
      const newStatus = getBudgetStatus(newBudget, prev.tripInput);
      const updated: GeneratedItinerary = {
        ...prev,
        days: newDays,
        budget: newBudget,
        budgetStatus: newStatus,
      };
      saveEdited(updated);
      return updated;
    });
    setIsEdited(true);
    setLastAction(message);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  const removePlace = useCallback(
    (dayIndex: number, itemId: string) => {
      applyDayChange((days) =>
        days.map((day, di) => {
          if (di !== dayIndex) return day;
          const newItems = reassignTimeSlots(day.items.filter((i) => i.id !== itemId));
          return {
            ...day,
            items: newItems,
            totalCostLkr: newItems.reduce((s, i) => s + i.estimatedCostLkr, 0),
          };
        }),
        "Place removed from itinerary."
      );
    },
    []
  );

  const replacePlace = useCallback(
    (dayIndex: number, itemId: string, newPlace: Place) => {
      setItinerary((prev) => {
        if (!prev) return prev;
        const travelers = prev.tripInput.travelers;
        const newItem = placeToItineraryItem(newPlace, travelers);
        const newDays = prev.days.map((day, di) => {
          if (di !== dayIndex) return day;
          const newItems = reassignTimeSlots(
            day.items.map((i) => (i.id === itemId ? newItem : i))
          );
          return {
            ...day,
            items: newItems,
            totalCostLkr: newItems.reduce((s, i) => s + i.estimatedCostLkr, 0),
          };
        });
        const newBudget = recalculateBudgetFromDays(prev.budget, newDays, prev.tripInput);
        const newStatus = getBudgetStatus(newBudget, prev.tripInput);
        const updated: GeneratedItinerary = { ...prev, days: newDays, budget: newBudget, budgetStatus: newStatus };
        saveEdited(updated);
        return updated;
      });
      setIsEdited(true);
      setLastAction(`Replaced with ${newPlace.name}.`);
    },
    []
  );

  const movePlaceUp = useCallback((dayIndex: number, itemIndex: number) => {
    applyDayChange((days) =>
      days.map((day, di) => {
        if (di !== dayIndex || itemIndex <= 0) return day;
        const items = [...day.items];
        [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
        return { ...day, items: reassignTimeSlots(items) };
      }),
      "Order updated."
    );
  }, []);

  const movePlaceDown = useCallback((dayIndex: number, itemIndex: number) => {
    applyDayChange((days) =>
      days.map((day, di) => {
        if (di !== dayIndex) return day;
        if (itemIndex >= day.items.length - 1) return day;
        const items = [...day.items];
        [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
        return { ...day, items: reassignTimeSlots(items) };
      }),
      "Order updated."
    );
  }, []);

  const changePace = useCallback(
    (pace: TripPace) => {
      const input = tripInput ?? createDefaultTripInput();
      const newInput: TripInput = { ...input, pace };
      const fresh = generateItinerary(newInput);
      try {
        localStorage.setItem(LS_TRIP, JSON.stringify(newInput));
        saveEdited(fresh);
      } catch {}
      setTripInput(newInput);
      setItinerary(fresh);
      setIsEdited(true);
      const label = { relaxed: "Relaxed", balanced: "Balanced", packed: "Packed" }[pace] ?? pace;
      setLastAction(`Pace changed to ${label} — itinerary regenerated.`);
    },
    [tripInput]
  );

  const resetToGenerated = useCallback(() => {
    try {
      localStorage.removeItem(LS_EDITED);
    } catch {}
    const input = tripInput ?? createDefaultTripInput();
    const fresh = generateItinerary(input);
    setItinerary(fresh);
    setIsEdited(false);
    setLastAction("Reset to original generated plan.");
  }, [tripInput]);

  const startOver = useCallback(() => {
    try {
      localStorage.removeItem(LS_TRIP);
      localStorage.removeItem(LS_EDITED);
      localStorage.removeItem("ta_shared_itinerary_demo");
    } catch {}
  }, []);

  const getAlternatives = useCallback(
    (dayIndex: number, itemId: string): Place[] => {
      if (!itinerary) return [];
      const usedIds = new Set(itinerary.days.flatMap((d) => d.items.map((i) => i.placeId)));
      // Keep the slot we're replacing available
      const replacingItem = itinerary.days[dayIndex]?.items.find((i) => i.id === itemId);
      if (replacingItem) usedIds.delete(replacingItem.placeId);

      const allForDest = getPlacesByDestination(itinerary.tripInput.destination);
      const available = allForDest.filter((p) => !usedIds.has(p.id));
      return rankPlaces(available, itinerary.tripInput.interests as PlaceInterest[]);
    },
    [itinerary]
  );

  const clearLastAction = useCallback(() => setLastAction(null), []);

  return {
    itinerary,
    tripInput,
    fromStorage,
    isEdited,
    lastAction,
    removePlace,
    replacePlace,
    movePlaceUp,
    movePlaceDown,
    changePace,
    resetToGenerated,
    startOver,
    getAlternatives,
    clearLastAction,
  };
}
