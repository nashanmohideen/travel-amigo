/**
 * uiSlice
 *
 * Lightweight app-level UI state.
 *
 * Scope: only state that is genuinely cross-component or needs to persist
 * across route changes.  Simple local state (e.g. a single modal's open flag
 * that only one component needs) should remain as useState.
 *
 * Current prototype: slice is wired but components have not been migrated to
 * read from it yet.  Migration happens per-component in later phases.
 */

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// ── Types ─────────────────────────────────────────────────────────────────────

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  message: string;
  type: ToastType;
}

// ── State ─────────────────────────────────────────────────────────────────────

export interface UiState {
  /** Whether the share modal is open application-wide */
  shareModalOpen: boolean;
  /** Whether the mock/real assistant panel is expanded */
  assistantPanelOpen: boolean;
  /** Current toast to display; null = no active toast */
  toast: ToastMessage | null;
  /** Non-null = full-screen global loading overlay with this label */
  globalLoadingLabel: string | null;
}

const initialState: UiState = {
  shareModalOpen: false,
  assistantPanelOpen: false,
  toast: null,
  globalLoadingLabel: null,
};

// ── Slice ─────────────────────────────────────────────────────────────────────

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openShareModal(state) {
      state.shareModalOpen = true;
    },

    closeShareModal(state) {
      state.shareModalOpen = false;
    },

    toggleAssistantPanel(state) {
      state.assistantPanelOpen = !state.assistantPanelOpen;
    },

    /**
     * Display a toast notification.
     * Components that still use local lastAction state can be migrated to
     * dispatch showToast() in a later phase.
     */
    showToast(state, action: PayloadAction<ToastMessage>) {
      state.toast = action.payload;
    },

    clearToast(state) {
      state.toast = null;
    },

    /** Show a full-page loading overlay (e.g. during API itinerary generation). */
    setGlobalLoading(state, action: PayloadAction<string>) {
      state.globalLoadingLabel = action.payload;
    },

    clearGlobalLoading(state) {
      state.globalLoadingLabel = null;
    },
  },
});

export const {
  openShareModal,
  closeShareModal,
  toggleAssistantPanel,
  showToast,
  clearToast,
  setGlobalLoading,
  clearGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;
