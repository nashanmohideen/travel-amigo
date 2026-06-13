/**
 * Typed Redux hooks for Travel Amigo.
 *
 * Always import these instead of the plain react-redux hooks to get
 * full TypeScript inference for RootState and AppDispatch.
 *
 * Usage:
 *   import { useAppDispatch, useAppSelector } from "@/store/hooks";
 *
 *   const dispatch = useAppDispatch();
 *   const draft = useAppSelector((state) => state.tripDraft.draft);
 */

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed dispatch hook.
 * Returns AppDispatch so async thunks are correctly typed.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Typed selector hook.
 * Infers return type from the selector function automatically.
 */
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector);
