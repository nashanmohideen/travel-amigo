import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add subtle hover lift effect */
  hoverable?: boolean;
  /** Remove default padding */
  noPadding?: boolean;
}

export default function Card({
  hoverable = false,
  noPadding = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-stone-100 shadow-sm",
        !noPadding && "p-6",
        hoverable &&
          "transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
