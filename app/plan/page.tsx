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
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="bg-white border-b border-stone-100 px-4 py-10 sm:py-14 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
          🇱🇰 Takes about 60 seconds
        </span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-stone-900">
          Plan your Sri Lanka trip
        </h1>
        <p className="mt-2 text-stone-500 max-w-md mx-auto">
          Tell us your preferences and we&apos;ll generate a day-by-day
          itinerary with routes, activities, and cost estimates.
        </p>
      </div>

      {/* ── Form (max-width wide enough for 3-col internal grid) ─────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-12">
        <TripForm />
      </div>
    </main>
  );
}
