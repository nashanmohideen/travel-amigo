/**
 * Temporary in-memory share storage for MVP backend wiring.
 *
 * This is a development-only store that holds shared itineraries in memory.
 * It persists only for the lifetime of the Node.js process.
 *
 * IMPORTANT: This is NOT production-ready persistence.
 * Future phases will replace this with a real database (Postgres, Supabase, etc.).
 *
 * Usage:
 *   - Server-side only (imported in app/api/share/route.ts)
 *   - Do NOT import into client components or hooks
 *   - Do NOT use localStorage or browser APIs here
 */

import type { GeneratedItinerary } from "@/types";

interface ShareRecord {
  token: string;
  itinerary: GeneratedItinerary;
  createdAt: string;
  expiresAt: string | null;
}

/** Module-level in-memory Map. Shared across all API calls within the same process. */
let shareRecords = new Map<string, ShareRecord>();

/**
 * Generate a unique share token.
 * Uses a combination of timestamp and random hex for simplicity.
 * In production, would use UUID or cryptographically secure random token.
 */
function generateShareToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}${random}`;
}

/**
 * Create a new share record and store it.
 *
 * @param itinerary - The GeneratedItinerary to share
 * @returns ShareRecord with generated token and timestamps
 */
export function createShareRecord(itinerary: GeneratedItinerary): ShareRecord {
  const token = generateShareToken();
  const now = new Date().toISOString();

  const record: ShareRecord = {
    token,
    itinerary,
    createdAt: now,
    expiresAt: null, // No expiration for MVP
  };

  shareRecords.set(token, record);
  return record;
}

/**
 * Retrieve a share record by token.
 *
 * @param token - The share token to look up
 * @returns ShareRecord if found, null otherwise
 */
export function getShareRecord(token: string): ShareRecord | null {
  return shareRecords.get(token) ?? null;
}

/**
 * Clear all share records (development/testing only).
 * Not exposed via API.
 */
export function clearShareRecords(): void {
  shareRecords.clear();
}
