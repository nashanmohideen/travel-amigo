"use client";

/**
 * useEditableItinerary — Phase 4: Redux controller hook
 *
 * This hook is the single public interface for itinerary state on the
 * /itinerary/demo page.  It bridges Redux (source of truth) and localStorage
 * (persistence fallback) without leaking either concern into the UI.
 *
 * Responsibilities:
 *  1. Hydrate Redux on mount from localStorage (LS_EDITED → LS_TRIP → demo fallback).
 *  2. Persist the active itinerary to LS_EDITED_ITINERARY after every edit.
 *  3. Expose the same public API surface as the Phase 3 version so that
 *     GeneratedItineraryView requires zero import/JSX changes.
 *
 * What this hook does NOT do (Redux architecture rule):
 *  - Modify localStorage inside Redux reducers.
 *  - Navigate or call window inside Redux reducers.
 *  - Duplicate generation/budget logic (those live in lib/generateItinerary).
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setActiveItinerary,
  clearActiveItinerary,
  clearLastAction as clearLastActionCreator,
  removePlaceFromDay,
  replacePlaceInDay,
  movePlaceUp as movePlaceUpAction,
  movePlaceDown as movePlaceDownAction,
  setRegeneratedItinerary,
} from "@/features/itinerary/itinerarySlice";
import { resetTripDraft } from "@/features/trips/tripDraftSlice";
import { useGenerateItineraryMutation } from "@/features/itinerary/itineraryApi";
import type {
  GeneratedItinerary,
  TripInput,
  TripPace,
  Place,
  PlaceInterest,
} from "@/types";
import {
  generateItinerary,
  createDefaultTripInput,
  placeToItineraryItem,
} from "@/lib/generateItinerary";
import { getPlacesByDestination, rankPlaces } from "@/lib/placeHelpers";
import {
  LS_TRIP_INPUT as LS_TRIP,
  LS_EDITED_ITINERARY as LS_EDITED,
  LS_SHARED_ITINERARY_DEMO,
} from "@/lib/storageKeys";
import { isValidItinerary } from "@/lib/itinerary/itineraryHelpers";

// ── localStorage helpers ───────────────────────────────────────────────────────

function saveEdited(itinerary: GeneratedItinerary): void {
  try {
    localStorage.setItem(LS_EDITED, JSON.stringify(itinerary));
  } catch {
    /* quota exceeded — silently skip */
  }
}

// ── Public API type ────────────────────────────────────────────────────────────

export interface EditableItineraryState {
  /** The live itinerary — null only during SSR / initial hydration */
  itinerary: GeneratedItinerary | null;
  /** The current TripInput (from itinerary.tripInput after hydration) */
  tripInput: TripInput | null;
  /** True if trip data came from localStorage (user came from /plan) */
  fromStorage: boolean;
  /** True if the user has made manual edits */
  isEdited: boolean;
  /** Latest action message for toast display; null = no pending notification */
  lastAction: string | null;

  removePlace(dayIndex: number, itemId: string): void;
  replacePlace(dayIndex: number, itemId: string, newPlace: Place): void;
  movePlaceUp(dayIndex: number, itemIndex: number): void;
  movePlaceDown(dayIndex: number, itemIndex: number): void;
  /** Async: regenerates via POST /api/v1/trips/generate (local fallback). */
  changePace(pace: TripPace): Promise<void>;
  resetToGenerated(): void;
  startOver(): void;
  /** Returns ranked alternative places (excludes already-used ones). */
  getAlternatives(dayIndex: number, itemId: string): Place[];
  clearLastAction(): void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEditableItinerary(): EditableItineraryState {
  const dispatch = useAppDispatch();
  const [generateMutation] = useGenerateItineraryMutation();

  // ── Redux selectors ──────────────────────────────────────────────────────
  const activeItinerary = useAppSelector((s) => s.itinerary.activeItinerary);
  const itinerarySource = useAppSelector((s) => s.itinerary.source);
  const isEdited = useAppSelector((s) => s.itinerary.isEdited);
  const lastAction = useAppSelector((s) => s.itinerary.lastAction);

  // ── Local state for values that only matter at mount time ────────────────
  // fromStorage tracks whether the session started from a real user trip plan.
  // It is set once during hydration and never changes, so useState is correct.
  const [fromStorage, setFromStorage] = useState(false);

  // Guard: skip the persistence effect until after hydration is complete.
  const hydratedRef = useRef(false);

  // Refs so performHydration reads current Redux values without adding them
  // to the effect's dependency array (we only want the effect to run once).
  const activeItineraryRef = useRef(activeItinerary);
  activeItineraryRef.current = activeItinerary;
  const itinerarySourceRef = useRef(itinerarySource);
  itinerarySourceRef.current = itinerarySource;

  // ── Helper: Try API generation with fallback to local generator ──────────
  /**
   * Attempts to generate an itinerary using the RTK Query mutation.
   * If the API fails (network, timeout, 400/500), falls back to local generation.
   * 
   * Returns a promise that resolves to a GeneratedItinerary and  
   * whether it came from the API or local fallback.
   */
  const generateWithApiFallback = useCallback(
    async (input: TripInput): Promise<{
      itinerary: GeneratedItinerary;
      source: "api" | "local_fallback";
    }> => {
      try {
        // Try the server API first
        const apiItinerary = await generateMutation(input).unwrap();
        return { itinerary: apiItinerary, source: "api" };
      } catch (error) {
        // API failed — fall back to local generation
        // Silently use the local generator; we don't crash the page
        const localItinerary = generateItinerary(input);
        return { itinerary: localItinerary, source: "local_fallback" };
      }
    },
    [generateMutation]
  );

  // ── Hydration from localStorage (runs once on mount) ────────────────────
  useEffect(() => {
    let isMounted = true;

    const performHydration = async () => {
      // 0. If the form already generated and stored an itinerary in Redux
      //    (source === "generated"), use it directly — skip re-fetch.
      if (activeItineraryRef.current && itinerarySourceRef.current === "generated") {
        if (isMounted) {
          setFromStorage(true);
          hydratedRef.current = true;
        }
        return;
      }

      // 1. Try to load trip input from localStorage
      let input: TripInput | null = null;
      let gotStorage = false;
      try {
        const raw = localStorage.getItem(LS_TRIP);
        if (raw) {
          input = JSON.parse(raw) as TripInput;
          gotStorage = true;
        }
      } catch {
        /* invalid JSON — treat as missing */
      }

      // 2. Try to restore a previously edited itinerary
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

      // 3. Decide what to load into Redux
      if (edited) {
        // Sanity-check: edited itinerary must match current trip destination
        const destMatch =
          !input || edited.tripInput?.destination === input.destination;
        if (destMatch) {
          if (isMounted) {
            dispatch(setActiveItinerary({ itinerary: edited, source: "edited" }));
            setFromStorage(gotStorage);
            hydratedRef.current = true;
          }
          return;
        }
        // Stale edited itinerary (different destination) — discard it
        try {
          localStorage.removeItem(LS_EDITED);
        } catch {}
      }

      // Fresh generation — use API first with local fallback
      if (!input) input = createDefaultTripInput();
      const { itinerary: fresh } = await generateWithApiFallback(input);

      if (isMounted) {
        // Determine the source label: prioritize "generated" (API + gotStorage) or "fallback"
        const src = gotStorage ? "generated" : "fallback";
        dispatch(setActiveItinerary({ itinerary: fresh, source: src }));
        setFromStorage(gotStorage);
        hydratedRef.current = true;
      }
    };

    performHydration();

    return () => {
      isMounted = false;
    };
  }, [dispatch, generateWithApiFallback]);

  // ── Persist edited itinerary to localStorage after every edit ────────────
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (!activeItinerary || !isEdited) return;
    saveEdited(activeItinerary);
  }, [activeItinerary, isEdited]);

  // ── Derived values ────────────────────────────────────────────────────────
  const tripInput = activeItinerary?.tripInput ?? null;

  // ── Edit actions ──────────────────────────────────────────────────────────

  const removePlace = useCallback(
    (dayIndex: number, itemId: string) => {
      dispatch(removePlaceFromDay({ dayIndex, itemId }));
    },
    [dispatch]
  );

  const replacePlace = useCallback(
    (dayIndex: number, itemId: string, newPlace: Place) => {
      if (!activeItinerary) return;
      const newItem = placeToItineraryItem(newPlace, activeItinerary.tripInput.travelers);
      dispatch(replacePlaceInDay({ dayIndex, itemId, newItem }));
    },
    [dispatch, activeItinerary]
  );

  const movePlaceUp = useCallback(
    (dayIndex: number, itemIndex: number) => {
      dispatch(movePlaceUpAction({ dayIndex, itemIndex }));
    },
    [dispatch]
  );

  const movePlaceDown = useCallback(
    (dayIndex: number, itemIndex: number) => {
      dispatch(movePlaceDownAction({ dayIndex, itemIndex }));
    },
    [dispatch]
  );

  const changePace = useCallback(
    async (pace: TripPace) => {
      const input = tripInput ?? createDefaultTripInput();
      const newInput: TripInput = { ...input, pace };
      
      // Try API generation with local fallback
      try {
        const { itinerary: fresh } = await generateWithApiFallback(newInput);
        
        // Write updated trip input to localStorage so it survives a page refresh
        try {
          localStorage.setItem(LS_TRIP, JSON.stringify(newInput));
        } catch {}
        
        const label =
          { relaxed: "Relaxed", balanced: "Balanced", packed: "Packed" }[pace] ?? pace;
        dispatch(
          setRegeneratedItinerary({
            itinerary: fresh,
            lastAction: `Pace changed to ${label} — itinerary regenerated.`,
            markEdited: true,
          })
        );
      } catch {
        // Should not happen with local fallback, but handle gracefully
        console.error("Failed to regenerate itinerary after pace change");
      }
    },
    [dispatch, tripInput, generateWithApiFallback]
  );

  const resetToGenerated = useCallback(async () => {
    try {
      localStorage.removeItem(LS_EDITED);
    } catch {}
    const input = tripInput ?? createDefaultTripInput();
    
    // Try API generation with local fallback
    try {
      const { itinerary: fresh } = await generateWithApiFallback(input);
      dispatch(
        setRegeneratedItinerary({
          itinerary: fresh,
          lastAction: "Reset to original generated plan.",
          markEdited: false,
        })
      );
    } catch {
      // Should not happen with local fallback, but handle gracefully
      console.error("Failed to regenerate itinerary after reset");
    }
  }, [dispatch, tripInput, generateWithApiFallback]);

  const startOver = useCallback(() => {
    // Clear the three keys that belong to this session — never touch LS_FEEDBACK_SUBMISSIONS
    try {
      localStorage.removeItem(LS_TRIP);
      localStorage.removeItem(LS_EDITED);
      localStorage.removeItem(LS_SHARED_ITINERARY_DEMO);
    } catch {}
    dispatch(clearActiveItinerary());
    dispatch(resetTripDraft());
    // Navigation (router.push) intentionally stays in the calling component
  }, [dispatch]);

  const getAlternatives = useCallback(
    (dayIndex: number, itemId: string): Place[] => {
      if (!activeItinerary) return [];
      const usedIds = new Set(
        activeItinerary.days.flatMap((d) => d.items.map((i) => i.placeId))
      );
      // Keep the slot we're replacing available as an option
      const replacingItem = activeItinerary.days[dayIndex]?.items.find(
        (i) => i.id === itemId
      );
      if (replacingItem) usedIds.delete(replacingItem.placeId);

      const allForDest = getPlacesByDestination(activeItinerary.tripInput.destination);
      const available = allForDest.filter((p) => !usedIds.has(p.id));
      return rankPlaces(available, activeItinerary.tripInput.interests as PlaceInterest[]);
    },
    [activeItinerary]
  );

  const clearLastAction = useCallback(() => {
    dispatch(clearLastActionCreator());
  }, [dispatch]);

  return {
    itinerary: activeItinerary,
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


