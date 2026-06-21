import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { GeneratedItineraryDay, ItineraryItem, PlaceCategory } from "@/types";
import { formatLKR, cn } from "@/lib/utils";

interface EditCallbacks {
  onRemove: (itemId: string) => void;
  onReplace: (item: ItineraryItem) => void;
  onMoveUp: (flatIndex: number) => void;
  onMoveDown: (flatIndex: number) => void;
}

interface GeneratedItineraryCardProps {
  day: GeneratedItineraryDay;
  dayIndex: number;
  /** When true, hides all edit controls */
  readOnly?: boolean;
  callbacks?: EditCallbacks;
}

const categoryBadgeVariant: Partial<
  Record<PlaceCategory, "teal" | "amber" | "green" | "stone" | "sky" | "violet">
> = {
  nature:      "green",
  culture:     "amber",
  food:        "amber",
  adventure:   "violet",
  beach:       "teal",
  photography: "sky",
  viewpoint:   "teal",
  shopping:    "stone",
  wellness:    "green",
  wildlife:    "green",
};

function durationLabel(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function sessionOf(time: string): "Morning" | "Afternoon" | "Evening" {
  const h = parseInt(time.split(":")[0], 10);
  if (h < 12) return "Morning";
  if (h < 17) return "Afternoon";
  return "Evening";
}

const sessionConfig = {
  Morning:   { icon: "🌅", color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200" },
  Afternoon: { icon: "☀️",  color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  Evening:   { icon: "🌙", color: "text-indigo-700", bg: "bg-indigo-50",  border: "border-indigo-200" },
};

// ── Transfer row ──────────────────────────────────────────────────────────────
function TransferRow() {
  return (
    <div className="flex items-center gap-3 px-1 py-0.5">
      <div className="w-14 shrink-0" />
      <div className="flex flex-col items-center shrink-0">
        <div className="w-px h-3 bg-stone-200" />
        <span className="text-[10px] text-stone-300 leading-none py-0.5">⬇</span>
        <div className="w-px h-3 bg-stone-200" />
      </div>
      <div className="flex items-center gap-1.5 rounded-lg bg-stone-50 border border-stone-100 px-3 py-1.5">
        <span className="text-xs">🚌</span>
        <span className="text-xs text-stone-400 font-medium">~30 min local transfer</span>
      </div>
    </div>
  );
}

// ── Single place item ─────────────────────────────────────────────────────────
interface PlaceItemProps {
  item: ItineraryItem;
  flatIndex: number;
  isFirst: boolean;
  isLast: boolean;
  readOnly?: boolean;
  callbacks?: EditCallbacks;
}

function PlaceItem({ item, flatIndex, isFirst, isLast, readOnly, callbacks }: PlaceItemProps) {
  return (
    <div className="flex items-start gap-3">
      {/* Time + session column */}
      <div className="shrink-0 w-14 text-right pt-2">
        <span className="text-xs font-mono font-bold text-stone-700">
          {item.startTime}
        </span>
        <p className="text-[10px] text-stone-400 leading-none mt-0.5">
          {item.endTime}
        </p>
      </div>

      {/* Timeline dot */}
      <div className="flex flex-col items-center shrink-0 pt-2.5">
        <div className="w-3 h-3 rounded-full border-2 border-teal-500 bg-white shadow-sm shadow-teal-500/30 shrink-0" />
      </div>

      {/* Card content */}
      <div className="flex-1 min-w-0 pb-1">
        <div className="rounded-xl border border-stone-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Gradient thumbnail strip — thicker and more impactful */}
          <div
            className={cn(
              "h-3 w-full bg-gradient-to-r",
              item.gradientPlaceholder || "from-teal-400 to-emerald-500"
            )}
          />
          <div className="p-4">
            {/* Name + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-lg leading-none">{item.emoji}</span>
              <p className="text-sm font-bold text-stone-900">{item.placeName}</p>
              <Badge variant={categoryBadgeVariant[item.category] ?? "stone"}>
                {item.category}
              </Badge>
            </div>

            {/* Short description */}
            <p className="text-xs text-stone-600 leading-relaxed mb-3">
              {item.shortDescription}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs mb-3">
              <span className="flex items-center gap-1 text-stone-500">
                <span>⏱</span>
                <span>{durationLabel(item.estimatedVisitDurationMinutes)}</span>
              </span>
              {item.estimatedCostLkr > 0 ? (
                <span className="flex items-center gap-1 text-stone-500">
                  <span>🎟</span>
                  <span>~{formatLKR(item.estimatedCostLkr)} total</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span>✓</span>
                  <span>Free entry</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-teal-600">
                <span>🕐</span>
                <span className="truncate max-w-[180px]" title={item.bestTimeToVisit}>
                  Best: {item.bestTimeToVisit.split(";")[0].split("(")[0].trim()}
                </span>
              </span>
            </div>

            {/* Travel tip */}
            <div className="flex gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5 mb-3">
              <span className="text-xs shrink-0 text-amber-600">💡</span>
              <p className="text-[11px] text-amber-800 leading-relaxed">{item.notes}</p>
            </div>

            {/* ── Edit toolbar ─────────────────────────────────── */}
            {!readOnly && callbacks && (
              <div className="no-print flex flex-wrap items-center gap-1.5 pt-3 border-t border-stone-100">
                <button
                  onClick={() => callbacks.onMoveUp(flatIndex)}
                  disabled={isFirst}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    "border border-stone-200 bg-stone-50 text-stone-600",
                    isFirst
                      ? "opacity-35 cursor-not-allowed"
                      : "hover:bg-white hover:border-stone-300 hover:shadow-sm active:bg-stone-100"
                  )}
                  aria-label="Move up"
                >
                  ↑ Move up
                </button>
                <button
                  onClick={() => callbacks.onMoveDown(flatIndex)}
                  disabled={isLast}
                  className={cn(
                    "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all duration-150",
                    "border border-stone-200 bg-stone-50 text-stone-600",
                    isLast
                      ? "opacity-35 cursor-not-allowed"
                      : "hover:bg-white hover:border-stone-300 hover:shadow-sm active:bg-stone-100"
                  )}
                  aria-label="Move down"
                >
                  ↓ Move down
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <button
                    onClick={() => callbacks.onReplace(item)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 transition-all duration-150 hover:shadow-sm active:bg-teal-200"
                    aria-label="Replace place"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => callbacks.onRemove(item.id)}
                    className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-300 transition-all duration-150 hover:shadow-sm active:bg-red-200"
                    aria-label="Remove place"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function GeneratedItineraryCard({ day, readOnly = false, callbacks }: GeneratedItineraryCardProps) {
  type SessionGroup = { label: "Morning" | "Afternoon" | "Evening"; items: { item: ItineraryItem; flatIndex: number }[] };
  const sessions: SessionGroup[] = [];
  day.items.forEach((item, flatIndex) => {
    const label = sessionOf(item.startTime);
    const last = sessions[sessions.length - 1];
    if (!last || last.label !== label) {
      sessions.push({ label, items: [{ item, flatIndex }] });
    } else {
      last.items.push({ item, flatIndex });
    }
  });
  const totalItems = day.items.length;

  return (
    <Card className="flex flex-col gap-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* ── Day header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-bold text-white shadow-sm shadow-teal-900/25">
              {day.day}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-stone-500 font-medium">
                📍 {day.location}
              </span>
              <span className="text-xs text-stone-300">·</span>
              <span className="text-xs text-stone-400">
                {day.items.length} {day.items.length === 1 ? "place" : "places"}
              </span>
            </div>
          </div>
          <h3 className="font-display text-xl font-bold text-stone-900 leading-snug">{day.title}</h3>
        </div>
        {day.totalCostLkr > 0 && (
          <div className="text-right shrink-0">
            <p className="text-[10px] text-stone-400 uppercase tracking-wide font-medium">Est. day cost</p>
            <p className="text-sm font-bold text-teal-700 tabular-nums mt-0.5">
              {formatLKR(day.totalCostLkr)}
            </p>
          </div>
        )}
      </div>

      {/* ── Items grouped by session ─────────────────────────────────────── */}
      {day.items.length > 0 ? (
        <div className="flex flex-col gap-1">
          {sessions.map((session, si) => {
            const cfg = sessionConfig[session.label];
            return (
              <div key={session.label}>
                {/* Session divider */}
                <div className="flex items-center gap-2 mb-3 mt-2">
                  <div className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border", cfg.bg, cfg.color, cfg.border)}>
                    <span>{cfg.icon}</span>
                    <span>{session.label}</span>
                  </div>
                  <div className="flex-1 h-px bg-stone-100" />
                </div>

                {/* Places in session */}
                <div className="flex flex-col">
                  {session.items.map(({ item, flatIndex }, idx) => (
                    <div key={item.id}>
                      <PlaceItem
                        item={item}
                        flatIndex={flatIndex}
                        isFirst={flatIndex === 0}
                        isLast={flatIndex === totalItems - 1}
                        readOnly={readOnly}
                        callbacks={callbacks}
                      />
                      {(idx < session.items.length - 1 || si < sessions.length - 1) && (
                        <TransferRow />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-stone-50 border border-dashed border-stone-200 px-4 py-10 text-center">
          <p className="text-3xl mb-3 opacity-30">🗓</p>
          <p className="text-sm font-semibold text-stone-500 mb-1">
            All places have been removed from this day.
          </p>
          <p className="text-xs text-stone-400">
            Use &ldquo;Reset to generated plan&rdquo; to restore the original itinerary.
          </p>
        </div>
      )}

      {/* ── Transport note ────────────────────────────────────────────────── */}
      {day.transportNote && (
        <div className="flex gap-3 items-start rounded-xl bg-sky-50 border border-sky-100 px-4 py-3.5">
          <span className="text-base shrink-0 mt-0.5">🚌</span>
          <div>
            <p className="text-xs font-semibold text-sky-800 mb-0.5">Getting around</p>
            <p className="text-xs text-sky-700 leading-relaxed">{day.transportNote}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
