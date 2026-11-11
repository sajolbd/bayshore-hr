import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-900 text-white hover:bg-slate-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200",
        neutral:
          "border-slate-200 bg-slate-100 text-slate-700",
        outline: "text-slate-700 border-slate-200",
        orange:
          "border-orange-200 bg-orange-50 text-orange-700 font-semibold",
        success:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        warning:
          "border-amber-200 bg-amber-50 text-amber-700",
        danger:
          "border-red-200 bg-red-50 text-red-700",
        info:
          "border-blue-200 bg-blue-50 text-blue-700",
        purple:
          "border-purple-200 bg-purple-50 text-purple-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  const dotColor = {
    default: "bg-white",
    secondary: "bg-slate-500",
    neutral: "bg-slate-500",
    outline: "bg-slate-400",
    orange: "bg-orange-600",
    success: "bg-emerald-600",
    warning: "bg-amber-600",
    danger: "bg-red-600",
    info: "bg-blue-600",
    purple: "bg-purple-600",
  }[variant || "default"];

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
