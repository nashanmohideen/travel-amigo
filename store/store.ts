/**
 * Redux store for Travel Amigo.
 *
 * Slice registry:
 *   tripDraft   — active trip planning form data (/plan)
 *   ui          — app-level UI flags (modals, toasts, global loading)
 *   itinerary   — active generated/edited itinerary
 *   auth        — logged-in user, access token (in-memory), session status
 *   baseApi     — RTK Query API endpoints (Phase 7+)
 *
 * Middleware:
 *   baseApi.middleware — RTK Query listener middleware for cache invalidation
 *
 * Note on redux-persist:
 *   Intentionally excluded.  Next.js App Router SSR makes naive persistence
 *   setups produce hydration mismatches.  Persistence is controlled by
 *   useEditableItinerary hook lifecycle.
 */

import { configureStore } from "@reduxjs/toolkit";
import tripDraftReducer from "@/features/trips/tripDraftSlice";
import uiReducer from "@/features/ui/uiSlice";
import itineraryReducer from "@/features/itinerary/itinerarySlice";
import authReducer from "@/features/auth/authSlice";
import { baseApi } from "@/features/api/baseApi";

export const store = configureStore({
  reducer: {
    tripDraft: tripDraftReducer,
    ui: uiReducer,
    itinerary: itineraryReducer,
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// ── Types ─────────────────────────────────────────────────────────────────────

/** Inferred root state type — use via useAppSelector. */
export type RootState = ReturnType<typeof store.getState>;

/** Inferred dispatch type — use via useAppDispatch. */
export type AppDispatch = typeof store.dispatch;
