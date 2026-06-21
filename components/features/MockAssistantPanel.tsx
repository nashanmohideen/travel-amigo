"use client";

import { useState } from "react";
import type { GeneratedItinerary, Place, TripPace } from "@/types";
import {
  ASSISTANT_PROMPTS,
  buildAssistantResponse,
  type AssistantPromptId,
  type AssistantResponse,
  type CheaperReplacement,
} from "@/lib/mockAssistantActions";
import { cn } from "@/lib/utils";

// ── Props ─────────────────────────────────────────────────────────────────────

interface MockAssistantPanelProps {
  itinerary: GeneratedItinerary;
  /** May be async — pace changes regenerate via POST /api/v1/trips/generate */
  onChangePace: (pace: TripPace) => void | Promise<void>;
  onReplacePlace: (dayIndex: number, itemId: string, newPlace: Place) => void;
}

// ── Small sub-components ──────────────────────────────────────────────────────

function PlaceSuggestionCard({ place }: { place: Place }) {
  return (
    <div className={`rounded-xl bg-gradient-to-r ${place.gradientPlaceholder} p-px`}>
      <div className="rounded-[calc(0.75rem-1px)] bg-white px-3 py-2.5">
        <p className="text-sm font-semibold text-stone-800">{place.name}</p>
        <p className="text-xs text-stone-500 mt-0.5 line-clamp-2 leading-relaxed">
          {place.shortDescription}
        </p>
        <p className="text-xs text-teal-600 font-medium mt-1.5">
          {place.estimatedCostLkr === 0
            ? "Free entry (est.)"
            : `LKR ${place.estimatedCostLkr.toLocaleString("en")} per person (est.)`}
        </p>
      </div>
    </div>
  );
}

function ReplacementRow({ r }: { r: CheaperReplacement }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-xs">
      <span className="font-medium text-stone-400 line-through">
        {r.currentName}
      </span>
      <span className="text-stone-400">→</span>
      <span className="font-medium text-stone-700">{r.newPlace.name}</span>
      <span className="ml-auto shrink-0 text-emerald-600 font-semibold">
        -{Math.round(r.savingPerPersonLkr).toLocaleString("en")} LKR pp
      </span>
    </div>
  );
}

// ── Response renderer ─────────────────────────────────────────────────────────

interface ResponseViewProps {
  response: AssistantResponse;
  actionApplied: boolean;
  isApplying: boolean;
  onApplyCheaper: () => void;
  onChangeRelax: () => void;
}

function ResponseView({
  response,
  actionApplied,
  isApplying,
  onApplyCheaper,
  onChangeRelax,
}: ResponseViewProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Paragraphs */}
      {response.paragraphs.map((para, i) => (
        <p key={i} className="text-sm text-stone-700 leading-relaxed">
          {para}
        </p>
      ))}

      {/* Bullet list */}
      {response.bullets && response.bullets.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {response.bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-700">
              <span className="mt-[7px] shrink-0 w-1 h-1 rounded-full bg-teal-500" />
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Cheaper replacements summary */}
      {response.replacements && response.replacements.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 flex flex-col gap-1.5">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">
            Proposed changes
          </p>
          {response.replacements.map((r) => (
            <ReplacementRow key={r.itemId} r={r} />
          ))}
        </div>
      )}

      {/* Place suggestions */}
      {response.suggestions && response.suggestions.length > 0 && (
        <div className="flex flex-col gap-2">
          {response.suggestions.map((place) => (
            <PlaceSuggestionCard key={place.id} place={place} />
          ))}
        </div>
      )}

      {/* Action: apply cheaper plan */}
      {!actionApplied &&
        response.actionType === "apply_cheaper" &&
        response.replacements &&
        response.replacements.length > 0 && (
          <button
            type="button"
            onClick={onApplyCheaper}
            disabled={isApplying}
            className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors w-full disabled:opacity-60 disabled:cursor-wait"
          >
            {isApplying ? "Applying…" : (response.actionLabel ?? "Apply cheaper plan")}
          </button>
        )}

      {/* Action: switch to relaxed */}
      {!actionApplied && response.actionType === "change_pace_relaxed" && (
        <button
          type="button"
          onClick={onChangeRelax}
          disabled={isApplying}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors w-full disabled:opacity-60 disabled:cursor-wait"
        >
          {isApplying ? "Regenerating itinerary…" : (response.actionLabel ?? "Switch to Relaxed pace")}
        </button>
      )}

      {/* Applied confirmation */}
      {actionApplied && (
        <p className="text-sm font-semibold text-emerald-600 text-center py-0.5">
          Applied. Itinerary updated.
        </p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MockAssistantPanel({
  itinerary,
  onChangePace,
  onReplacePlace,
}: MockAssistantPanelProps) {
  const [open, setOpen] = useState(false);
  const [activePromptId, setActivePromptId] = useState<AssistantPromptId | null>(
    null
  );
  const [response, setResponse] = useState<AssistantResponse | null>(null);
  const [actionApplied, setActionApplied] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  function handlePrompt(id: AssistantPromptId) {
    const res = buildAssistantResponse(id, itinerary);
    setActivePromptId(id);
    setResponse(res);
    setActionApplied(false);
  }

  function handleApplyCheaper() {
    if (!response?.replacements) return;
    for (const r of response.replacements) {
      onReplacePlace(r.dayIndex, r.itemId, r.newPlace);
    }
    setActionApplied(true);
  }

  async function handleChangeRelax() {
    setIsApplying(true);
    try {
      // Regenerates via POST /api/v1/trips/generate — show loading meanwhile
      await Promise.resolve(onChangePace("relaxed"));
      setActionApplied(true);
    } finally {
      setIsApplying(false);
    }
  }

  const activeLabel =
    activePromptId != null
      ? (ASSISTANT_PROMPTS.find((p) => p.id === activePromptId)?.label ?? "")
      : "";

  return (
    <div className="no-print rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* ── Header / toggle ── */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 hover:bg-stone-50/70 transition-colors text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Guide icon */}
          <div className="shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-sm shadow-teal-900/20">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden>
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-sm font-bold text-stone-900 truncate block">
              Travel Amigo Assistant
            </span>
            <span className="text-[10px] text-stone-400 font-medium">Your local Sri Lanka guide</span>
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 ml-1">
            Prototype
          </span>
        </div>
        <svg
          className={cn(
            "shrink-0 ml-2 w-4 h-4 text-stone-400 transition-transform duration-200",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div className="border-t border-stone-100 px-4 py-4 flex flex-col gap-4">
          {/* Intro message */}
          {!activePromptId && (
            <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
              I can help adjust this itinerary using the places available in
              Travel Amigo. Pick a question below to get started.
            </p>
          )}

          {/* Prompt buttons grid */}
          <div className="grid grid-cols-2 gap-2">
            {ASSISTANT_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                type="button"
                onClick={() => handlePrompt(prompt.id)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left text-xs font-medium leading-snug transition-all duration-150",
                  "hover:shadow-sm",
                  activePromptId === prompt.id
                    ? "border-teal-400 bg-teal-50 text-teal-800 shadow-sm"
                    : "border-stone-200 bg-white text-stone-700 hover:border-teal-200 hover:bg-teal-50/40 hover:text-teal-800"
                )}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Chat exchange */}
          {activePromptId && response && (
            <div className="flex flex-col gap-3">
              {/* User message bubble */}
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-700 px-4 py-2.5 text-sm text-white font-medium leading-snug shadow-sm shadow-teal-900/20">
                  {activeLabel}
                </div>
              </div>

              {/* Assistant response bubble */}
              <div className="flex gap-2.5 items-start">
                <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 border border-teal-500/20 flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-white" aria-hidden>
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0 rounded-2xl rounded-tl-sm bg-stone-50 border border-stone-200 px-4 py-3.5">
                  <ResponseView
                    response={response}
                    actionApplied={actionApplied}
                    isApplying={isApplying}
                    onApplyCheaper={handleApplyCheaper}
                    onChangeRelax={handleChangeRelax}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Safety disclaimer */}
          <p className="text-[11px] text-stone-400 leading-relaxed border-t border-stone-100 pt-3">
            This prototype assistant only uses available mock itinerary data.
            Confirm prices, opening hours, weather, and transport before
            travelling.
          </p>
        </div>
      )}
    </div>
  );
}
