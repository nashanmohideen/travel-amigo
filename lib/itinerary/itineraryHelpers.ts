/**
 * Shared itinerary display helpers for Travel Amigo.
 *
 * Functions and maps that were previously duplicated across
 * GeneratedItineraryView and SharedItineraryView live here.
 */

import type { BudgetStatus, GeneratedItinerary } from "@/types";

// ── Warning severity ──────────────────────────────────────────────────────────

export interface WarningSeverityStyle {
  icon: string;
  bg: string;
  border: string;
  text: string;
}

/**
 * Tailwind style sets for each budget warning level.
 * Used by both the editable itinerary view and the shared read-only view.
 */
export const WARNING_SEVERITY_STYLES: Record<string, WarningSeverityStyle> = {
  over_budget: {
    icon: "⛔",
    bg: "bg-red-50",
    border: "border-red-300",
    text: "text-red-700",
  },
  tight_budget: {
    icon: "⚠️",
    bg: "bg-amber-50",
    border: "border-amber-300",
    text: "text-amber-700",
  },
  default: {
    icon: "ℹ️",
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-700",
  },
};

/**
 * Resolve the display severity for a warning message given the overall
 * budget status.  Budget-related messages escalate to the budget status level;
 * all other messages use the default info style.
 */
export function getWarningSeverity(
  budgetStatus: BudgetStatus,
  text: string
): WarningSeverityStyle {
  const lower = text.toLowerCase();
  if (budgetStatus === "over_budget" && lower.includes("budget"))
    return WARNING_SEVERITY_STYLES.over_budget;
  if (budgetStatus === "tight_budget" && lower.includes("budget"))
    return WARNING_SEVERITY_STYLES.tight_budget;
  return WARNING_SEVERITY_STYLES.default;
}

// ── Itinerary type guard ──────────────────────────────────────────────────────

/**
 * Type guard: returns true if `obj` looks like a valid GeneratedItinerary.
 *
 * Used when deserialising from localStorage.  Validates only the top-level
 * shape; deep validation happens at the API boundary in the MVP phase.
 */
export function isValidItinerary(obj: unknown): obj is GeneratedItinerary {
  if (!obj || typeof obj !== "object") return false;
  const g = obj as Record<string, unknown>;
  return (
    typeof g.id === "string" &&
    Array.isArray(g.days) &&
    typeof g.budget === "object" &&
    typeof g.tripInput === "object"
  );
}
