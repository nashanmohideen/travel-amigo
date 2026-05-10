import Card from "@/components/ui/Card";
import type { BudgetBreakdown } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BudgetSummaryProps {
  budget: BudgetBreakdown;
  travelers: number;
  duration: number;
}

const lineItems: { key: keyof Omit<BudgetBreakdown, "total">; label: string; emoji: string }[] = [
  { key: "accommodation", label: "Accommodation", emoji: "🏨" },
  { key: "food", label: "Food & Dining", emoji: "🍛" },
  { key: "transport", label: "Transport", emoji: "🚌" },
  { key: "activities", label: "Activities & Entry", emoji: "🎟" },
  { key: "miscellaneous", label: "Miscellaneous", emoji: "💼" },
];

export default function BudgetSummary({ budget, travelers, duration }: BudgetSummaryProps) {
  const perPerson = Math.round(budget.total / travelers);
  const perDay = Math.round(budget.total / duration);

  return (
    <Card className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-stone-900">Estimated Budget</h3>
        <p className="text-xs text-stone-400 mt-0.5">
          All costs in USD · {travelers} {travelers === 1 ? "traveller" : "travellers"} · {duration} days
        </p>
      </div>

      {/* Total highlight */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-5 text-white">
        <p className="text-sm opacity-80">Total trip cost</p>
        <p className="text-4xl font-bold mt-1">{formatCurrency(budget.total)}</p>
        <div className="mt-3 flex gap-4 text-sm opacity-90">
          <span>{formatCurrency(perPerson)} per person</span>
          <span>·</span>
          <span>{formatCurrency(perDay)}/day</span>
        </div>
      </div>

      {/* Line items */}
      <div className="flex flex-col gap-2">
        {lineItems.map(({ key, label, emoji }) => {
          const amount = budget[key];
          const pct = Math.round((amount / budget.total) * 100);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-stone-600">
                  {emoji} {label}
                </span>
                <span className="text-sm font-semibold text-stone-800">
                  {formatCurrency(amount)}
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 w-full rounded-full bg-stone-100">
                <div
                  className="h-1.5 rounded-full bg-teal-500 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-stone-400 border-t border-stone-100 pt-3">
        * Estimates based on mid-range 2025 prices. Actual costs may vary.
      </p>
    </Card>
  );
}
