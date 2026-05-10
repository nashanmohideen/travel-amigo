import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { ItineraryDay } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface ItineraryCardProps {
  day: ItineraryDay;
}

const activityBadgeVariant = {
  sightseeing: "teal",
  adventure: "amber",
  culture: "green",
  food: "amber",
  beach: "teal",
  wildlife: "green",
} as const;

export default function ItineraryCard({ day }: ItineraryCardProps) {
  return (
    <Card className="flex flex-col gap-5">
      {/* Day header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
              {day.day}
            </span>
            <span className="text-xs text-stone-400 font-medium">
              {new Date(day.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <h3 className="text-lg font-bold text-stone-900">{day.title}</h3>
          <p className="text-sm text-stone-500 mt-0.5">📍 {day.location}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm text-stone-400">Est. cost</p>
          <p className="text-base font-semibold text-teal-700">
            {formatCurrency(day.estimatedCost)}
          </p>
        </div>
      </div>

      {/* Activities */}
      <div className="flex flex-col gap-3">
        {day.activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-xl bg-stone-50 p-3"
          >
            <div className="mt-0.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-stone-800">
                  {activity.name}
                </p>
                <Badge variant={activityBadgeVariant[activity.type] ?? "stone"}>
                  {activity.type}
                </Badge>
              </div>
              <p className="text-xs text-stone-500 leading-relaxed">
                {activity.description}
              </p>
              <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-400">
                <span>⏱ {activity.duration}</span>
                {activity.cost > 0 && (
                  <span>💵 {formatCurrency(activity.cost)}/person</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Logistics row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-stone-100 pt-4 text-xs text-stone-500">
        <div>
          <p className="font-semibold text-stone-600 mb-0.5">🏨 Stay</p>
          <p>{day.accommodation}</p>
        </div>
        <div>
          <p className="font-semibold text-stone-600 mb-0.5">🚌 Transport</p>
          <p>{day.transport}</p>
        </div>
        <div>
          <p className="font-semibold text-stone-600 mb-0.5">🍽 Meals</p>
          <p>{day.meals.filter(Boolean).join(" · ")}</p>
        </div>
      </div>
    </Card>
  );
}
