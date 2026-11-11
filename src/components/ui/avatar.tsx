"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy";
}

const sizeClasses = {
  sm: "h-7 w-7 text-xs",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
  xl: "h-14 w-14 text-base",
};

const statusClasses = {
  online: "bg-emerald-500",
  offline: "bg-slate-400",
  away: "bg-amber-500",
  busy: "bg-red-500",
};

export function Avatar({
  src,
  alt = "User Avatar",
  fallback = "U",
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center rounded-full bg-slate-100 font-medium text-slate-700 overflow-hidden ring-1 ring-slate-200/80",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-semibold text-slate-600 uppercase">
          {fallback.slice(0, 2)}
        </span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
            statusClasses[status],
            size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5"
          )}
        />
      )}
    </div>
  );
}
