export type Region = "coast" | "cultural" | "hill-country" | "wildlife";

export interface Destination {
  id: string;
  name: string;
  region: Region;
  description: string;
  highlights: string[];
  bestFor: string[];
  emoji: string;
}

// ── Trip planning form ────────────────────────────────────────────────────────

export type TravelStyle = "budget" | "balanced" | "premium";
export type TransportMode = "public" | "private" | "mixed";
export type TripPace = "relaxed" | "balanced" | "packed";

export interface TripInput {
  destination: string;
  duration: number;       // days 1–5
  travelers: number;      // 1–12
  budgetLKR: number;
  travelStyle: TravelStyle;
  interests: string[];
  transportMode: TransportMode;
  pace: TripPace;
}

// ── Place / Points of Interest ────────────────────────────────────────────────

export type PlaceCategory =
  | "nature"
  | "culture"
  | "food"
  | "adventure"
  | "beach"
  | "photography"
  | "shopping"
  | "wellness"
  | "wildlife"
  | "viewpoint";

export type PlaceInterest =
  | "nature"
  | "culture"
  | "food"
  | "adventure"
  | "beaches"
  | "photography"
  | "family"
  | "relaxation";

/** A single point of interest within a destination. */
export interface Place {
  id: string;
  name: string;
  /** Matches the destination id in TripInput (e.g. "ella", "kandy") */
  destination: string;
  category: PlaceCategory;
  tags: string[];
  shortDescription: string;
  estimatedVisitDurationMinutes: number;
  /** Estimated entry/participation cost in LKR per person.
   *  0 = free. Use ranges via min/max if cost varies. */
  estimatedCostLkr: number;
  bestTimeToVisit: string;
  travelTip: string;
  latitude: number;
  longitude: number;
  /** Tailwind gradient classes used as image placeholder (e.g. "from-teal-400 to-emerald-600") */
  gradientPlaceholder: string;
  /** Which travel-style tiers this place is suited for */
  suitableFor: TravelStyle[];
  /** Interest tags that match this place to user preferences */
  interests: PlaceInterest[];
}

// ── Transport ─────────────────────────────────────────────────────────────────

/** Estimated transport options between two places/destinations. */
export interface TransportLeg {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  options: {
    mode: TransportMode;
    /** Estimated total cost in LKR for the leg (not per person) */
    estimatedCostLkr: number;
    estimatedDurationMinutes: number;
    notes: string;
  }[];
}

// ── Generated Itinerary ───────────────────────────────────────────────────────

export interface ItineraryItem {
  id: string;
  placeId: string;
  placeName: string;
  category: PlaceCategory;
  startTime: string;   // "09:00"
  endTime: string;     // "11:30"
  /** Estimated cost in LKR for all travelers */
  estimatedCostLkr: number;
  /** travelTip from Place */
  notes: string;
  emoji: string;
  shortDescription: string;
  bestTimeToVisit: string;
  /** From Place.estimatedVisitDurationMinutes */
  estimatedVisitDurationMinutes: number;
  /** Tailwind gradient classes for the colour-block thumbnail */
  gradientPlaceholder: string;
}

/** Replaces the old ItineraryDay — new version uses LKR and ItineraryItem */
export interface GeneratedItineraryDay {
  day: number;
  title: string;
  location: string;
  items: ItineraryItem[];
  transportNote: string;
  /** Total estimated cost in LKR for all travelers */
  totalCostLkr: number;
}

export type BudgetStatus = "within_budget" | "tight_budget" | "over_budget";
export type BudgetConfidence = "high" | "medium" | "low";

export interface GeneratedBudgetBreakdown {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  /** 10 % contingency buffer */
  buffer: number;
  miscellaneous: number;
  total: number;
  /** total ÷ travelers */
  perPerson: number;
  currency: "LKR";
}

// ── Feedback ──────────────────────────────────────────────────────────────────

export type FeedbackWouldUse = "yes" | "maybe" | "no";
export type FeedbackBudgetRealism = "too_low" | "reasonable" | "too_high" | "not_sure";

export const FEEDBACK_WANTED_NEXT_OPTIONS = [
  "Hotel suggestions",
  "Driver or guide suggestions",
  "Booking support",
  "Offline mobile app",
  "AI chat assistant",
  "Group trip planning",
  "More accurate prices",
  "Sinhala/Tamil support",
  "Live map and routes",
  "Safety tips",
] as const;

export type FeedbackWantedNext = typeof FEEDBACK_WANTED_NEXT_OPTIONS[number];

export interface FeedbackSubmission {
  id: string;
  createdAt: string;
  itineraryId: string | null;
  destination: string | null;
  durationDays: number | null;
  travellerCount: number | null;
  travelStyle: string | null;
  transportMode: string | null;
  pace: string | null;
  budgetStatus: BudgetStatus | null;
  budgetConfidence: BudgetConfidence | null;
  estimatedTotalLkr: number | null;
  userBudgetLkr: number | null;
  wouldUse: FeedbackWouldUse;
  usefulnessRating: number;           // 1–5
  budgetRealism: FeedbackBudgetRealism;
  missingOrUnrealistic: string;       // optional textarea
  wantedNext: FeedbackWantedNext[];   // checkboxes
  wasEdited: boolean;
  source: "itinerary_page";
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  destination: string;
  tripInput: TripInput;
  days: GeneratedItineraryDay[];
  budget: GeneratedBudgetBreakdown;
  budgetStatus: BudgetStatus;
  budgetConfidence: BudgetConfidence;
  warnings: string[];
  tips: string[];
  createdAt: string;
  generatedAt: string;
}
