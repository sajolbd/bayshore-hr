import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, label, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const inputControl = icon ? (
      <div className="relative flex items-center w-full">
        <div className="absolute left-3 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    ) : (
      <input
        id={inputId}
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <div className="w-full space-y-1.5">
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {inputControl}
        </div>
      );
    }

    return inputControl;
  }
);
Input.displayName = "Input";

export { Input };
