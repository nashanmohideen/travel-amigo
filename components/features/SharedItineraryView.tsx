"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { GeneratedItinerary } from "@/types";
import GeneratedItineraryCard from "@/components/features/GeneratedItineraryCard";
import GeneratedBudgetSummary from "@/components/features/GeneratedBudgetSummary";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/formatters";
import { isValidItinerary, getWarningSeverity } from "@/lib/itinerary/itineraryHelpers";
import { useGetSharedItineraryQuery } from "@/features/share/shareApi";


type Props = {
  token?: string;
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

/* ─── Empty state ────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-stone-100 flex items-center justify-center">
          <span className="text-4xl">🔗</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-stone-800 mb-2">
          Itinerary not available
        </h1>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
          This shared itinerary could not be found. The link may have expired or
          the itinerary was removed.
        </p>
        <Link
          href="/plan"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-semibold text-white hover:bg-teal-800 hover:shadow-md transition-all duration-200"
        >
          Create your own trip →
        </Link>
      </div>
    </div>
  );
}

/* ─── Main shared view ───────────────────────────────────────── */

export default function SharedItineraryView({ token = "demo" }: Props) {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null | "loading">("loading");

  // Shared itineraries are loaded from the backend only
  // (GET /api/v1/share/:token) — the localStorage fallback has been removed.
  const { data: apiItinerary, isLoading: apiIsLoading, error: apiError } =
    useGetSharedItineraryQuery(token);

  useEffect(() => {
    if (apiIsLoading) {
      setItinerary("loading");
      return;
    }
    if (apiItinerary && isValidItinerary(apiItinerary)) {
      setItinerary(apiItinerary);
      return;
    }
    if (apiError || !apiItinerary) {
      setItinerary(null);
    }
  }, [token, apiItinerary, apiIsLoading, apiError]);

  if (itinerary === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-stone-50">
        <div className="text-center px-4">
          <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-900/20">
            <span className="text-2xl">✈️</span>
          </div>
          <p className="text-sm text-stone-500 font-medium">Loading shared itinerary…</p>
        </div>
      </div>
    );
  }

  if (!itinerary) return <EmptyState />;

  const { tripInput, budget, budgetStatus, budgetConfidence, warnings, tips } = itinerary;
  const transportLabel = TRANSPORT_LABEL[tripInput.transportMode] ?? tripInput.transportMode;
  const paceLabel = {
    relaxed: "🌿 Relaxed",
    balanced: "⚖️ Balanced",
    packed: "⚡ Packed",
  }[tripInput.pace] ?? tripInput.pace;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ── Shared banner ── */}
      <div className="bg-teal-50 border-b border-teal-100 px-4 py-3 text-center">
        <p className="text-sm text-teal-800 font-medium">
          <span className="font-semibold">Shared Travel Amigo itinerary</span>
          {" — "}
          <Link href="/plan" className="underline font-semibold hover:text-teal-900 transition-colors">
            Create your own trip →
          </Link>
        </p>
      </div>

      {/* ── Hero header ── */}
      <div className="print-hero relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 80% 110%, rgba(251,191,36,0.10) 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🇱🇰</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
              {tripInput.destination} · Sri Lanka
            </span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-2xl">
            {itinerary.title}
          </h1>
          <p className="mt-2.5 text-sm text-white/65 font-medium">
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
                className="text-xs bg-white/12 border border-white/10 rounded-full px-3 py-1 backdrop-blur-sm font-medium"
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
              <Card className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm">
                    <span className="text-sm">💡</span>
                  </div>
                  <h3 className="font-display font-bold text-teal-900 text-base">
                    Local tips for{" "}
                    {tripInput.destination.charAt(0).toUpperCase() +
                      tripInput.destination.slice(1)}
                  </h3>
                </div>
                <ul className="flex flex-col gap-3">
                  {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-teal-800">
                      <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span className="leading-relaxed">{tip}</span>
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-800 to-emerald-800 text-white text-center flex flex-col items-center gap-3 p-7 shadow-lg">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(ellipse at 50% 120%, rgba(251,191,36,0.12) 0%, transparent 55%)",
                }}
              />
              <div className="relative">
                <div className="text-3xl mb-3">🇱🇰</div>
                <p className="font-display font-bold text-white text-lg leading-tight mb-1">
                  Inspired by this trip?
                </p>
                <p className="text-xs text-white/65 mb-4 leading-relaxed max-w-[180px] mx-auto">
                  Create your personalised Sri Lanka itinerary for free.
                </p>
                <Link
                  href="/plan"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 hover:shadow-lg transition-all duration-200 shadow-md shadow-amber-900/25"
                >
                  Plan your own trip →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
