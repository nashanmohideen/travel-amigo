"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type {
  GeneratedItinerary,
  ItineraryItem,
  Place,
  TripPace,
} from "@/types";
import { useEditableItinerary } from "@/hooks/useEditableItinerary";
import { useSaveItineraryMutation } from "@/features/itinerary/itineraryApi";
import { useAppSelector } from "@/store/hooks";
import { LS_EDITED_ITINERARY } from "@/lib/storageKeys";
import GeneratedItineraryCard from "@/components/features/GeneratedItineraryCard";
import GeneratedBudgetSummary from "@/components/features/GeneratedBudgetSummary";
import ReplacePlaceModal from "@/components/features/ReplacePlaceModal";
import ShareModal from "@/components/features/ShareModal";
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
    <Card className="no-print flex flex-col gap-4 shadow-sm">
      <div>
        <h3 className="text-sm font-bold text-stone-800">Actions</h3>
        <p className="text-xs text-stone-400 mt-0.5">Manage your itinerary</p>
      </div>

      <PaceSelector current={pace} onChange={onPaceChange} />

      <div className="flex flex-col gap-1 pt-1 border-t border-stone-100">
        <Link href="/plan" className="w-full">
          <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-amber-50 hover:text-amber-800 transition-colors duration-150 text-left border border-amber-200 bg-amber-50">
            <span>✏️</span>
            <span>Edit preferences</span>
          </button>
        </Link>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150 text-left disabled:opacity-50"
          disabled={isSaving}
          onClick={onSave}
        >
          <span>💾</span>
          <span>{isSaving ? "Saving..." : "Save trip"}</span>
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-teal-50 hover:text-teal-700 transition-colors duration-150 text-left"
          onClick={onShare}
        >
          <span>🔗</span>
          <span>Share itinerary</span>
        </button>
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 transition-colors duration-150 text-left"
          onClick={onPrint}
        >
          <span>⬇️</span>
          <span>Download / Print PDF</span>
        </button>
      </div>

      {isEdited && (
        <div className="border-t border-stone-100 pt-1">
          <button
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors duration-150 text-left"
            onClick={onReset}
          >
            <span>↺</span>
            <span>Reset to generated plan</span>
          </button>
        </div>
      )}

      <div className="border-t border-stone-100 pt-1">
        <button
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 hover:bg-red-50 transition-colors duration-150 text-left"
          onClick={onStartOver}
        >
          <span>🔄</span>
          <span>Start over</span>
        </button>
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-stone-950 px-4 py-3.5 shadow-2xl shadow-black/30 text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-2 border border-white/8">
      <span className="flex-1 leading-relaxed">
        Sign in to save your trip to your account.{" "}
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="underline font-semibold text-teal-300 hover:text-teal-200 transition-colors"
        >
          Sign in
        </Link>
      </span>
      <button
        onClick={onDismiss}
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white/10 text-stone-400 hover:bg-white/20 hover:text-white transition-all text-xs"
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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 max-w-sm w-[calc(100%-2rem)] rounded-2xl bg-stone-950 px-4 py-3.5 shadow-2xl shadow-black/30 text-white text-sm font-medium animate-in fade-in slide-in-from-bottom-2 border border-white/8">
      <span className="flex-1 leading-relaxed">{message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-white/10 text-stone-400 hover:bg-white/20 hover:text-white transition-all text-xs"
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
      <div className="min-h-[60vh] flex items-center justify-center bg-stone-50">
        <div className="text-center px-4">
          <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-teal-600 to-emerald-700 flex items-center justify-center shadow-lg shadow-teal-900/20">
            <span className="text-3xl">✈️</span>
          </div>
          <h2 className="font-display text-xl font-bold text-stone-800 mb-2">Generating your itinerary…</h2>
          <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
            Crafting your perfect Sri Lanka adventure. This takes just a moment.
          </p>
          <div className="mt-5 flex justify-center gap-1.5">
            {([0, 0.15, 0.3] as const).map((delay, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full bg-teal-500"
                style={{ animation: `pulse 1.4s ease-in-out ${delay}s infinite` }}
              />
            ))}
          </div>
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
        <div className="no-print bg-amber-50 border-b border-amber-200 px-4 py-3 text-center text-sm text-amber-800">
          <strong>Demo mode</strong> — showing a sample itinerary.{" "}
          <Link href="/plan" className="underline font-semibold hover:text-amber-900 transition-colors">
            Plan your own trip →
          </Link>
        </div>
      )}
      {isEdited && (
        <div className="no-print bg-teal-800 px-4 py-2.5 text-center text-xs text-white/85 font-medium">
          You have unsaved edits to this itinerary.{" "}
          <button
            onClick={resetToGenerated}
            className="underline font-semibold hover:text-white ml-1 transition-colors"
          >
            Reset to generated plan
          </button>
        </div>
      )}

      {/* ── Hero header ── */}
      <div className="print-hero relative overflow-hidden bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-800 text-white">
        {/* Background glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 80% 110%, rgba(251,191,36,0.10) 0%, transparent 55%), radial-gradient(ellipse at 20% -10%, rgba(16,185,129,0.10) 0%, transparent 50%)",
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
            {tripInput.travelStyle.charAt(0).toUpperCase() +
              tripInput.travelStyle.slice(1)}{" "}
            style
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {[transportLabel, paceLabel, generatedLabel].map((chip) => (
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
                    <li
                      key={i}
                      className="flex items-start gap-3 text-sm text-teal-800"
                    >
                      <span className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span className="leading-relaxed">{tip}</span>
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
