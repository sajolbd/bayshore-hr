import Image from "next/image";
import { cn } from "@/lib/utils";

interface BayshoreLogoProps {
  size?: number;
  className?: string;
}

/**
 * Brand circular logo badge for Bayshore HR across desktop, mobile, and auth screens.
 */
export function BayshoreLogo({ size = 40, className }: BayshoreLogoProps) {
  return (
    <Image
      src="/bayshore-circle-logo.png"
      alt="Bayshore Communication Logo"
      width={size}
      height={size}
      priority
      className={cn("shrink-0 rounded-full object-cover shadow-xs", className)}
    />
  );
}

