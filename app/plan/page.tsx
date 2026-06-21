import TripForm from "@/components/features/TripForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Plan Your Trip — Travel Amigo",
  description:
    "Build your personalised Sri Lanka itinerary. Choose destination, budget, interests, and get a full day-by-day plan.",
};

export default function PlanPage() {
  return (
    <main className="flex-1 bg-stone-50">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 text-white">
        {/* Subtle radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 60% 110%, rgba(251,191,36,0.10) 0%, transparent 55%), radial-gradient(ellipse at 30% -20%, rgba(16,185,129,0.10) 0%, transparent 50%)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-18 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3.5 py-1 text-xs font-medium text-white/80 backdrop-blur-sm mb-4">
            🇱🇰 Takes about 60 seconds
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white leading-tight">
            Plan your Sri Lanka trip
          </h1>
          <p className="mt-3 text-white/65 max-w-md mx-auto leading-relaxed">
            Tell us your preferences and we&apos;ll generate a day-by-day
            itinerary with routes, activities, and cost estimates.
          </p>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 32"
            className="w-full h-8 text-stone-50"
            fill="currentColor"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path d="M0,32 C480,0 960,0 1440,32 L1440,32 L0,32 Z" />
          </svg>
        </div>
      </div>

      {/* ── Form ───────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        <TripForm />
      </div>
    </main>
  );
}
