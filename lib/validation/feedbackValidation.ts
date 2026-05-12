/**
 * Validation helpers for feedback input.
 *
 * These are lightweight TypeScript functions used for:
 *   - Pre-flight validation on the frontend
 *   - Type guard validation when deserializing from storage
 *   - Future backend API request validation
 *
 * Philosophy: Keep validation simple and deterministic. Use only built-in
 * JavaScript features (no external validation libraries in this phase).
 */

import type {
  FeedbackWouldUse,
  FeedbackBudgetRealism,
  FeedbackWantedNext,
  FEEDBACK_WANTED_NEXT_OPTIONS,
} from "@/types";
import type { ApiValidationResult, ApiValidationError } from "@/features/api/apiTypes";
import { FEEDBACK_WANTED_NEXT_OPTIONS as VALID_WANTED_NEXT } from "@/types";

// ── Type Guards ────────────────────────────────────────────────────────────

/**
 * Type guard for FeedbackWouldUse enum.
 */
function isValidWouldUse(value: unknown): value is FeedbackWouldUse {
  return value === "yes" || value === "maybe" || value === "no";
}

/**
 * Type guard for FeedbackBudgetRealism enum.
 */
function isValidBudgetRealism(value: unknown): value is FeedbackBudgetRealism {
  return (
    value === "too_low" ||
    value === "reasonable" ||
    value === "too_high" ||
    value === "not_sure"
  );
}

/**
 * Type guard for FeedbackWantedNext option.
 */
function isValidWantedNextOption(value: unknown): value is FeedbackWantedNext {
  return VALID_WANTED_NEXT.includes(value as never);
}

// ── Validation Functions ───────────────────────────────────────────────────

/**
 * Validate a feedback input object and return detailed validation results.
 *
 * Used for:
 *   - Frontend form submission validation (FeedbackForm)
 *   - Request body validation before API calls
 *   - Error reporting with per-field messages
 *
 * Note: Feedback submissions have optional fields depending on context.
 * This validator checks the main required/constrained fields.
 */
export function validateFeedbackInput(input: unknown): ApiValidationResult {
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

  const feedback = input as Record<string, unknown>;

  // wouldUse validation (if present, must be valid)
  if ("wouldUse" in feedback) {
    if (!isValidWouldUse(feedback.wouldUse)) {
      errors.push({
        field: "wouldUse",
        message: "Would use must be 'yes', 'maybe', or 'no'",
      });
    }
  }

  // usefulnessRating validation (if present, must be 1–5)
  if ("usefulnessRating" in feedback) {
    if (typeof feedback.usefulnessRating !== "number") {
      errors.push({
        field: "usefulnessRating",
        message: "Usefulness rating must be a number",
      });
    } else if (
      feedback.usefulnessRating < 1 ||
      feedback.usefulnessRating > 5
    ) {
      errors.push({
        field: "usefulnessRating",
        message: "Usefulness rating must be between 1 and 5",
      });
    }
  }

  // budgetRealism validation (if present, must be valid enum)
  if ("budgetRealism" in feedback) {
    if (!isValidBudgetRealism(feedback.budgetRealism)) {
      errors.push({
        field: "budgetRealism",
        message:
          "Budget realism must be 'too_low', 'reasonable', 'too_high', or 'not_sure'",
      });
    }
  }

  // wantedNext validation (if present, must be array of valid options)
  if ("wantedNext" in feedback) {
    if (!Array.isArray(feedback.wantedNext)) {
      errors.push({
        field: "wantedNext",
        message: "Wanted next must be an array",
      });
    } else {
      for (const option of feedback.wantedNext) {
        if (!isValidWantedNextOption(option)) {
          errors.push({
            field: "wantedNext",
            message: `Invalid wanted next option: ${option}`,
          });
          break; // Report only first invalid option
        }
      }
    }
  }

  // missingOrUnrealistic validation (if present, must be string)
  if ("missingOrUnrealistic" in feedback) {
    if (
      feedback.missingOrUnrealistic !== null &&
      typeof feedback.missingOrUnrealistic !== "string"
    ) {
      errors.push({
        field: "missingOrUnrealistic",
        message: "Missing or unrealistic must be a string or null",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
