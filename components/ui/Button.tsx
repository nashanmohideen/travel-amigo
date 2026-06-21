import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-teal-700 text-white shadow-sm shadow-teal-900/20 hover:bg-teal-800 hover:shadow-md hover:shadow-teal-900/25 active:bg-teal-900 active:shadow-sm",
  secondary:
    "bg-amber-500 text-white shadow-sm shadow-amber-900/20 hover:bg-amber-600 hover:shadow-md hover:shadow-amber-900/25 active:bg-amber-700 active:shadow-sm",
  outline:
    "border-2 border-teal-700 text-teal-700 hover:bg-teal-50 hover:border-teal-800 active:bg-teal-100",
  ghost:
    "text-teal-700 hover:bg-teal-50 active:bg-teal-100",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:bg-red-800",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;
    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold",
          "transition-all duration-200 cursor-pointer select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:shadow-none",
          "active:scale-[0.98]",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
