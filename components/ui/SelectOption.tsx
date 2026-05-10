import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SelectOptionProps {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  /** Show a tick indicator when selected */
  showTick?: boolean;
}

/**
 * Reusable single-select option button.
 * Used across the trip planning form for style, transport, pace, etc.
 */
export default function SelectOption({
  selected,
  onClick,
  children,
  className,
  showTick = false,
}: SelectOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left",
        "transition-all duration-150 cursor-pointer w-full",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        selected
          ? "border-teal-600 bg-teal-50 text-teal-900"
          : "border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50",
        className,
      )}
    >
      {showTick && selected && (
        <span className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-white text-xs font-bold">
          ✓
        </span>
      )}
      {children}
    </button>
  );
}
