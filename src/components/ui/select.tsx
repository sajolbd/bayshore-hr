import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, label, options, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const hasCustomWidth = Boolean(className && /\bw-\S+/.test(className));

    const selectControl = (
      <div className={cn("relative inline-flex items-center", (label || !hasCustomWidth) && "w-full")}>
        <select
          id={selectId}
          ref={ref}
          className={cn(
            "flex h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-1 pr-8 text-sm text-slate-800 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 h-4 w-4 text-slate-400" />
      </div>
    );

    if (label) {
      return (
        <div className="w-full space-y-1.5">
          <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700">
            {label}
          </label>
          {selectControl}
        </div>
      );
    }

    return selectControl;
  }
);
Select.displayName = "Select";

export { Select };
