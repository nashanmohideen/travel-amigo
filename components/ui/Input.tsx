import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-stone-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-stone-400">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border border-stone-200 bg-white py-3 text-stone-900 placeholder-stone-400",
              "text-base transition-colors duration-150",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
              "disabled:bg-stone-50 disabled:cursor-not-allowed",
              leftIcon ? "pl-10 pr-4" : "px-4",
              error && "border-red-400 focus:ring-red-400",
              className,
            )}
            {...props}
          />
        </div>
        {hint && !error && (
          <p className="text-xs text-stone-500">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
