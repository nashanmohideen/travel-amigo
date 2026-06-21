import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add subtle hover lift effect */
  hoverable?: boolean;
  /** Remove default padding */
  noPadding?: boolean;
  /** Use a tinted warm surface instead of pure white */
  warm?: boolean;
}

export default function Card({
  hoverable = false,
  noPadding = false,
  warm = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-stone-100 shadow-sm",
        warm ? "bg-stone-50/80" : "bg-white",
        !noPadding && "p-6",
        hoverable &&
          "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
