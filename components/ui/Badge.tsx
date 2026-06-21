import { cn } from "@/lib/utils";

type BadgeVariant = "teal" | "amber" | "green" | "stone" | "red" | "sky" | "violet";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  teal:   "bg-teal-50 text-teal-700 ring-teal-200/80",
  amber:  "bg-amber-50 text-amber-700 ring-amber-200/80",
  green:  "bg-emerald-50 text-emerald-700 ring-emerald-200/80",
  stone:  "bg-stone-100 text-stone-600 ring-stone-200/80",
  red:    "bg-red-50 text-red-600 ring-red-200/80",
  sky:    "bg-sky-50 text-sky-700 ring-sky-200/80",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/80",
};

export default function Badge({
  children,
  variant = "stone",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
