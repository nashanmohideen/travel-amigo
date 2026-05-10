"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { FeedbackSubmission, FeedbackWouldUse, FeedbackWantedNext } from "@/types";
import { LS_FEEDBACK_SUBMISSIONS as LS_FEEDBACK } from "@/lib/storageKeys";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/formatters";

// ── helpers ───────────────────────────────────────────────────────────────────


function loadSubmissions(): FeedbackSubmission[] {
  try {
    const raw = localStorage.getItem(LS_FEEDBACK);
    if (raw) return JSON.parse(raw) as FeedbackSubmission[];
  } catch {
    /* ignore */
  }
  return [];
}

function topWantedNext(subs: FeedbackSubmission[]): FeedbackWantedNext | null {
  const counts = new Map<FeedbackWantedNext, number>();
  for (const sub of subs) {
    for (const opt of sub.wantedNext) {
      counts.set(opt, (counts.get(opt) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-stone-900 tabular-nums">{value}</p>
      {sub && <p className="text-xs text-stone-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ── would-use bar ─────────────────────────────────────────────────────────────

function WouldUseBar({ subs }: { subs: FeedbackSubmission[] }) {
  const total = subs.length;
  if (total === 0) return null;

  const counts: Record<FeedbackWouldUse, number> = { yes: 0, maybe: 0, no: 0 };
  for (const s of subs) counts[s.wouldUse]++;

  const segments: { key: FeedbackWouldUse; label: string; color: string; text: string }[] = [
    { key: "yes", label: "Yes", color: "bg-emerald-500", text: "text-emerald-700" },
    { key: "maybe", label: "Maybe", color: "bg-amber-400", text: "text-amber-700" },
    { key: "no", label: "No", color: "bg-red-400", text: "text-red-700" },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4">
      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wide mb-3">
        Would use for a real trip
      </p>
      <div className="flex rounded-full overflow-hidden h-3 mb-3 bg-stone-100">
        {segments.map(({ key, color }) => {
          const pct = (counts[key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={key}
              className={cn("h-3 transition-all", color)}
              style={{ width: `${pct}%` }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {segments.map(({ key, label, text }) => (
          <span key={key} className={cn("text-xs font-semibold", text)}>
            {label}: {counts[key]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── single submission row ─────────────────────────────────────────────────────

function SubmissionRow({ sub }: { sub: FeedbackSubmission }) {
  const [open, setOpen] = useState(false);

  const wouldUseStyle: Record<FeedbackWouldUse, string> = {
    yes: "bg-emerald-100 text-emerald-700",
    maybe: "bg-amber-100 text-amber-700",
    no: "bg-red-100 text-red-700",
  };
  const wouldUseLabel: Record<FeedbackWouldUse, string> = {
    yes: "Yes",
    maybe: "Maybe",
    no: "No",
  };
  const budgetLabel: Record<string, string> = {
    too_low: "Too low",
    reasonable: "Reasonable",
    too_high: "Too high",
    not_sure: "Not sure",
  };
  const statusStyle: Record<string, string> = {
    within_budget: "text-emerald-600",
    tight_budget: "text-amber-600",
    over_budget: "text-red-600",
  };
  const statusLabel: Record<string, string> = {
    within_budget: "Within budget",
    tight_budget: "Tight budget",
    over_budget: "Over budget",
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white">
      {/* Summary row */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex flex-wrap items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 rounded-xl transition-colors"
      >
        <span className="text-xs text-stone-400 shrink-0 min-w-[120px]">
          {formatDateTime(sub.createdAt)}
        </span>
        <span className="text-xs font-semibold text-stone-700 capitalize">
          {sub.destination ?? "—"}
        </span>
        {sub.durationDays != null && (
          <span className="text-xs text-stone-400">{sub.durationDays}n</span>
        )}
        <span
          className={cn(
            "text-[11px] font-semibold rounded-full px-2 py-0.5",
            wouldUseStyle[sub.wouldUse]
          )}
        >
          {wouldUseLabel[sub.wouldUse]}
        </span>
        <span className="text-xs text-stone-700">
          Rating: <strong>{sub.usefulnessRating}/5</strong>
        </span>
        {sub.budgetStatus && (
          <span className={cn("text-xs font-medium", statusStyle[sub.budgetStatus] ?? "")}>
            {statusLabel[sub.budgetStatus] ?? sub.budgetStatus}
          </span>
        )}
        <span className="ml-auto text-stone-400 text-xs">
          {open ? "▲ Less" : "▼ More"}
        </span>
      </button>

      {/* Detail panel */}
      {open && (
        <div className="border-t border-stone-100 px-4 py-4 flex flex-col gap-3 text-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Budget realism</p>
              <p className="font-medium text-stone-700">
                {budgetLabel[sub.budgetRealism] ?? sub.budgetRealism}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Travel style</p>
              <p className="font-medium text-stone-700 capitalize">
                {sub.travelStyle ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Pace</p>
              <p className="font-medium text-stone-700 capitalize">
                {sub.pace ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Was edited</p>
              <p className="font-medium text-stone-700">
                {sub.wasEdited ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Travellers</p>
              <p className="font-medium text-stone-700">{sub.travellerCount ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-stone-400 mb-0.5">Budget confidence</p>
              <p className="font-medium text-stone-700 capitalize">
                {sub.budgetConfidence ?? "—"}
              </p>
            </div>
          </div>

          {sub.wantedNext.length > 0 && (
            <div>
              <p className="text-xs text-stone-400 mb-1.5">Wanted next</p>
              <div className="flex flex-wrap gap-1.5">
                {sub.wantedNext.map((opt) => (
                  <span
                    key={opt}
                    className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs text-teal-700"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {sub.missingOrUnrealistic && (
            <div>
              <p className="text-xs text-stone-400 mb-1">Comment</p>
              <p className="text-sm text-stone-700 bg-stone-50 rounded-xl px-4 py-3 leading-relaxed">
                {sub.missingOrUnrealistic}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function FeedbackDashboard() {
  const [subs, setSubs] = useState<FeedbackSubmission[] | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSubs(loadSubmissions());
  }, []);

  async function handleCopyJSON() {
    if (!subs) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(subs, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* fallback — user must copy manually */
    }
  }

  if (subs === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  const avgRating =
    subs.length > 0
      ? (subs.reduce((s, f) => s + f.usefulnessRating, 0) / subs.length).toFixed(1)
      : "—";
  const top = topWantedNext(subs);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-1">
            Prototype validation
          </p>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Feedback submissions
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            User feedback collected via the itinerary page, stored locally.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 flex flex-col gap-8">

        {subs.length === 0 ? (
          /* ── Empty state ── */
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center">
            <p className="text-base font-semibold text-stone-700 mb-1">
              No feedback has been submitted yet.
            </p>
            <p className="text-sm text-stone-400 mb-6">
              Generate a trip itinerary and submit the feedback form to see results here.
            </p>
            <Link
              href="/itinerary/demo"
              className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors"
            >
              Test an itinerary
            </Link>
          </div>
        ) : (
          <>
            {/* ── Summary cards ── */}
            <div>
              <h2 className="text-sm font-bold text-stone-700 mb-3">Summary</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                <StatCard label="Submissions" value={subs.length} />
                <StatCard label="Avg. usefulness" value={`${avgRating} / 5`} />
                <StatCard
                  label="Most wanted next"
                  value={top ? top.split(" ").slice(0, 2).join(" ") : "—"}
                  sub={top ?? undefined}
                />
                <StatCard
                  label="Edited itineraries"
                  value={subs.filter((s) => s.wasEdited).length}
                  sub="used editing tools"
                />
              </div>
              <WouldUseBar subs={subs} />
            </div>

            {/* ── Export ── */}
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-bold text-stone-700">All submissions</h2>
              <button
                type="button"
                onClick={handleCopyJSON}
                className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
              >
                {copied ? "Copied!" : "Copy feedback JSON"}
              </button>
            </div>

            {/* ── Submissions list (newest first) ── */}
            <div className="flex flex-col gap-2">
              {[...subs].reverse().map((sub) => (
                <SubmissionRow key={sub.id} sub={sub} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
