import type { TripInput } from "@/types";

// Backend DTO shape — do not change these field names
export interface GenerateDTO {
  destination: string;
  duration: number;
  budgetLKR: number;
  travelers: number;
  travelStyle: "budget" | "balanced" | "premium";
  transportMode: "public" | "private" | "mixed";
  pace: "relaxed" | "balanced" | "packed";
  interests: string[];
  startDate?: string;
}

// Form travelStyle values → backend price tier
// Form uses the exact DTO values, so this is an identity map +
// a safety net for any stale localStorage values.
const TRAVEL_STYLE_MAP: Record<string, "budget" | "balanced" | "premium"> = {
  budget:   "budget",
  balanced: "balanced",
  premium:  "premium",
  // Legacy / stale localStorage keys:
  luxury:     "premium",
  comfort:    "premium",
  adventure:  "balanced",
  cultural:   "balanced",
  nature:     "balanced",
  relaxed:    "balanced",
  backpacker: "budget",
};

const DEFAULT_PACE: Record<string, "relaxed" | "balanced" | "packed"> = {
  budget:   "packed",
  balanced: "balanced",
  premium:  "relaxed",
};

const DEFAULT_TRANSPORT: Record<string, "public" | "private" | "mixed"> = {
  budget:   "public",
  balanced: "mixed",
  premium:  "private",
};

// Maps groupType string → headcount — handles stale localStorage that predates
// the travelers integer field.
const TRAVELER_COUNT: Record<string, number> = {
  solo:   1,
  couple: 2,
  family: 4,
  group:  6,
};

// Maps form interest values → exact DB strings (case-sensitive match required).
// Form currently sends the exact DB values, so this is an identity map + a
// safety net for stale localStorage entries or future UI label changes.
const INTEREST_MAP: Record<string, string> = {
  nature:      "nature",
  culture:     "culture",
  food:        "food",
  adventure:   "adventure",
  beaches:     "beaches",
  photography: "photography",
  family:      "family",
  relaxation:  "relaxation",
  // Legacy / stale keys:
  beach:       "beaches",
  wildlife:    "nature",
  history:     "culture",
  hiking:      "adventure",
  shopping:    "food",
  wellness:    "relaxation",
  religion:    "culture",
  tea:         "nature",
  swimming:    "beaches",
};

export function toGenerateDTO(input: TripInput): GenerateDTO {
  const backendStyle = TRAVEL_STYLE_MAP[input.travelStyle] ?? "balanced";

  // pace: use form field (already the right DTO union) with derived fallback.
  const pace: "relaxed" | "balanced" | "packed" =
    input.pace && ["relaxed", "balanced", "packed"].includes(input.pace)
      ? input.pace
      : DEFAULT_PACE[backendStyle];

  // transportMode: use form field with derived fallback.
  const transportMode: "public" | "private" | "mixed" =
    input.transportMode &&
    ["public", "private", "mixed"].includes(input.transportMode)
      ? input.transportMode
      : DEFAULT_TRANSPORT[backendStyle];

  // travelers: form stores an integer; guard against stale groupType strings.
  const travelers: number =
    typeof input.travelers === "number"
      ? Math.min(20, Math.max(1, Math.round(input.travelers)))
      : TRAVELER_COUNT[(input as unknown as { groupType?: string }).groupType ?? ""] ?? 1;

  const interests = (input.interests ?? [])
    .map((i) => INTEREST_MAP[i] ?? i.toLowerCase().trim())
    .filter((i) => i.length > 0);

  return {
    destination:   input.destination.toLowerCase().trim(),
    duration:      Math.round(input.duration),
    budgetLKR:     Math.round(input.budgetLKR),
    travelers,
    travelStyle:   backendStyle,
    transportMode,
    pace,
    interests,
    startDate:     (input as unknown as { startDate?: string }).startDate,
  };
}
