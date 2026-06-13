/**
 * Shared helpers for the auth pages.
 *
 * The backend's ApiErrorFilter returns validation failures as
 *   { message: "Validation failed", code: "VALIDATION_ERROR", details: string[] }
 * where details holds raw class-validator messages ("email must be an email",
 * "Password must be at least 8 characters"). mapValidationErrors() assigns
 * those to fields by keyword, and also accepts { field, message } objects
 * defensively in case the contract is upgraded later.
 */

import type { ApiError, ApiValidationError } from "@/features/api/apiTypes";
import type { AuthUserPayload } from "@/lib/api-client";
import type { AuthUser } from "@/features/auth/authSlice";

/** Error shape produced by the axios-backed baseQuery in features/api/baseApi.ts. */
export interface ApiQueryError {
  status?: number;
  data: ApiError;
}

export function isApiQueryError(err: unknown): err is ApiQueryError {
  return typeof err === "object" && err !== null && "data" in err;
}

export interface AuthFieldErrors {
  email?: string;
  password?: string;
}

/** Assign backend validation messages to the email/password fields. */
export function mapValidationErrors(details: unknown): AuthFieldErrors {
  const fields: AuthFieldErrors = {};
  if (!Array.isArray(details)) return fields;

  for (const entry of details) {
    if (typeof entry === "string") {
      const lower = entry.toLowerCase();
      if (lower.includes("email") && !fields.email) fields.email = entry;
      else if (lower.includes("password") && !fields.password) fields.password = entry;
    } else if (isFieldError(entry)) {
      if (entry.field === "email" && !fields.email) fields.email = entry.message;
      if (entry.field === "password" && !fields.password) fields.password = entry.message;
    }
  }
  return fields;
}

function isFieldError(entry: unknown): entry is ApiValidationError {
  return (
    typeof entry === "object" &&
    entry !== null &&
    "field" in entry &&
    "message" in entry
  );
}

/** Narrow the backend's role string to the AuthUser union. */
export function toAuthUser(payload: AuthUserPayload): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role === "admin" ? "admin" : "user",
    emailVerified: payload.emailVerified,
  };
}
