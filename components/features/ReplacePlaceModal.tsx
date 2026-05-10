"use client";

import type { Place, ItineraryItem, PlaceCategory } from "@/types";
import { formatLKR, cn } from "@/lib/utils";

interface ReplacePlaceModalProps {
  /** The item being replaced */
  replacing: ItineraryItem;
  /** Ranked alternative places to display */
  alternatives: Place[];
  onSelect: (place: Place) => void;
  onClose: () => void;
}

const CATEGORY_BADGE: Partial<Record<PlaceCategory, string>> = {
  nature: "bg-green-100 text-green-700",
  culture: "bg-amber-100 text-amber-700",
  food: "bg-orange-100 text-orange-700",
  adventure: "bg-red-100 text-red-700",
  beach: "bg-teal-100 text-teal-700",
  photography: "bg-sky-100 text-sky-700",
  viewpoint: "bg-cyan-100 text-cyan-700",
  shopping: "bg-stone-100 text-stone-600",
  wellness: "bg-emerald-100 text-emerald-700",
  wildlife: "bg-lime-100 text-lime-700",
};

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

export default function ReplacePlaceModal({
  replacing,
  alternatives,
  onSelect,
  onClose,
}: ReplacePlaceModalProps) {
  return (
    /* ── Backdrop ── */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* ── Sheet / Dialog ── */}
      <div className="relative w-full sm:max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-stone-100">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-0.5">
              Replacing
            </p>
            <h2 className="text-base font-bold text-stone-900 leading-snug">
              {replacing.placeName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-5 py-3 bg-stone-50 border-b border-stone-100">
          <p className="text-xs text-stone-500">
            Choose an alternative place to visit. Options are ranked by your interests.
          </p>
        </div>

        {/* Alternatives list */}
        <div className="overflow-y-auto flex-1 p-4">
          {alternatives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-stone-400">
                No alternative places are available for this destination.
              </p>
              <p className="text-xs text-stone-300 mt-1">
                All places in this destination are already in your itinerary.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {alternatives.map((place) => (
                <button
                  key={place.id}
                  onClick={() => onSelect(place)}
                  className={cn(
                    "w-full text-left rounded-xl border border-stone-200 bg-white p-4",
                    "hover:border-teal-400 hover:bg-teal-50 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
                  )}
                >
                  {/* Gradient strip */}
                  <div
                    className={cn(
                      "h-1 w-full rounded-full bg-gradient-to-r mb-2.5",
                      place.gradientPlaceholder || "from-teal-400 to-emerald-500"
                    )}
                  />

                  {/* Name + category */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <p className="text-sm font-bold text-stone-900">{place.name}</p>
                    <span
                      className={cn(
                        "text-[10px] font-semibold rounded-full px-2 py-0.5",
                        CATEGORY_BADGE[place.category] ?? "bg-stone-100 text-stone-600"
                      )}
                    >
                      {place.category}
                    </span>
                  </div>

                  {/* Short description */}
                  <p className="text-xs text-stone-500 leading-relaxed mb-2 line-clamp-2">
                    {place.shortDescription}
                  </p>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-400">
                    <span>⏱ {durationLabel(place.estimatedVisitDurationMinutes)}</span>
                    {place.estimatedCostLkr > 0 ? (
                      <span>🎟 ~{formatLKR(place.estimatedCostLkr)}/person</span>
                    ) : (
                      <span className="text-emerald-600 font-medium">✓ Free entry</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-stone-100">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-stone-200 bg-stone-50 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
