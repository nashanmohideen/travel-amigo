/**
 * Shared formatting utilities for Travel Amigo.
 *
 * All date and money formatting used across components lives here.
 * Do not duplicate these inline — import from this module instead.
 */

/**
 * Format an ISO date/datetime string to a display date.
 * Output example: "14 Apr 2026"
 *
 * Used on itinerary headers and shared-itinerary chips (generatedAt).
 */
export function formatDisplayDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO date/datetime string to a display date + time.
 * Output example: "14 Apr 2026, 09:35"
 *
 * Used on the feedback dashboard submission list.
 */
export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/**
 * Format a number as Sri Lankan Rupees.
 * Output example: "LKR 12,500"
 *
 * Equivalent to the formatLKR helper in lib/utils — prefer this import for
 * display-layer code; lib/utils.formatLKR remains for generator logic.
 */
export function formatLkr(amount: number): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);
}
