/**
 * itinerarySlice — Phase 4: full active itinerary state
 *
 * Owns the active generated/edited itinerary and all structural editing
 * operations.  Pure helper functions from lib/generateItinerary are imported
 * and called inside reducers — this is intentional and correct: RTK/Immer
 * reducers may call any deterministic, side-effect-free function.
 *
 * What stays OUTSIDE this slice (in hooks/components):
 *  - localStorage reads/writes
 *  - window / router access
 *  - generateItinerary() calls (produce a value, then dispatch)
 *  - placeToItineraryItem() (produces a value, then dispatch)
 */

import { createSlice, current, type PayloadAction } from "@reduxjs/toolkit";
import type {
  GeneratedItinerary,
  GeneratedItineraryDay,
  ItineraryItem,
} from "@/types";
import {
  reassignTimeSlots,
  recalculateBudgetFromDays,
  getBudgetStatus,
} from "@/lib/generateItinerary";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * How the active itinerary was loaded:
 *  "generated" — freshly generated from LS_TRIP_INPUT (or after reset/pace-change)
 *  "edited"    — restored from LS_EDITED_ITINERARY (user has prior edits)
 *  "fallback"  — generated from the default Ella demo input (no user trip data)
 */
export type ItinerarySource = "generated" | "edited" | "fallback" | null;

// ── State ─────────────────────────────────────────────────────────────────────

export interface ItineraryState {
  /** The currently active itinerary. null = not yet hydrated. */
  activeItinerary: GeneratedItinerary | null;
  /** True if the user has made manual edits since the last generation or reset. */
  isEdited: boolean;
  /** Last human-readable action label; drives the toast notification. */
  lastAction: string | null;
  /** How the active itinerary was originally loaded in this session. */
  source: ItinerarySource;
}

const initialState: ItineraryState = {
  activeItinerary: null,
  isEdited: false,
  lastAction: null,
  source: null,
};

// ── Pure reducer helpers ───────────────────────────────────────────────────────

/**
 * Reassigns time slots on a new items array and returns a rebuilt day object.
 * Works on plain (non-Draft) values so it can safely be called with
 * `current(draft)` snapshots.
 */
function rebuildDay(
  day: GeneratedItineraryDay,
  items: ItineraryItem[]
): GeneratedItineraryDay {
  const reassigned = reassignTimeSlots(items);
  return {
    ...day,
    items: reassigned,
    totalCostLkr: reassigned.reduce((s, i) => s + i.estimatedCostLkr, 0),
  };
}

// ── Slice ─────────────────────────────────────────────────────────────────────

export const itinerarySlice = createSlice({
  name: "itinerary",
  initialState,
  reducers: {
    /**
     * Set / replace the active itinerary.
     * Marks isEdited only when source === "edited" (restored from localStorage).
     */
    setActiveItinerary(
      state,
      action: PayloadAction<{ itinerary: GeneratedItinerary; source?: ItinerarySource }>
    ) {
      state.activeItinerary = action.payload.itinerary;
      state.source = action.payload.source ?? "generated";
      state.isEdited = action.payload.source === "edited";
      state.lastAction = null;
    },

    /** Clear on Start Over. */
    clearActiveItinerary(state) {
      state.activeItinerary = null;
      state.isEdited = false;
      state.lastAction = null;
      state.source = null;
    },

    /** Explicitly set the source label (rarely needed). */
    setItinerarySource(state, action: PayloadAction<ItinerarySource>) {
      state.source = action.payload;
    },

    /**
     * Mirror-only: mark as edited with a label.
     * Kept for backwards compat; prefer the specific editing actions below.
     */
    markEdited(state, action: PayloadAction<string>) {
      state.isEdited = true;
      state.lastAction = action.payload;
    },

    /** Clear the toast label (auto-dismiss side of the toast flow). */
    clearLastAction(state) {
      state.lastAction = null;
    },

    // ── Structural editing actions ─────────────────────────────────────────────

    /** Remove one place from a specific day and recalculate the budget. */
    removePlaceFromDay(
      state,
      action: PayloadAction<{ dayIndex: number; itemId: string }>
    ) {
      if (!state.activeItinerary) return;
      const { dayIndex, itemId } = action.payload;
      const plainDay = current(state.activeItinerary.days[dayIndex]);
      if (!plainDay) return;
      const newItems = plainDay.items.filter((i) => i.id !== itemId);
      state.activeItinerary.days[dayIndex] = rebuildDay(plainDay, newItems);

      const plainDays = current(state.activeItinerary.days) as GeneratedItineraryDay[];
      const newBudget = recalculateBudgetFromDays(
        current(state.activeItinerary.budget) as GeneratedItinerary["budget"],
        plainDays,
        current(state.activeItinerary.tripInput) as GeneratedItinerary["tripInput"]
      );
      state.activeItinerary.budget = newBudget;
      state.activeItinerary.budgetStatus = getBudgetStatus(
        newBudget,
        current(state.activeItinerary.tripInput) as GeneratedItinerary["tripInput"]
      );
      state.isEdited = true;
      state.lastAction = "Place removed from itinerary.";
    },

    /**
     * Swap one item for a pre-built replacement ItineraryItem.
     * The caller (hook) must compute the new item via placeToItineraryItem()
     * before dispatching — keeps side-effect-free data construction outside
     * the reducer.
     */
    replacePlaceInDay(
      state,
      action: PayloadAction<{ dayIndex: number; itemId: string; newItem: ItineraryItem }>
    ) {
      if (!state.activeItinerary) return;
      const { dayIndex, itemId, newItem } = action.payload;
      const plainDay = current(state.activeItinerary.days[dayIndex]);
      if (!plainDay) return;
      const newItems = plainDay.items.map((i) => (i.id === itemId ? newItem : i));
      state.activeItinerary.days[dayIndex] = rebuildDay(plainDay, newItems);

      const plainDays = current(state.activeItinerary.days) as GeneratedItineraryDay[];
      const newBudget = recalculateBudgetFromDays(
        current(state.activeItinerary.budget) as GeneratedItinerary["budget"],
        plainDays,
        current(state.activeItinerary.tripInput) as GeneratedItinerary["tripInput"]
      );
      state.activeItinerary.budget = newBudget;
      state.activeItinerary.budgetStatus = getBudgetStatus(
        newBudget,
        current(state.activeItinerary.tripInput) as GeneratedItinerary["tripInput"]
      );
      state.isEdited = true;
      state.lastAction = `Replaced with ${newItem.placeName}.`;
    },

    /** Swap a place with the one above it in the same day. */
    movePlaceUp(
      state,
      action: PayloadAction<{ dayIndex: number; itemIndex: number }>
    ) {
      if (!state.activeItinerary) return;
      const { dayIndex, itemIndex } = action.payload;
      const plainDay = current(state.activeItinerary.days[dayIndex]);
      if (!plainDay || itemIndex <= 0) return;
      const items = [...plainDay.items];
      [items[itemIndex - 1], items[itemIndex]] = [items[itemIndex], items[itemIndex - 1]];
      state.activeItinerary.days[dayIndex] = rebuildDay(plainDay, items);
      state.isEdited = true;
      state.lastAction = "Order updated.";
    },

    /** Swap a place with the one below it in the same day. */
    movePlaceDown(
      state,
      action: PayloadAction<{ dayIndex: number; itemIndex: number }>
    ) {
      if (!state.activeItinerary) return;
      const { dayIndex, itemIndex } = action.payload;
      const plainDay = current(state.activeItinerary.days[dayIndex]);
      if (!plainDay || itemIndex >= plainDay.items.length - 1) return;
      const items = [...plainDay.items];
      [items[itemIndex], items[itemIndex + 1]] = [items[itemIndex + 1], items[itemIndex]];
      state.activeItinerary.days[dayIndex] = rebuildDay(plainDay, items);
      state.isEdited = true;
      state.lastAction = "Order updated.";
    },

    /**
     * Replace the active itinerary with a freshly generated one (pace change /
     * reset to generated plan).  The caller computes the new itinerary via
     * generateItinerary() and passes it in — no generation logic lives here.
     *
     * @param markEdited  true for pace change (user-initiated), false for reset.
     */
    setRegeneratedItinerary(
      state,
      action: PayloadAction<{
        itinerary: GeneratedItinerary;
        lastAction: string;
        markEdited?: boolean;
      }>
    ) {
      state.activeItinerary = action.payload.itinerary;
      state.isEdited = action.payload.markEdited ?? false;
      state.source = "generated";
      state.lastAction = action.payload.lastAction;
    },
  },
});

export const {
  setActiveItinerary,
  clearActiveItinerary,
  setItinerarySource,
  markEdited,
  clearLastAction,
  removePlaceFromDay,
  replacePlaceInDay,
  movePlaceUp,
  movePlaceDown,
  setRegeneratedItinerary,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
