"use client";

import { useState } from "react";
import type {
  FeedbackSubmission,
  FeedbackWouldUse,
  FeedbackBudgetRealism,
  FeedbackWantedNext,
  GeneratedItinerary,
} from "@/types";
import { FEEDBACK_WANTED_NEXT_OPTIONS } from "@/types";
import { useSubmitFeedbackMutation } from "@/features/feedback/feedbackApi";
import { cn } from "@/lib/utils";
import { LS_FEEDBACK_SUBMISSIONS as LS_FEEDBACK } from "@/lib/storageKeys";

interface FeedbackFormProps {
  itinerary: GeneratedItinerary;
  wasEdited: boolean;
}

// ── helpers ───────────────────────────────────────────────────────────────────

function loadSubmissions(): FeedbackSubmission[] {
  try {
    const raw = localStorage.getItem(LS_FEEDBACK);
    if (raw) return JSON.parse(raw) as FeedbackSubmission[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveSubmission(sub: FeedbackSubmission): void {
  try {
    const existing = loadSubmissions();
    existing.push(sub);
    localStorage.setItem(LS_FEEDBACK, JSON.stringify(existing));
  } catch {
    /* quota exceeded — silently skip */
  }
}

// ── sub-components ────────────────────────────────────────────────────────────

function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "border-teal-600 bg-teal-700 text-white"
          : "border-stone-200 bg-white text-stone-700 hover:border-teal-400 hover:bg-teal-50"
      )}
    >
      {label}
    </button>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Rating 1 to 5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          aria-label={`${star} out of 5`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={cn(
            "h-10 w-10 rounded-xl border text-lg font-bold transition-colors",
            star <= (hover || value)
              ? "border-teal-600 bg-teal-700 text-white"
              : "border-stone-200 bg-white text-stone-400 hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
          )}
        >
          {star}
        </button>
      ))}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function FeedbackForm({ itinerary, wasEdited }: FeedbackFormProps) {
  const [submitFeedback] = useSubmitFeedbackMutation();
  
  const [wouldUse, setWouldUse] = useState<FeedbackWouldUse | null>(null);
  const [rating, setRating] = useState(0);
  const [budgetRealism, setBudgetRealism] = useState<FeedbackBudgetRealism | null>(null);
  const [missing, setMissing] = useState("");
  const [wantedNext, setWantedNext] = useState<Set<FeedbackWantedNext>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [syncNote, setSyncNote] = useState<string | null>(null);

  function toggleWanted(opt: FeedbackWantedNext) {
    setWantedNext((prev) => {
      const next = new Set(prev);
      if (next.has(opt)) next.delete(opt);
      else next.add(opt);
      return next;
    });
  }

  async function handleSubmit() {
    // Validate required fields
    if (!wouldUse || !rating || !budgetRealism) {
      setError("Please answer all required questions (marked with *).");
      return;
    }
    setError(null);
    setSyncNote(null);
    setIsSubmitting(true);

    const tripInput = itinerary.tripInput;
    
    // Build the submission object with server-generated fields for local storage
    const sub: FeedbackSubmission = {
      id: `fb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      itineraryId: itinerary.id ?? null,
      destination: tripInput?.destination ?? null,
      durationDays: tripInput?.duration ?? null,
      travellerCount: tripInput?.travelers ?? null,
      travelStyle: tripInput?.travelStyle ?? null,
      transportMode: tripInput?.transportMode ?? null,
      pace: tripInput?.pace ?? null,
      budgetStatus: itinerary.budgetStatus ?? null,
      budgetConfidence: itinerary.budgetConfidence ?? null,
      estimatedTotalLkr: itinerary.budget?.total ?? null,
      userBudgetLkr: tripInput?.budgetLKR ?? null,
      wouldUse,
      usefulnessRating: rating,
      budgetRealism,
      missingOrUnrealistic: missing.trim(),
      wantedNext: Array.from(wantedNext),
      wasEdited,
      source: "itinerary_page",
    };

    // Build the API input (everything except id and createdAt)
    const apiInput = {
      itineraryId: sub.itineraryId,
      destination: sub.destination,
      durationDays: sub.durationDays,
      travellerCount: sub.travellerCount,
      travelStyle: sub.travelStyle,
      transportMode: sub.transportMode,
      pace: sub.pace,
      budgetStatus: sub.budgetStatus,
      budgetConfidence: sub.budgetConfidence,
      estimatedTotalLkr: sub.estimatedTotalLkr,
      userBudgetLkr: sub.userBudgetLkr,
      wouldUse: sub.wouldUse,
      usefulnessRating: sub.usefulnessRating,
      budgetRealism: sub.budgetRealism,
      missingOrUnrealistic: sub.missingOrUnrealistic,
      wantedNext: sub.wantedNext,
      wasEdited: sub.wasEdited,
      source: sub.source,
    };

    // Try API submission first
    let apiSucceeded = false;
    try {
      const result = await submitFeedback(apiInput).unwrap();
      apiSucceeded = true;
      
      // If API returns an id, use it for the local copy
      if (result.id) {
        sub.id = result.id;
      }
    } catch (err) {
      // API failed — we'll still save locally
      console.error("Feedback API submission failed:", err);
      setSyncNote(
        "Saved locally for prototype review. Server sync was unavailable."
      );
    }

    // Always save a local copy (whether API succeeded or failed)
    saveSubmission(sub);
    
    setIsSubmitting(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-teal-200 bg-teal-50 px-6 py-8 text-center">
        <p className="text-lg font-bold text-teal-900 mb-1">Thank you.</p>
        <p className="text-sm text-teal-700">
          Your feedback was saved for prototype review.
        </p>
        {syncNote && (
          <p className="text-xs text-teal-600 mt-2 italic">{syncNote}</p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-6 py-6 flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-stone-900 mb-1">
          Help us improve this trip plan
        </h2>
        <p className="text-sm text-stone-500">
          Your feedback helps us understand whether this itinerary feels useful,
          realistic, and ready for real travel planning.
        </p>
      </div>

      {/* Q1 — Would use */}
      <div>
        <p className="text-sm font-semibold text-stone-800 mb-2">
          Would you use this for a real trip?{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(["yes", "maybe", "no"] as FeedbackWouldUse[]).map((opt) => {
            const labels: Record<FeedbackWouldUse, string> = {
              yes: "Yes",
              maybe: "Maybe",
              no: "No",
            };
            return (
              <OptionButton
                key={opt}
                label={labels[opt]}
                selected={wouldUse === opt}
                onClick={() => setWouldUse(opt)}
              />
            );
          })}
        </div>
      </div>

      {/* Q2 — Usefulness rating */}
      <div>
        <p className="text-sm font-semibold text-stone-800 mb-2">
          How useful was this itinerary? (1 = not useful, 5 = very useful){" "}
          <span className="text-red-500">*</span>
        </p>
        <StarRating value={rating} onChange={setRating} />
      </div>

      {/* Q3 — Budget realism */}
      <div>
        <p className="text-sm font-semibold text-stone-800 mb-2">
          How realistic did the budget feel?{" "}
          <span className="text-red-500">*</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["too_low", "Too low"],
              ["reasonable", "Reasonable"],
              ["too_high", "Too high"],
              ["not_sure", "Not sure"],
            ] as [FeedbackBudgetRealism, string][]
          ).map(([opt, label]) => (
            <OptionButton
              key={opt}
              label={label}
              selected={budgetRealism === opt}
              onClick={() => setBudgetRealism(opt)}
            />
          ))}
        </div>
      </div>

      {/* Q4 — Missing / unrealistic */}
      <div>
        <label
          htmlFor="fb-missing"
          className="block text-sm font-semibold text-stone-800 mb-1.5"
        >
          What felt missing or unrealistic?{" "}
          <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="fb-missing"
          rows={3}
          value={missing}
          onChange={(e) => setMissing(e.target.value)}
          maxLength={1000}
          placeholder="e.g. hotel options, realistic travel times, entrance fees..."
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Q5 — Wanted next */}
      <div>
        <p className="text-sm font-semibold text-stone-800 mb-2">
          What would you want next?{" "}
          <span className="text-stone-400 font-normal">(select all that apply)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_WANTED_NEXT_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleWanted(opt)}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                wantedNext.has(opt)
                  ? "border-teal-600 bg-teal-700 text-white"
                  : "border-stone-200 bg-white text-stone-600 hover:border-teal-400 hover:bg-teal-50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="self-start rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 active:bg-teal-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Submit feedback"}
      </button>
    </div>
  );
}
