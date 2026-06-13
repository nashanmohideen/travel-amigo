"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type {
  GeneratedItinerary,
  ItineraryItem,
  Place,
  TripPace,
  BudgetStatus,
} from "@/types";
import { useEditableItinerary } from "@/hooks/useEditableItinerary";
import { useSaveItineraryMutation } from "@/features/itinerary/itineraryApi";
import { useAppSelector } from "@/store/hooks";
import { LS_EDITED_ITINERARY } from "@/lib/storageKeys";
import GeneratedItineraryCard from "@/components/features/GeneratedItineraryCard";
import GeneratedBudgetSummary from "@/components/features/GeneratedBudgetSummary";
import ReplacePlaceModal from "@/components/features/ReplacePlaceModal";
import ShareModal from "@/components/features/ShareModal";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { formatDisplayDate } from "@/lib/formatters";
import { getWarningSeverity } from "@/lib/itinerary/itineraryHelpers";
import FeedbackForm from "@/components/features/FeedbackForm";
import MockAssistantPanel from "@/components/features/MockAssistantPanel";

/* ─── label maps ───────────────────────────────────────────── */

const TRANSPORT_LABEL: Record<string, string> = {
  public: "🚌 Public transport",
  private: "🚗 Private vehicle",
  mixed: "🔀 Mixed transport",
};

/* ─── Pace selector ────────────────────────────────────────── */

interface PaceSelectorProps {
  current: TripPace;
  onChange: (p: TripPace) => void;
}

const PACE_OPTIONS: { value: TripPace; label: string; icon: string }[] = [
  { value: "relaxed", label: "Relaxed", icon: "🌿" },
  { value: "balanced", label: "Balanced", icon: "⚖️" },
  { value: "packed", label: "Packed", icon: "⚡" },
];

function PaceSelector({ current, onChange }: PaceSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
        Pace
      </p>
      <div className="flex rounded-xl border border-stone-200 overflow-hidden bg-stone-50">
        {PACE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              if (opt.value !== current) onChange(opt.value);
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-semibold transition-colors",
              current === opt.value
                ? "bg-teal-700 text-white"
                : "text-stone-600 hover:bg-stone-100"
            )}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Map placeholder ──────────────────────────────────────── */

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
                {i < stops.length - 1 && (
                  <div className="mt-0 h-6 w-0.5 bg-teal-300" />
                )}
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

/* ─── Action panel ─────────────────────────────────────────── */

interface ActionPanelProps {
  isEdited: boolean;
  onReset: () => void;
  onStartOver: () => void;
  onShare: () => void;
  onPrint: () => void;
  onSave: () => void;
  isSaving: boolean;
  pace: TripPace;
  onPaceChange: (p: TripPace) => void;
}

function ActionPanel({
  isEdited,
  onReset,
  onStartOver,
  onShare,
  onPrint,
  onSave,
  isSaving,
  pace,
  onPaceChange,
}: ActionPanelProps) {
  return (
    <Card className="no-print flex flex-col gap-3">
      <h3 className="text-sm font-bold text-stone-700">Actions</h3>

      <PaceSelector current={pace} onChange={onPaceChange} />

      <div className="flex flex-col gap-1.5 pt-1 border-t border-stone-100">
        <Link href="/plan" className="w-full">
          <Button variant="secondary" size="sm" className="w-full justify-start">
            ✏️ Edit preferences
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          disabled={isSaving}
          onClick={onSave}
        >
          💾 {isSaving ? "Saving..." : "Save trip"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onShare}
        >
          🔗 Share itinerary
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={onPrint}
        >
          ⬇️ Download / Print PDF
        </Button>
      </div>

      {isEdited && (
        <div className="border-t border-stone-100 pt-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-stone-500 hover:bg-stone-50"
            onClick={onReset}
          >
            ↺ Reset to generated plan
          </Button>
        </div>
      )}

      <div className="border-t border-stone-100 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-500 hover:bg-red-50"
          onClick={onStartOver}
        >
          🔄 Start over
        </Button>
      </div>
    </Card>
  );
}

/* ─── Guest save prompt ───────────────────────────────────── */

function GuestSavePrompt({
  redirectPath,
  onDismiss,
}: {
  redirectPath: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-stone-900 px-4 py-3 shadow-xl text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
      <span className="flex-1">
        Sign in to save your trip to your account.{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="underline font-semibold text-teal-300 hover:text-teal-200"
        >
          Sign in
        </Link>
      </span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-stone-400 hover:text-white transition-colors text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Toast notification ──────────────────────────────────── */

function Toast({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-stone-900 px-4 py-3 shadow-xl text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-2">
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-stone-400 hover:text-white transition-colors text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

/* ─── Replace modal state ──────────────────────────────────── */

interface ReplaceState {
  open: boolean;
  dayIndex: number;
  item: ItineraryItem | null;
  alternatives: Place[];
}

/* ─── Main view ────────────────────────────────────────────── */

export default function GeneratedItineraryView() {
  const router = useRouter();

  const {
    itinerary,
    tripInput,
    fromStorage,
    isEdited,
    lastAction,
    removePlace,
    replacePlace,
    movePlaceUp,
    movePlaceDown,
    changePace,
    resetToGenerated,
    startOver,
    getAlternatives,
    clearLastAction,
  } = useEditableItinerary();

  /* ── Toast auto-dismiss ── */
  const [notification, setNotification] = useState<string | null>(null);
  useEffect(() => {
    if (!lastAction) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNotification(lastAction);
    const t = setTimeout(() => {
      setNotification(null);
      clearLastAction();
    }, 3500);
    return () => clearTimeout(t);
  }, [lastAction, clearLastAction]);

  /* ── Share modal ── */
  const [shareOpen, setShareOpen] = useState(false);

  /* ── Save itinerary (POST /api/v1/trips, auth required) ── */
  const pathname = usePathname();
  const authStatus = useAppSelector((s) => s.auth.status);
  const [saveItinerary, { isLoading: isSaving }] = useSaveItineraryMutation();
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  async function handleSave() {
    if (!itinerary) return;

    // Guests keep the existing localStorage persistence (useEditableItinerary
    // already writes ta_edited_itinerary) and are prompted to sign in instead.
    if (authStatus !== "authenticated") {
      setShowGuestPrompt(true);
      return;
    }

    try {
      const result = await saveItinerary(itinerary).unwrap();
      // The trip now lives server-side — drop the localStorage copy and move
      // to the bookmarkable detail page.
      try {
        localStorage.removeItem(LS_EDITED_ITINERARY);
      } catch {}
      setNotification("Trip saved to your account.");
      router.push(`/trips/${result.id}`);
    } catch {
      setNotification("Could not save your trip — please try again.");
    }
  }

  /* ── Replace modal ── */
  const [replaceState, setReplaceState] = useState<ReplaceState>({
    open: false,
    dayIndex: 0,
    item: null,
    alternatives: [],
  });

  function openReplace(dayIndex: number, item: ItineraryItem) {
    setReplaceState({
      open: true,
      dayIndex,
      item,
      alternatives: getAlternatives(dayIndex, item.id),
    });
  }

  function handleReplaceSelect(place: Place) {
    if (replaceState.item) {
      replacePlace(replaceState.dayIndex, replaceState.item.id, place);
    }
    setReplaceState((s) => ({ ...s, open: false }));
  }

  /* ── Start over ── */
  function handleStartOver() {
    startOver();
    router.push("/plan");
  }

  /* ── Print ── */
  function handlePrint() {
    window.print();
  }

  /* ── Loading state ── */
  if (!itinerary || !tripInput) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">✈️</div>
          <p className="text-stone-500">Generating your itinerary…</p>
        </div>
      </div>
    );
  }

  const { budget, budgetStatus, budgetConfidence, warnings, tips } = itinerary;

  const transportLabel =
    TRANSPORT_LABEL[tripInput.transportMode] ?? tripInput.transportMode;
  const paceLabel = {
    relaxed: "🌿 Relaxed",
    balanced: "⚖️ Balanced",
    packed: "⚡ Packed",
  }[tripInput.pace] ?? tripInput.pace;
  const generatedLabel = `📅 ${formatDisplayDate(itinerary.generatedAt)}`;

  /* Build callbacks once; stable references because hook fns are useCallback */
  const makeCallbacks = (dayIndex: number) => ({
    onRemove: (itemId: string) => removePlace(dayIndex, itemId),
    onReplace: (item: ItineraryItem) => openReplace(dayIndex, item),
    onMoveUp: (flatIndex: number) => movePlaceUp(dayIndex, flatIndex),
    onMoveDown: (flatIndex: number) => movePlaceDown(dayIndex, flatIndex),
  });

  const BudgetBlock = (
    <GeneratedBudgetSummary
      budget={budget}
      budgetStatus={budgetStatus}
      budgetConfidence={budgetConfidence}
      userBudgetLkr={tripInput.budgetLKR}
      travelers={tripInput.travelers}
      duration={tripInput.duration}
    />
  );

  return (
    <div className="min-h-screen bg-stone-50">

      {/* ── Demo / Edited banners ── */}
      {!fromStorage && (
        <div className="no-print bg-amber-100 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-800">
          <strong>Demo mode</strong> — showing a sample itinerary.{" "}
          <Link href="/plan" className="underline font-medium hover:text-amber-900">
            Plan your own trip →
          </Link>
        </div>
      )}
      {isEdited && (
        <div className="no-print bg-teal-700 px-4 py-2 text-center text-xs text-white/90">
          You have unsaved edits to this itinerary.{" "}
          <button
            onClick={resetToGenerated}
            className="underline font-semibold hover:text-white ml-1"
          >
            Reset to generated plan
          </button>
        </div>
      )}

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white">
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
            {tripInput.travelStyle.charAt(0).toUpperCase() +
              tripInput.travelStyle.slice(1)}{" "}
            style
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[transportLabel, paceLabel, generatedLabel].map((chip) => (
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
        <div className="lg:hidden mb-8">{BudgetBlock}</div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Left: day cards */}
          <div className="flex flex-col gap-6">
            {itinerary.days.map((day, dayIndex) => (
              <div key={day.day} className="print-avoid-break">
                <GeneratedItineraryCard
                  day={day}
                  dayIndex={dayIndex}
                  callbacks={makeCallbacks(dayIndex)}
                />
              </div>
            ))}

            {/* Local tips */}
            {tips.length > 0 && (
              <Card className="bg-teal-50 border border-teal-100">
                <h3 className="text-sm font-bold text-teal-900 mb-3">
                  💡 Local tips for{" "}
                  {tripInput.destination.charAt(0).toUpperCase() +
                    tripInput.destination.slice(1)}
                </h3>
                <ul className="flex flex-col gap-2">
                  {tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-teal-800"
                    >
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* ── Assistant panel ── */}
            <section className="no-print">
              <MockAssistantPanel
                itinerary={itinerary}
                onChangePace={changePace}
                onReplacePlace={replacePlace}
              />
            </section>

            {/* ── Feedback ── */}
            <section className="no-print">
              <FeedbackForm itinerary={itinerary} wasEdited={isEdited} />
            </section>
          </div>

          {/* Right: sidebar */}
          <div className="flex flex-col gap-6">
            <div className="hidden lg:block">{BudgetBlock}</div>

            <MapPlaceholder itinerary={itinerary} />

            <ActionPanel
              isEdited={isEdited}
              onReset={resetToGenerated}
              onStartOver={handleStartOver}
              onShare={() => setShareOpen(true)}
              onPrint={handlePrint}
              onSave={handleSave}
              isSaving={isSaving}
              pace={tripInput.pace}
              onPaceChange={changePace}
            />
          </div>
        </div>
      </div>

      {/* ── Share modal ── */}
      {shareOpen && itinerary && (
        <ShareModal
          itinerary={itinerary}
          onClose={() => setShareOpen(false)}
        />
      )}

      {/* ── Replace modal ── */}
      {replaceState.open && replaceState.item && (
        <ReplacePlaceModal
          replacing={replaceState.item}
          alternatives={replaceState.alternatives}
          onSelect={handleReplaceSelect}
          onClose={() => setReplaceState((s) => ({ ...s, open: false }))}
        />
      )}

      {/* ── Guest save prompt ── */}
      {showGuestPrompt && (
        <GuestSavePrompt
          redirectPath={pathname}
          onDismiss={() => setShowGuestPrompt(false)}
        />
      )}

      {/* ── Toast notification ── */}
      {notification && (
        <Toast
          message={notification}
          onDismiss={() => {
            setNotification(null);
            clearLastAction();
          }}
        />
      )}

      {/* ── Print disclaimer (hidden on screen) ── */}
      <p className="print-disclaimer hidden">
        This itinerary uses estimated costs and prototype travel data. Confirm prices,
        opening hours, and transport before travelling.
      </p>
    </div>
  );
}
