import Card from "@/components/ui/Card";
import type { GeneratedBudgetBreakdown, BudgetStatus, BudgetConfidence } from "@/types";
import { formatLKR, cn } from "@/lib/utils";

interface GeneratedBudgetSummaryProps {
  budget: GeneratedBudgetBreakdown;
  budgetStatus: BudgetStatus;
  budgetConfidence: BudgetConfidence;
  userBudgetLkr: number;
  travelers: number;
  duration: number;
}

const LINE_ITEMS: {
  key: keyof Omit<GeneratedBudgetBreakdown, "total" | "perPerson" | "currency">;
  label: string;
  emoji: string;
}[] = [
  { key: "accommodation", label: "Accommodation", emoji: "🏨" },
  { key: "food",          label: "Food & Dining",      emoji: "🍛" },
  { key: "transport",     label: "Transport",           emoji: "🚌" },
  { key: "activities",   label: "Activities & Entry",  emoji: "🎟" },
  { key: "buffer",        label: "Contingency (10%)",   emoji: "🪙" },
];

const STATUS_CONFIG: Record<
  BudgetStatus,
  { label: string; bg: string; text: string; dot: string; bar: string }
> = {
  within_budget: {
    label: "Within budget",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  tight_budget: {
    label: "Tight budget",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  over_budget: {
    label: "Over budget",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
};

const CONFIDENCE_LABEL: Record<BudgetConfidence, { label: string; icon: string }> = {
  high:   { label: "High confidence",   icon: "✓" },
  medium: { label: "Medium confidence", icon: "~" },
  low:    { label: "Low confidence",    icon: "⚠" },
};

export default function GeneratedBudgetSummary({
  budget,
  budgetStatus,
  budgetConfidence,
  userBudgetLkr,
  travelers,
  duration,
}: GeneratedBudgetSummaryProps) {
  const statusCfg = STATUS_CONFIG[budgetStatus];
  const confidenceCfg = CONFIDENCE_LABEL[budgetConfidence];

  // Budget usage: capped at 120% for display purposes
  const usagePct = Math.min(
    Math.round((budget.total / Math.max(userBudgetLkr, 1)) * 100),
    120
  );
  const barWidth = Math.min(usagePct, 100);

  return (
    <Card className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-stone-900">Estimated Budget</h3>
        <p className="text-xs text-stone-400 mt-0.5">
          All costs in LKR · {travelers}{" "}
          {travelers === 1 ? "traveller" : "travellers"} · {duration}{" "}
          {duration === 1 ? "night" : "nights"}
        </p>
      </div>

      {/* Total highlight card */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white">
        <p className="text-xs opacity-75 uppercase tracking-wide">Total estimated cost</p>
        <p className="text-3xl font-bold mt-1 tabular-nums">{formatLKR(budget.total)}</p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
          <span>{formatLKR(budget.perPerson)} /person</span>
          <span className="opacity-40">·</span>
          <span>{formatLKR(Math.round(budget.total / Math.max(duration, 1)))}/day</span>
        </div>
      </div>

      {/* Budget vs. user budget progress */}
      {userBudgetLkr > 0 && (
        <div>
          <div className="flex items-center justify-between mb-1.5 text-xs">
            <span className="text-stone-500">Your budget</span>
            <span className="font-semibold text-stone-700 tabular-nums">
              {formatLKR(userBudgetLkr)}
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className={cn("h-2.5 rounded-full transition-all", statusCfg.bar)}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-stone-400">
            <span>LKR 0</span>
            <span className={cn("font-medium", statusCfg.text)}>
              {usagePct}% used
            </span>
            <span>{formatLKR(userBudgetLkr)}</span>
          </div>
        </div>
      )}

      {/* Status + confidence row */}
      <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2.5", statusCfg.bg)}>
        <span className={cn("h-2 w-2 rounded-full shrink-0", statusCfg.dot)} />
        <span className={cn("text-xs font-semibold", statusCfg.text)}>
          {statusCfg.label}
        </span>
        <span className="ml-auto flex items-center gap-1 text-xs text-stone-400">
          <span>{confidenceCfg.icon}</span>
          <span>{confidenceCfg.label}</span>
        </span>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-3">
        {LINE_ITEMS.map(({ key, label, emoji }) => {
          const amount = budget[key] as number;
          if (amount === 0) return null;
          const pct = Math.round((amount / Math.max(budget.total, 1)) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-stone-600">
                  {emoji} {label}
                </span>
                <span className="text-sm font-semibold text-stone-800 tabular-nums">
                  {formatLKR(amount)}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-1.5 rounded-full bg-teal-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="text-[11px] text-stone-400 border-t border-stone-100 pt-3 leading-relaxed">
        Costs are estimates and may vary by season, availability, exchange rates,
        and local pricing. Accommodation assumes 1 room per 2 travellers.
      </p>
    </Card>
  );
}
