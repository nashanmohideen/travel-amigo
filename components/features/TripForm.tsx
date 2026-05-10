"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SelectOption from "@/components/ui/SelectOption";
import { cn, formatLKR } from "@/lib/utils";
import type { TripInput, TravelStyle, TransportMode, TripPace } from "@/types";
import { LS_TRIP_INPUT } from "@/lib/storageKeys";

// ── Static option data ────────────────────────────────────────────────────────

const DESTINATIONS = [
  { id: "ella", label: "Ella", emoji: "🍵", tag: "Hill country" },
  { id: "kandy", label: "Kandy", emoji: "🛕", tag: "Cultural" },
  { id: "galle", label: "Galle", emoji: "⚓", tag: "Coastal fort" },
  { id: "nuwara-eliya", label: "Nuwara Eliya", emoji: "🌿", tag: "Tea country" },
  { id: "colombo", label: "Colombo", emoji: "🏙️", tag: "City" },
];

const DURATIONS = [1, 2, 3, 4, 5] as const;

const TRAVEL_STYLES: { value: TravelStyle; label: string; emoji: string; desc: string }[] = [
  { value: "budget", label: "Budget", emoji: "🎒", desc: "Guesthouses, local eats, public transport" },
  { value: "balanced", label: "Balanced", emoji: "🏨", desc: "Mix of comfort and value" },
  { value: "premium", label: "Premium", emoji: "✨", desc: "Boutique stays, curated experiences" },
];

const INTERESTS = [
  { value: "nature", label: "Nature", emoji: "🌿" },
  { value: "culture", label: "Culture", emoji: "🛕" },
  { value: "food", label: "Food", emoji: "🍛" },
  { value: "adventure", label: "Adventure", emoji: "🧗" },
  { value: "beaches", label: "Beaches", emoji: "🏖️" },
  { value: "photography", label: "Photography", emoji: "📸" },
  { value: "family", label: "Family-friendly", emoji: "👨‍👩‍👧" },
  { value: "relaxation", label: "Relaxation", emoji: "🧘" },
];

const TRANSPORT_MODES: { value: TransportMode; label: string; emoji: string; desc: string }[] = [
  { value: "public", label: "Public transport", emoji: "🚌", desc: "Buses & trains" },
  { value: "private", label: "Private vehicle", emoji: "🚗", desc: "Hired car or van" },
  { value: "mixed", label: "Mixed", emoji: "🔀", desc: "Best of both" },
];

const PACES: { value: TripPace; label: string; emoji: string; desc: string }[] = [
  { value: "relaxed", label: "Relaxed", emoji: "😌", desc: "1–2 activities per day" },
  { value: "balanced", label: "Balanced", emoji: "🙂", desc: "2–3 activities per day" },
  { value: "packed", label: "Packed", emoji: "⚡", desc: "See as much as possible" },
];

// ── Budget warning threshold (LKR per person per day) ─────────────────────────
const LOW_BUDGET_THRESHOLD = 3500;

// ── Default form state ────────────────────────────────────────────────────────
const DEFAULT_FORM: TripInput = {
  destination: "",
  duration: 3,
  travelers: 2,
  budgetLKR: 50000,
  travelStyle: "balanced",
  interests: [],
  transportMode: "mixed",
  pace: "balanced",
};

// ── Errors type ───────────────────────────────────────────────────────────────
type FormErrors = Partial<Record<keyof TripInput, string>>;

// ── Section heading sub-component ─────────────────────────────────────────────
function SectionLabel({ step, children }: { step: number; children: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white shrink-0">
        {step}
      </span>
      <h2 className="text-base font-semibold text-stone-900">{children}</h2>
    </div>
  );
}

// ── Summary panel ─────────────────────────────────────────────────────────────
function SummaryPanel({
  form,
  budgetWarning,
}: {
  form: TripInput;
  budgetWarning: string | null;
}) {
  const dest = DESTINATIONS.find((d) => d.id === form.destination);
  const perPersonPerDay =
    form.travelers > 0 && form.duration > 0
      ? form.budgetLKR / (form.travelers * form.duration)
      : 0;

  const rows: { label: string; value: string }[] = [
    { label: "Destination", value: dest ? `${dest.emoji} ${dest.label}` : "—" },
    { label: "Duration", value: form.duration ? `${form.duration} day${form.duration > 1 ? "s" : ""}` : "—" },
    { label: "Travellers", value: form.travelers ? `${form.travelers} ${form.travelers === 1 ? "person" : "people"}` : "—" },
    { label: "Budget", value: form.budgetLKR ? formatLKR(form.budgetLKR) : "—" },
    { label: "Per person/day", value: perPersonPerDay > 0 ? formatLKR(Math.round(perPersonPerDay)) : "—" },
    { label: "Style", value: TRAVEL_STYLES.find((s) => s.value === form.travelStyle)?.label ?? "—" },
    { label: "Transport", value: TRANSPORT_MODES.find((t) => t.value === form.transportMode)?.label ?? "—" },
    { label: "Pace", value: PACES.find((p) => p.value === form.pace)?.label ?? "—" },
  ];

  const selectedInterests = INTERESTS.filter((i) => form.interests.includes(i.value));

  return (
    <Card className="flex flex-col gap-4">
      <div>
        <h3 className="font-bold text-stone-900">Trip summary</h3>
        <p className="text-xs text-stone-400 mt-0.5">Updates as you fill the form</p>
      </div>

      <dl className="flex flex-col gap-2.5">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex items-start justify-between gap-2">
            <dt className="text-xs text-stone-500 shrink-0">{label}</dt>
            <dd className="text-xs font-semibold text-stone-800 text-right">{value}</dd>
          </div>
        ))}
      </dl>

      {selectedInterests.length > 0 && (
        <div>
          <p className="text-xs text-stone-500 mb-1.5">Interests</p>
          <div className="flex flex-wrap gap-1">
            {selectedInterests.map((i) => (
              <span
                key={i.value}
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700"
              >
                {i.emoji} {i.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Budget warning */}
      {budgetWarning && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex gap-2">
          <span className="text-amber-500 text-base shrink-0">⚠️</span>
          <p className="text-xs text-amber-700 leading-relaxed">{budgetWarning}</p>
        </div>
      )}

      {/* Readiness indicator */}
      {!budgetWarning && form.destination && form.interests.length > 0 && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 flex gap-2 items-center">
          <span className="text-emerald-500 text-base shrink-0">✅</span>
          <p className="text-xs text-emerald-700 font-medium">Looks good! Ready to generate.</p>
        </div>
      )}
    </Card>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function TripForm() {
  const router = useRouter();
  const [form, setForm] = useState<TripInput>(DEFAULT_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // Derive budget warning without storing it in state
  const budgetPerPersonPerDay =
    form.travelers > 0 && form.duration > 0
      ? form.budgetLKR / (form.travelers * form.duration)
      : 0;
  const budgetWarning =
    form.budgetLKR > 0 && budgetPerPersonPerDay < LOW_BUDGET_THRESHOLD
      ? `${formatLKR(Math.round(budgetPerPersonPerDay))}/person/day may be tight for a ${form.travelStyle} trip. You can still generate — just expect limited options.`
      : null;

  function set<K extends keyof TripInput>(key: K, value: TripInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error on change
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleInterest(value: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(value)
        ? prev.interests.filter((i) => i !== value)
        : [...prev.interests, value],
    }));
    if (errors.interests) setErrors((e) => ({ ...e, interests: undefined }));
  }

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!form.destination) errs.destination = "Please select a destination.";
    if (form.travelers < 1 || form.travelers > 12)
      errs.travelers = "Enter a number between 1 and 12.";
    if (!form.budgetLKR || form.budgetLKR < 1)
      errs.budgetLKR = "Enter a valid total budget.";
    if (form.interests.length === 0)
      errs.interests = "Pick at least one interest.";
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      // Scroll to first error
      const firstErrorEl = document.querySelector("[data-error]");
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    // Save to localStorage so itinerary page can read user's choices
    try {
      localStorage.setItem(LS_TRIP_INPUT, JSON.stringify(form));
    } catch {
      // localStorage may be unavailable (private browsing, etc.) — not fatal
    }

    // Simulate generation delay
    await new Promise((r) => setTimeout(r, 1600));
    router.push("/itinerary/demo");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Form fields (2 columns on desktop) ─────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* 1. Destination */}
          <Card data-error={errors.destination ? "true" : undefined}>
            <SectionLabel step={1}>Where are you going?</SectionLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DESTINATIONS.map((dest) => (
                <SelectOption
                  key={dest.id}
                  selected={form.destination === dest.id}
                  onClick={() => set("destination", dest.id)}
                  showTick
                >
                  <span className="text-2xl">{dest.emoji}</span>
                  <span className="font-semibold text-sm leading-tight">{dest.label}</span>
                  <span className="text-xs text-stone-400">{dest.tag}</span>
                </SelectOption>
              ))}
            </div>
            {errors.destination && (
              <p className="mt-3 text-xs text-red-500" role="alert">
                {errors.destination}
              </p>
            )}
          </Card>

          {/* 2. Duration */}
          <Card>
            <SectionLabel step={2}>How many days?</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("duration", d)}
                  className={cn(
                    "flex items-center justify-center rounded-xl border-2 px-5 py-3 text-sm font-semibold transition-all duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                    form.duration === d
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300",
                  )}
                >
                  {d} {d === 1 ? "day" : "days"}
                </button>
              ))}
            </div>
          </Card>

          {/* 3. Traveller count */}
          <Card data-error={errors.travelers ? "true" : undefined}>
            <SectionLabel step={3}>How many travellers?</SectionLabel>
            <div className="flex items-center gap-4">
              <button
                type="button"
                aria-label="Decrease travellers"
                onClick={() => set("travelers", Math.max(1, form.travelers - 1))}
                className="h-11 w-11 rounded-full border-2 border-stone-200 text-stone-600 text-xl font-bold hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                −
              </button>
              <span className="w-10 text-center text-2xl font-bold text-stone-900 tabular-nums">
                {form.travelers}
              </span>
              <button
                type="button"
                aria-label="Increase travellers"
                onClick={() => set("travelers", Math.min(12, form.travelers + 1))}
                className="h-11 w-11 rounded-full border-2 border-stone-200 text-stone-600 text-xl font-bold hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              >
                +
              </button>
              <span className="ml-1 text-sm text-stone-500">
                {form.travelers === 1 ? "person" : "people"} · max 12
              </span>
            </div>
            {errors.travelers && (
              <p className="mt-2 text-xs text-red-500" role="alert">
                {errors.travelers}
              </p>
            )}
          </Card>

          {/* 4. Budget */}
          <Card data-error={errors.budgetLKR ? "true" : undefined}>
            <SectionLabel step={4}>Total budget (LKR)</SectionLabel>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-stone-400 text-sm font-medium">
                LKR
              </span>
              <input
                type="number"
                min={1}
                step={1000}
                value={form.budgetLKR || ""}
                placeholder="50000"
                onChange={(e) => set("budgetLKR", Number(e.target.value))}
                className={cn(
                  "w-full rounded-xl border py-3 pl-14 pr-4 text-stone-900 text-base",
                  "placeholder-stone-400 transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
                  errors.budgetLKR
                    ? "border-red-400 focus:ring-red-400"
                    : "border-stone-200",
                )}
              />
            </div>
            {errors.budgetLKR && (
              <p className="mt-1.5 text-xs text-red-500" role="alert">
                {errors.budgetLKR}
              </p>
            )}
            {/* Inline budget warning (mobile — shown inline; desktop shows in sidebar) */}
            {budgetWarning && (
              <div className="lg:hidden mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 flex gap-2">
                <span className="text-amber-500 shrink-0">⚠️</span>
                <p className="text-xs text-amber-700 leading-relaxed">{budgetWarning}</p>
              </div>
            )}
            <p className="mt-2 text-xs text-stone-400">
              This is the total for all travellers for the entire trip.
            </p>
          </Card>

          {/* 5. Travel style */}
          <Card>
            <SectionLabel step={5}>What&apos;s your travel style?</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRAVEL_STYLES.map((style) => (
                <SelectOption
                  key={style.value}
                  selected={form.travelStyle === style.value}
                  onClick={() => set("travelStyle", style.value)}
                  showTick
                >
                  <span className="text-2xl">{style.emoji}</span>
                  <span className="font-semibold text-sm">{style.label}</span>
                  <span className="text-xs text-stone-400 leading-snug">{style.desc}</span>
                </SelectOption>
              ))}
            </div>
          </Card>

          {/* 6. Interests */}
          <Card data-error={errors.interests ? "true" : undefined}>
            <SectionLabel step={6}>What are you interested in?</SectionLabel>
            <p className="text-xs text-stone-400 -mt-2 mb-4">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = form.interests.includes(interest.value);
                return (
                  <button
                    key={interest.value}
                    type="button"
                    onClick={() => toggleInterest(interest.value)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
                      selected
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-stone-200 bg-white text-stone-600 hover:border-teal-300 hover:text-teal-700",
                    )}
                  >
                    {interest.emoji} {interest.label}
                  </button>
                );
              })}
            </div>
            {errors.interests && (
              <p className="mt-3 text-xs text-red-500" role="alert">
                {errors.interests}
              </p>
            )}
          </Card>

          {/* 7. Transport mode */}
          <Card>
            <SectionLabel step={7}>How will you get around?</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRANSPORT_MODES.map((t) => (
                <SelectOption
                  key={t.value}
                  selected={form.transportMode === t.value}
                  onClick={() => set("transportMode", t.value)}
                  showTick
                >
                  <span className="text-2xl">{t.emoji}</span>
                  <span className="font-semibold text-sm">{t.label}</span>
                  <span className="text-xs text-stone-400">{t.desc}</span>
                </SelectOption>
              ))}
            </div>
          </Card>

          {/* 8. Pace */}
          <Card>
            <SectionLabel step={8}>What&apos;s your ideal pace?</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PACES.map((p) => (
                <SelectOption
                  key={p.value}
                  selected={form.pace === p.value}
                  onClick={() => set("pace", p.value)}
                  showTick
                >
                  <span className="text-2xl">{p.emoji}</span>
                  <span className="font-semibold text-sm">{p.label}</span>
                  <span className="text-xs text-stone-400">{p.desc}</span>
                </SelectOption>
              ))}
            </div>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            variant="secondary"
            size="lg"
            loading={loading}
            fullWidth
            className="mt-1"
          >
            {loading ? "Crafting your itinerary…" : "Generate My Itinerary ✨"}
          </Button>

          {/* Mobile: summary below form */}
          <div className="lg:hidden">
            <SummaryPanel form={form} budgetWarning={budgetWarning} />
          </div>
        </div>

        {/* ── Summary panel (desktop only, sticky) ─────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <SummaryPanel form={form} budgetWarning={budgetWarning} />
          </div>
        </div>

      </div>
    </form>
  );
}
