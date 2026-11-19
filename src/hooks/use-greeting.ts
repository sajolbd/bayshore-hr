"use client";

import * as React from "react";
import { useMounted } from "@/hooks/use-mounted";

/**
 * Maps the current local hour to a greeting. Boundaries:
 * 05:00-11:59 morning, 12:00-16:59 afternoon, 17:00-04:59 evening.
 */
export function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Time-aware greeting that refreshes every minute. Falls back to a
 * neutral greeting until after mount so SSR markup stays consistent.
 */
export function useGreeting() {
  const mounted = useMounted();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const greeting = mounted && now ? getGreeting(now) : "Hello";
  const dateLabel =
    mounted && now
      ? now.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "2-digit",
          year: "numeric",
        })
      : "";

  return { greeting, dateLabel };
}
