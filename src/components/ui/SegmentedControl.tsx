"use client";

import React from "react";
import clsx from "clsx";

export interface SegmentedItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  title?: string;
}

interface SegmentedControlProps {
  items: SegmentedItem[];
  value: string;
  onChange: (id: string) => void;
  size?: "sm" | "md";
  surface?: "white" | "canvas";
  ariaLabel?: string;
  className?: string;
}

/**
 * Shared segmented control / tab switcher — the AGROLA house pattern,
 * extracted so every switcher (header subviews, in-card tabs) reads identically.
 * Accessible: exposes a tablist with aria-selected tabs and visible focus rings.
 */
export function SegmentedControl({
  items,
  value,
  onChange,
  size = "md",
  surface = "white",
  ariaLabel,
  className,
}: SegmentedControlProps) {
  const pad =
    size === "sm"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1.5 text-xs";

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={clsx(
        "inline-flex items-center rounded-lg border border-agrola-border p-1 shadow-subtle",
        surface === "white" ? "bg-white" : "bg-agrola-canvas",
        className
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={item.title ?? item.label}
            onClick={() => onChange(item.id)}
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-md font-semibold whitespace-nowrap transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agrola-forest/40 active:scale-[0.98]",
              pad,
              active
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-muted hover:text-agrola-ink hover:bg-agrola-canvas/70"
            )}
          >
            {item.icon && (
              <span className={clsx(active ? "text-agrola-lime" : "text-agrola-muted")}>
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
