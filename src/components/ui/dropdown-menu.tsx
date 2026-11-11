"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextValue | undefined>(undefined);

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div ref={dropdownRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({
  asChild,
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used inside DropdownMenu");

  if (
    asChild &&
    React.isValidElement<{ onClick?: (e: React.MouseEvent) => void; className?: string }>(children)
  ) {
    return React.cloneElement(children, {
      onClick: (e: React.MouseEvent) => {
        children.props.onClick?.(e);
        context.setIsOpen((prev) => !prev);
      },
      className: cn(children.props.className, className),
    });
  }

  return (
    <button
      type="button"
      onClick={() => context.setIsOpen((prev) => !prev)}
      className={cn("focus:outline-none cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  align = "right",
  className,
  children,
}: {
  align?: "left" | "right" | "center";
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownContext);
  if (!context) throw new Error("DropdownMenuContent must be used inside DropdownMenu");

  if (!context.isOpen) return null;

  const alignClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  }[align];

  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-[200px] rounded-xl border border-slate-200 bg-white p-1.5 text-slate-800 shadow-xl animate-in fade-in-80 zoom-in-95",
        alignClasses,
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  onClick,
  children,
  className,
  destructive = false,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  destructive?: boolean;
}) {
  const context = React.useContext(DropdownContext);

  const handleClick = () => {
    onClick?.();
    context?.setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer text-left",
        destructive
          ? "text-red-600 hover:bg-red-50 hover:text-red-700"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-slate-100" />;
}
