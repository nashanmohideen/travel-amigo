/**
 * tripDraftSlice
 *
 * Holds the user's active trip-planning draft (the data collected by /plan form).
 *
 * Prototype phase:
 *   Redux slice is prepared but TripForm continues to write to localStorage
 *   via LS_TRIP_INPUT as the primary persistence mechanism.  The slice fields
 *   mirror TripInput exactly so that the MVP migration (phase 4+) can swap
 *   localStorage reads for store reads without touching the type layer.
 *
 * MVP migration path:
 *   1. Dispatch setTripDraft after form submit (already wired below as optional).
 *   2. Read from store instead of localStorage in useEditableItinerary.
 *   3. Remove LS_TRIP_INPUT writes.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TripInput, TravelStyle, TransportMode, TripPace } from "@/types";

// ── State ─────────────────────────────────────────────────────────────────────

export interface TripDraftState {
  /** null = no draft in store (prototype: read from localStorage instead) */
  draft: TripInput | null;
  /** Whether the current draft was explicitly set by the user in this session */
  isDirty: boolean;
}

const initialState: TripDraftState = {
  draft: null,
  isDirty: false,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const tripDraftSlice = createSlice({
  name: "tripDraft",
  initialState,
  reducers: {
    /**
     * Replace the whole draft.
     * Dispatch after /plan form submit, or after loading from storage.
     */
    setTripDraft(state, action: PayloadAction<TripInput>) {
      state.draft = action.payload;
      state.isDirty = true;
    },

    /**
     * Update a single field without replacing the full draft.
     * Useful for real-time sync once TripForm is wired to Redux.
     */
    updateTripDraftField<K extends keyof TripInput>(
      state: TripDraftState,
      action: PayloadAction<{ field: K; value: TripInput[K] }>
    ) {
      if (!state.draft) return;
      (state.draft[action.payload.field] as TripInput[K]) = action.payload.value;
      state.isDirty = true;
    },

    /** Clear the draft (e.g. after Start Over). */
    resetTripDraft(state) {
      state.draft = null;
      state.isDirty = false;
    },

    /**
     * Hydrate the draft from a raw value already parsed from localStorage.
     * Call this from a useEffect on app boot — never from a server component.
     *
     * Example usage in a client component:
     *   const raw = localStorage.getItem(LS_TRIP_INPUT);
     *   if (raw) dispatch(hydrateTripDraftFromStorageValue(JSON.parse(raw)));
     */
    hydrateTripDraftFromStorageValue(state, action: PayloadAction<TripInput>) {
      // Only hydrate if no draft is already present to avoid overwriting
      // a draft set later in the same session.
      if (state.draft === null) {
        state.draft = action.payload;
        state.isDirty = false;
      }
    },
  },
});

export const {
  setTripDraft,
  updateTripDraftField,
  resetTripDraft,
  hydrateTripDraftFromStorageValue,
} = tripDraftSlice.actions;

export default tripDraftSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

export type { TravelStyle, TransportMode, TripPace };
