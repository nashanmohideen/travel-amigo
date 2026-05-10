/**
 * itinerarySlice — skeleton only (Phase 3)
 *
 * This slice holds the active (generated + edited) itinerary at app level.
 *
 * CURRENT STATUS (Phase 3):
 *   Only the data shape and three lightweight actions are implemented.
 *   All complex editing logic (remove/replace/move/pace/reset) remains in
 *   useEditableItinerary until Phase 4, where the full migration happens.
 *
 * WHY NOT MIGRATE YET:
 *   The editing logic in useEditableItinerary is correct and well-tested.
 *   Migrating it here requires:
 *     - Moving recalculateBudgetFromDays + getBudgetStatus into the reducer
 *     - Verifying full parity of Immer-based writes vs the current approach
 *     - Updating GeneratedItineraryView to dispatch instead of calling hook methods
 *   That deserves a dedicated phase with route-level verification.
 *
 * MIGRATION PATH (Phase 4):
 *   1. Move each action from useEditableItinerary into this slice's reducers.
 *   2. Replace useEditableItinerary with useAppSelector + useAppDispatch.
 *   3. Add redux-persist for the activeItinerary key.
 *   4. Remove LS_EDITED_ITINERARY writes.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { GeneratedItinerary } from "@/types";

// ── State ─────────────────────────────────────────────────────────────────────

export interface ItineraryState {
  /** The currently active itinerary (generated or restored). null = none loaded. */
  activeItinerary: GeneratedItinerary | null;
  /** True if the user has made any edits since the last generation or reset. */
  isEdited: boolean;
  /** Last human-readable action label for toast/notification display. */
  lastAction: string | null;
}

const initialState: ItineraryState = {
  activeItinerary: null,
  isEdited: false,
  lastAction: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const itinerarySlice = createSlice({
  name: "itinerary",
  initialState,
  reducers: {
    /**
     * Set the active itinerary (after generation or restore from storage).
     * Does NOT mark the itinerary as edited.
     */
    setActiveItinerary(state, action: PayloadAction<GeneratedItinerary>) {
      state.activeItinerary = action.payload;
      state.isEdited = false;
      state.lastAction = null;
    },

    /** Clear the active itinerary (e.g. on Start Over). */
    clearActiveItinerary(state) {
      state.activeItinerary = null;
      state.isEdited = false;
      state.lastAction = null;
    },

    /**
     * Mark the itinerary as edited and record the action label.
     * Call this alongside any localStorage write in useEditableItinerary
     * during the transition period so Redux mirrors the edit flag correctly.
     */
    markEdited(state, action: PayloadAction<string>) {
      state.isEdited = true;
      state.lastAction = action.payload;
    },

    /** Clear the last action label (used by toast auto-dismiss). */
    clearLastAction(state) {
      state.lastAction = null;
    },
  },
});

export const {
  setActiveItinerary,
  clearActiveItinerary,
  markEdited,
  clearLastAction,
} = itinerarySlice.actions;

export default itinerarySlice.reducer;
