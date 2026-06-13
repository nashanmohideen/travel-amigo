"use client";

import Link from "next/link";
import type { GeneratedItinerary } from "@/types";
import { useGetItineraryQuery } from "@/features/itinerary/itineraryApi";
import GeneratedItineraryCard from "@/components/features/GeneratedItineraryCard";
import GeneratedBudgetSummary from "@/components/features/GeneratedBudgetSummary";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/formatters";
import { getWarningSeverity } from "@/lib/itinerary/itineraryHelpers";


type Props = {
  id: string;
};

const TRANSPORT_LABEL: Record<string, string> = {
  public: "🚌 Public transport",
  private: "🚗 Private vehicle",
  mixed: "🔀 Mixed transport",
};

/* ─── Map route placeholder ──────────────────────────────────── */

function MapPlaceholder({ itinerary }: { itinerary: GeneratedItinerary }) {
  const stops: string[] = [];
  for (const day of itinerary.days) {
    if (!stops.includes(day.location)) stops.push(day.location);
  }
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-b from-teal-50 to-teal-100 px-5 py-4 flex items-center justify-between border-b border-teal-200">
        <h3 className="text-sm font-bold text-teal-900">Route overview</h3>
        <span className="text-[11px] text-teal-600 bg-teal-200 rounded-full px-2 py-0.5">
          Coming soon
        </span>
      </div>
      <div className="px-5 py-4 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
        <div className="flex flex-col gap-0">
          {stops.map((stop, i) => (
            <div key={stop} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                {i < stops.length - 1 && <div className="mt-0 h-6 w-0.5 bg-teal-300" />}
              </div>
              <p className="mt-1 text-sm font-semibold text-teal-900">{stop}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="px-5 py-3 text-[11px] text-stone-400 text-center border-t border-stone-100">
        Interactive map integration coming in a future update
      </p>
    </Card>
  );
}

/* ─── Not found state ────────────────────────────────────────── */

function NotFoundState() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">💾</div>
        <h1 className="text-xl font-bold text-stone-800 mb-2">
          Saved itinerary not found
        </h1>
        <p className="text-sm text-stone-500 mb-4">
          This itinerary is not available. It may have been cleared or the server has restarted.
        </p>
        <p className="text-xs text-stone-400 mb-6">
          Note: This prototype uses temporary in-memory storage, so saved trips may disappear after a server restart.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
        >
          Create a new trip →
        </Link>
      </div>
    </div>
  );
}

/* ─── Main saved itinerary view ────────────────────────────────────────── */

export default function SavedItineraryView({ id }: Props) {
  // RTK Query hook: fetch saved itinerary by id
  const { data: itinerary, isLoading, error } = useGetItineraryQuery(id);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500">Loading saved itinerary…</p>
        </div>
      </div>
    );
  }

  if (error || !itinerary) return <NotFoundState />;

  const { tripInput, budget, budgetStatus, budgetConfidence, warnings, tips } = itinerary;
  const transportLabel = TRANSPORT_LABEL[tripInput.transportMode] ?? tripInput.transportMode;
  const paceLabel = {
    relaxed: "🌿 Relaxed",
    balanced: "⚖️ Balanced",
    packed: "⚡ Packed",
  }[tripInput.pace] ?? tripInput.pace;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Saved itinerary banner ── */}
      <div className="bg-teal-50 border-b border-teal-200 px-4 py-3 text-center">
        <p className="text-sm text-teal-800">
          <span className="font-semibold">Saved Travel Amigo itinerary</span>
          {" — "}
          <Link href="/plan" className="underline font-medium hover:text-teal-900">
            Create another trip →
          </Link>
        </p>
        <p className="text-xs text-teal-600 mt-0.5">
          This prototype uses temporary in-memory storage during development.
        </p>
      </div>

      {/* ── Hero header ── */}
      <div className="print-hero bg-gradient-to-br from-teal-700 to-teal-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🇱🇰</span>
            <span className="text-sm font-medium uppercase tracking-wider opacity-70">
              {tripInput.destination} · Sri Lanka
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            {itinerary.title}
          </h1>
          <p className="mt-2 text-sm opacity-70">
            {tripInput.duration}{" "}
            {tripInput.duration === 1 ? "night" : "nights"} ·{" "}
            {tripInput.travelers}{" "}
            {tripInput.travelers === 1 ? "traveller" : "travellers"} ·{" "}
            {tripInput.travelStyle.charAt(0).toUpperCase() + tripInput.travelStyle.slice(1)} style
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[transportLabel, paceLabel, `📅 ${formatDisplayDate(itinerary.generatedAt)}`].map((chip) => (
              <span
                key={chip}
                className="text-xs bg-white/15 rounded-full px-3 py-1 backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Warnings ── */}
      {warnings.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 pt-6">
          <div className="flex flex-col gap-2">
            {warnings.map((w, i) => {
              const sev = getWarningSeverity(budgetStatus, w);
              return (
                <div
                  key={i}
                  className={cn(
                    "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
                    sev.bg,
                    sev.border,
                    sev.text
                  )}
                >
                  <span className="mt-0.5 shrink-0">{sev.icon}</span>
                  <p>{w}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Budget on mobile */}
        <div className="lg:hidden mb-8">
          <GeneratedBudgetSummary
            budget={budget}
            budgetStatus={budgetStatus}
            budgetConfidence={budgetConfidence}
            userBudgetLkr={tripInput.budgetLKR}
            travelers={tripInput.travelers}
            duration={tripInput.duration}
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: day cards (read-only) */}
          <div className="flex flex-col gap-6">
            {itinerary.days.map((day, dayIndex) => (
              <div key={day.day} className="print-avoid-break">
                <GeneratedItineraryCard
                  day={day}
                  dayIndex={dayIndex}
                  readOnly
                />
              </div>
            ))}

            {/* Tips */}
            {tips.length > 0 && (
              <Card className="bg-teal-50 border border-teal-100">
                <h3 className="text-sm font-bold text-teal-900 mb-3">
                  💡 Local tips for{" "}
                  {tripInput.destination.charAt(0).toUpperCase() +
                    tripInput.destination.slice(1)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-teal-800">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-stone-400 leading-relaxed px-1">
              This itinerary uses estimated costs and prototype travel data. Confirm
              prices, opening hours, and transport before travelling.
            </p>
          </div>

          {/* Right: sidebar */}
          <div className="flex flex-col gap-6">
            <div className="hidden lg:block">
              <GeneratedBudgetSummary
                budget={budget}
                budgetStatus={budgetStatus}
                budgetConfidence={budgetConfidence}
                userBudgetLkr={tripInput.budgetLKR}
                travelers={tripInput.travelers}
                duration={tripInput.duration}
              />
            </div>

            <MapPlaceholder itinerary={itinerary} />

            {/* CTA */}
            <Card className="text-center flex flex-col items-center gap-3 py-6">
              <div className="text-3xl">🇱🇰</div>
              <p className="text-sm font-bold text-stone-800">
                Want to plan another trip?
              </p>
              <p className="text-xs text-stone-500">
                Create your personalised Sri Lanka journey.
              </p>
              <Link
                href="/plan"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
              >
                Plan a new trip →
              </Link>
            </Card>

            {/* Print info */}
            <Card className="flex flex-col gap-2 bg-stone-100 border-stone-200 py-4 px-3">
              <button
                onClick={() => window.print()}
                className="text-xs font-medium text-teal-700 hover:text-teal-800 transition-colors text-left flex items-center gap-1"
              >
                🖨️ Print this itinerary
              </button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
