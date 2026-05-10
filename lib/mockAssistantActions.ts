/**
 * Mock assistant response builder for Travel Amigo.
 *
 * Computes context-aware canned responses using the current itinerary state
 * and mock place data only.
 *
 * No AI, no network calls, no external APIs.
 */

import { getPlacesByDestination } from "@/lib/placeHelpers";
import type {
  GeneratedItinerary,
  Place,
  PlaceInterest,
  PlaceCategory,
} from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type AssistantPromptId =
  | "cheaper"
  | "relax"
  | "nature"
  | "crowded"
  | "budget"
  | "checklist";

export interface AssistantPrompt {
  id: AssistantPromptId;
  label: string;
}

export const ASSISTANT_PROMPTS: AssistantPrompt[] = [
  { id: "cheaper", label: "Make this trip cheaper" },
  { id: "relax", label: "Make the pace more relaxed" },
  { id: "nature", label: "Suggest more nature places" },
  { id: "crowded", label: "Replace crowded places" },
  { id: "budget", label: "Explain this budget" },
  { id: "checklist", label: "What should I check before travelling?" },
];

export interface CheaperReplacement {
  dayIndex: number;
  itemId: string;
  currentName: string;
  currentCostPerPersonLkr: number;
  newPlace: Place;
  savingPerPersonLkr: number;
}

export type AssistantActionType = "apply_cheaper" | "change_pace_relaxed" | null;

export interface AssistantResponse {
  promptId: AssistantPromptId;
  /** Main response rendered as <p> blocks */
  paragraphs: string[];
  /** Optional bullet list (rendered as <li>) */
  bullets?: string[];
  /** Proposed cheaper replacements (for "cheaper" prompt) */
  replacements?: CheaperReplacement[];
  /** Suggested places (for "nature" / "crowded" prompts) */
  suggestions?: Place[];
  actionType: AssistantActionType;
  actionLabel?: string;
}

// ── Private helpers ───────────────────────────────────────────────────────────

function fmtLkr(n: number): string {
  return `LKR ${Math.round(n).toLocaleString("en")}`;
}

function getUsedIds(itinerary: GeneratedItinerary): Set<string> {
  return new Set(itinerary.days.flatMap((d) => d.items.map((i) => i.placeId)));
}

// ── Response builders ─────────────────────────────────────────────────────────

function buildCheaperResponse(itinerary: GeneratedItinerary): AssistantResponse {
  const travelers = itinerary.tripInput.travelers;
  const allPlaces = getPlacesByDestination(itinerary.tripInput.destination);
  const usedIds = getUsedIds(itinerary);
  const earmarkedIds = new Set<string>();
  const replacements: CheaperReplacement[] = [];

  for (let di = 0; di < itinerary.days.length; di++) {
    for (const item of itinerary.days[di].items) {
      const costPerPerson = item.estimatedCostLkr / travelers;
      if (costPerPerson === 0) continue; // already free

      const available = allPlaces.filter(
        (p) =>
          !usedIds.has(p.id) &&
          !earmarkedIds.has(p.id) &&
          p.id !== item.placeId &&
          p.estimatedCostLkr < costPerPerson
      );
      if (available.length === 0) continue;

      const cheapest = [...available].sort(
        (a, b) => a.estimatedCostLkr - b.estimatedCostLkr
      )[0];

      replacements.push({
        dayIndex: di,
        itemId: item.id,
        currentName: item.placeName,
        currentCostPerPersonLkr: costPerPerson,
        newPlace: cheapest,
        savingPerPersonLkr: costPerPerson - cheapest.estimatedCostLkr,
      });
      earmarkedIds.add(cheapest.id);
    }
  }

  if (replacements.length === 0) {
    return {
      promptId: "cheaper",
      paragraphs: [
        "All activities in this itinerary are already free or at the lowest available cost in the mock data for this destination.",
        "No cheaper alternatives are available. You may want to adjust your accommodation style or transport mode in your trip preferences.",
      ],
      actionType: null,
    };
  }

  const totalSavingPerPerson = replacements.reduce(
    (s, r) => s + r.savingPerPersonLkr,
    0
  );

  return {
    promptId: "cheaper",
    paragraphs: [
      `I found ${replacements.length} place${replacements.length > 1 ? "s" : ""} in this itinerary that could be replaced with lower-cost alternatives from the same destination.`,
      `Estimated saving: up to ${fmtLkr(totalSavingPerPerson)} per person by switching to these alternatives. These are estimates only — actual costs may differ.`,
    ],
    replacements,
    actionType: "apply_cheaper",
    actionLabel: "Apply cheaper plan",
  };
}

function buildRelaxResponse(itinerary: GeneratedItinerary): AssistantResponse {
  const currentPace = itinerary.tripInput.pace;

  if (currentPace === "relaxed") {
    return {
      promptId: "relax",
      paragraphs: [
        "This itinerary is already set to Relaxed pace. Each day has fewer places with more time between activities.",
        "If you want to reduce the schedule further, use the Remove button on individual place cards to trim specific activities.",
      ],
      actionType: null,
    };
  }

  const paceLabel = currentPace === "balanced" ? "Balanced" : "Packed";

  return {
    promptId: "relax",
    paragraphs: [
      `This itinerary is currently on ${paceLabel} pace. Switching to Relaxed pace will reduce the number of places per day and increase the time buffer between activities.`,
      "The itinerary will be fully regenerated with the Relaxed setting. Any manual edits you have made will be replaced.",
    ],
    actionType: "change_pace_relaxed",
    actionLabel: "Switch to Relaxed pace",
  };
}

function buildNatureResponse(itinerary: GeneratedItinerary): AssistantResponse {
  const usedIds = getUsedIds(itinerary);
  const natureInterest: PlaceInterest = "nature";

  const naturalPlaces = getPlacesByDestination(itinerary.tripInput.destination)
    .filter((p) => !usedIds.has(p.id) && p.interests.includes(natureInterest))
    .slice(0, 3);

  if (naturalPlaces.length === 0) {
    return {
      promptId: "nature",
      paragraphs: [
        "Your itinerary already includes all available nature places for this destination in the mock data.",
        "To find more nature experiences, try editing your trip preferences to prioritise nature as an interest, or choose a destination such as Ella or Nuwara Eliya.",
      ],
      actionType: null,
    };
  }

  return {
    promptId: "nature",
    paragraphs: [
      `Here ${naturalPlaces.length === 1 ? "is" : "are"} ${naturalPlaces.length} nature-tagged place${naturalPlaces.length > 1 ? "s" : ""} available for this destination that are not in your current itinerary.`,
      "To add one, use the Replace button on any existing place card in your itinerary.",
    ],
    suggestions: naturalPlaces,
    actionType: null,
  };
}

const QUIETER_INTERESTS: PlaceInterest[] = ["relaxation", "nature", "beaches"];
const QUIETER_CATEGORIES: PlaceCategory[] = [
  "wellness",
  "beach",
  "nature",
  "wildlife",
  "viewpoint",
];

function buildCrowdedResponse(itinerary: GeneratedItinerary): AssistantResponse {
  const usedIds = getUsedIds(itinerary);

  const quieter = getPlacesByDestination(itinerary.tripInput.destination)
    .filter(
      (p) =>
        !usedIds.has(p.id) &&
        (p.interests.some((i) => QUIETER_INTERESTS.includes(i)) ||
          QUIETER_CATEGORIES.includes(p.category))
    )
    .slice(0, 3);

  const base: string[] = [
    "This prototype does not use live crowd data. Real-time visitor numbers are not available.",
    "As a proxy, the suggestions below are tagged with nature, relaxation, wellness, or low-tourist-intensity categories from the available mock data.",
  ];

  if (quieter.length === 0) {
    return {
      promptId: "crowded",
      paragraphs: [
        ...base,
        "No additional quieter-style alternatives were found for this destination in the current mock data.",
      ],
      actionType: null,
    };
  }

  return {
    promptId: "crowded",
    paragraphs: [
      ...base,
      "These are suggestions only. Actual quietness depends on season, time of day, and local conditions not captured in this prototype.",
    ],
    suggestions: quieter,
    actionType: null,
  };
}

function buildBudgetExplanation(itinerary: GeneratedItinerary): AssistantResponse {
  const { budget, budgetStatus, budgetConfidence, tripInput } = itinerary;
  const n = tripInput.travelers;
  const nights = tripInput.duration;

  const statusText: Record<string, string> = {
    within_budget: "Status: estimated total is within your stated budget.",
    tight_budget:
      "Status: the estimated total is close to your budget. There is limited room for unexpected costs.",
    over_budget:
      "Status: the estimated total currently exceeds your stated budget. Consider removing high-cost places or choosing a lower travel style.",
  };

  const confidenceText: Record<string, string> = {
    high: "Confidence: high — most costs are based on consistent place data.",
    medium:
      "Confidence: medium — some costs may vary with season or availability.",
    low: "Confidence: low — treat all figures as rough guidance only.",
  };

  return {
    promptId: "budget",
    paragraphs: [
      `Estimated budget for ${n} traveller${n > 1 ? "s" : ""}, ${nights} night${nights > 1 ? "s" : ""}.`,
      statusText[budgetStatus] ?? "",
      confidenceText[budgetConfidence] ?? "",
      "All prices are estimates only. Confirm entrance fees, accommodation rates, and transport fares before travelling.",
    ].filter(Boolean),
    bullets: [
      `Accommodation: ${fmtLkr(budget.accommodation)}`,
      `Food: ${fmtLkr(budget.food)}`,
      `Transport: ${fmtLkr(budget.transport)}`,
      `Activities and entry fees: ${fmtLkr(budget.activities)}`,
      `Contingency buffer (10%): ${fmtLkr(budget.buffer)}`,
      `Total: ${fmtLkr(budget.total)}`,
      `Per person: ${fmtLkr(budget.perPerson)}`,
    ],
    actionType: null,
  };
}

function buildChecklistResponse(itinerary: GeneratedItinerary): AssistantResponse {
  const bullets = [
    "Confirm opening hours and ticket prices directly before visiting each place",
    "Check current weather forecasts — hill-country weather changes rapidly",
    "Confirm transport availability and book ahead where needed",
    "Carry cash for small vendors, tuk-tuks, and entrance fees at minor sites",
    "Start hill-country routes early — traffic and mist increase during the day",
    "Keep your accommodation address and emergency contacts accessible offline",
    ...itinerary.tips.slice(0, 2).map((t) => `Local tip: ${t}`),
  ];

  const budgetWarning = itinerary.warnings.find((w) =>
    w.toLowerCase().includes("budget")
  );

  return {
    promptId: "checklist",
    paragraphs: [
      "Here is a general pre-travel checklist for Sri Lanka. This is not destination-specific advice — always verify current conditions before you travel.",
      ...(budgetWarning ? [`Budget note from your itinerary: ${budgetWarning}`] : []),
    ],
    bullets,
    actionType: null,
  };
}

// ── Public entry point ────────────────────────────────────────────────────────

export function buildAssistantResponse(
  promptId: AssistantPromptId,
  itinerary: GeneratedItinerary
): AssistantResponse {
  switch (promptId) {
    case "cheaper":
      return buildCheaperResponse(itinerary);
    case "relax":
      return buildRelaxResponse(itinerary);
    case "nature":
      return buildNatureResponse(itinerary);
    case "crowded":
      return buildCrowdedResponse(itinerary);
    case "budget":
      return buildBudgetExplanation(itinerary);
    case "checklist":
      return buildChecklistResponse(itinerary);
  }
}
