/**
 * Validation helpers for trip/itinerary input.
 *
 * These are lightweight TypeScript functions used for:
 *   - Pre-flight validation on the frontend
 *   - Type guard validation when deserializing from storage
 *   - Future backend API request validation
 *
 * Philosophy: Keep validation simple and deterministic. Use only built-in
 * JavaScript features (no external validation libraries in this phase).
 */

import type { TripInput, TravelStyle, TransportMode, TripPace } from "@/types";
import type { ApiValidationResult, ApiValidationError } from "@/features/api/apiTypes";

// ── Type Guards ────────────────────────────────────────────────────────────

/**
 * Type guard: checks if a value looks like a valid TripInput.
 */
export function isValidTripInput(input: unknown): input is TripInput {
  if (!input || typeof input !== "object") return false;

  const trip = input as Record<string, unknown>;

  // Required fields
  if (typeof trip.destination !== "string" || trip.destination.trim() === "") {
    return false;
  }
  if (
    typeof trip.duration !== "number" ||
    trip.duration < 1 ||
    trip.duration > 14
  ) {
    return false;
  }
  if (
    typeof trip.travelers !== "number" ||
    trip.travelers < 1 ||
    trip.travelers > 20
  ) {
    return false;
  }
  if (typeof trip.budgetLKR !== "number" || trip.budgetLKR <= 0) {
    return false;
  }

  // Enum fields
  if (!isValidTravelStyle(trip.travelStyle)) return false;
  if (!isValidTransportMode(trip.transportMode)) return false;
  if (!isValidPace(trip.pace)) return false;

  // Array fields
  if (!Array.isArray(trip.interests)) return false;

  return true;
}

/**
 * Type guard for TravelStyle enum.
 */
function isValidTravelStyle(value: unknown): value is TravelStyle {
  return value === "budget" || value === "balanced" || value === "premium";
}

/**
 * Type guard for TransportMode enum.
 */
function isValidTransportMode(value: unknown): value is TransportMode {
  return value === "public" || value === "private" || value === "mixed";
}

/**
 * Type guard for TripPace enum.
 */
function isValidPace(value: unknown): value is TripPace {
  return value === "relaxed" || value === "balanced" || value === "packed";
}

// ── Validation Functions ───────────────────────────────────────────────────

/**
 * Validate a TripInput object and return detailed validation results.
 *
 * Used for:
 *   - Frontend form submission validation
 *   - Request body validation before API calls
 *   - Error reporting with per-field messages
 */
export function validateTripInput(input: unknown): ApiValidationResult {
  const errors: ApiValidationError[] = [];

  if (!input || typeof input !== "object") {
    return {
      valid: false,
      errors: [
        {
          field: "root",
          message: "Input must be a non-null object",
        },
      ],
    };
  }

  const trip = input as Record<string, unknown>;

  // Destination validation
  if (typeof trip.destination !== "string") {
    errors.push({
      field: "destination",
      message: "Destination must be a string",
    });
  } else if (trip.destination.trim() === "") {
    errors.push({
      field: "destination",
      message: "Destination cannot be empty",
    });
  }

  // Duration validation
  if (typeof trip.duration !== "number") {
    errors.push({
      field: "duration",
      message: "Duration must be a number",
    });
  } else if (trip.duration < 1 || trip.duration > 14) {
    errors.push({
      field: "duration",
      message: "Duration must be between 1 and 14 days",
    });
  }

  // Travelers validation
  if (typeof trip.travelers !== "number") {
    errors.push({
      field: "travelers",
      message: "Traveler count must be a number",
    });
  } else if (trip.travelers < 1 || trip.travelers > 20) {
    errors.push({
      field: "travelers",
      message: "Traveler count must be between 1 and 20",
    });
  }

  // Budget validation
  if (typeof trip.budgetLKR !== "number") {
    errors.push({
      field: "budgetLKR",
      message: "Budget must be a number",
    });
  } else if (trip.budgetLKR <= 0) {
    errors.push({
      field: "budgetLKR",
      message: "Budget must be greater than 0",
    });
  }

  // Travel style validation
  if (!isValidTravelStyle(trip.travelStyle)) {
    errors.push({
      field: "travelStyle",
      message: "Travel style must be 'budget', 'balanced', or 'premium'",
    });
  }

  // Transport mode validation
  if (!isValidTransportMode(trip.transportMode)) {
    errors.push({
      field: "transportMode",
      message: "Transport mode must be 'public', 'private', or 'mixed'",
    });
  }

  // Pace validation
  if (!isValidPace(trip.pace)) {
    errors.push({
      field: "pace",
      message: "Pace must be 'relaxed', 'balanced', or 'packed'",
    });
  }

  // Interests validation
  if (!Array.isArray(trip.interests)) {
    errors.push({
      field: "interests",
      message: "Interests must be an array",
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
