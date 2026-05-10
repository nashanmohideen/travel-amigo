import type { BudgetTier } from "@/types";

export interface BudgetRange {
  label: string;
  perPersonPerDay: { min: number; max: number }; // USD
  accommodation: string;
  transport: string;
  food: string;
}

export const budgetRanges: Record<BudgetTier, BudgetRange> = {
  budget: {
    label: "Budget",
    perPersonPerDay: { min: 30, max: 60 },
    accommodation: "Guesthouses & hostels ($15–$30/night)",
    transport: "Buses, trains & shared tuk-tuks",
    food: "Local restaurants & street food ($5–$10/day)",
  },
  "mid-range": {
    label: "Mid-Range",
    perPersonPerDay: { min: 80, max: 160 },
    accommodation: "Boutique guesthouses & 3-star hotels ($50–$100/night)",
    transport: "Private van & scenic trains",
    food: "Mix of local gems and tourist restaurants ($15–$25/day)",
  },
  luxury: {
    label: "Luxury",
    perPersonPerDay: { min: 200, max: 500 },
    accommodation: "5-star resorts & heritage hotels ($150–$350/night)",
    transport: "Private AC van, helicopter transfers available",
    food: "Fine dining & curated culinary experiences ($40–$80/day)",
  },
};

export const interestOptions = [
  { value: "culture", label: "Culture & History", emoji: "🛕" },
  { value: "nature", label: "Nature & Hiking", emoji: "🌿" },
  { value: "beach", label: "Beaches", emoji: "🏖️" },
  { value: "wildlife", label: "Wildlife & Safaris", emoji: "🐆" },
  { value: "food", label: "Food & Cuisine", emoji: "🍛" },
  { value: "adventure", label: "Adventure", emoji: "🧗" },
  { value: "photography", label: "Photography", emoji: "📸" },
  { value: "wellness", label: "Wellness & Ayurveda", emoji: "🧘" },
];
