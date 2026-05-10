/**
 * Redux store for Travel Amigo.
 *
 * Slice registry — add new slices here as they are created:
 *   tripDraft   — active trip planning form data (/plan)
 *   ui          — app-level UI flags (modals, toasts, global loading)
 *   itinerary   — active generated/edited itinerary (Phase 3: skeleton only)
 *
 * Note on redux-persist:
 *   Intentionally excluded in Phase 3.  Next.js App Router SSR makes naive
 *   persistence setups produce hydration mismatches.  Persistence will be
 *   added in a controlled phase after server-side data fetching is in place.
 */

import { configureStore } from "@reduxjs/toolkit";
import tripDraftReducer from "@/features/trips/tripDraftSlice";
import uiReducer from "@/features/ui/uiSlice";
import itineraryReducer from "@/features/itinerary/itinerarySlice";

export const store = configureStore({
  reducer: {
    tripDraft: tripDraftReducer,
    ui: uiReducer,
    itinerary: itineraryReducer,
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

/** Inferred root state type — use via useAppSelector. */
export type RootState = ReturnType<typeof store.getState>;

/** Inferred dispatch type — use via useAppDispatch. */
export type AppDispatch = typeof store.dispatch;
