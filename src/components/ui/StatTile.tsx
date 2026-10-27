import React from "react";
import clsx from "clsx";

type Tone = "default" | "emerald";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: Tone;
  size?: "sm" | "md";
  valueClassName?: string;
  className?: string;
}

const TONES: Record<Tone, { box: string; label: string }> = {
  default: {
    box: "bg-agrola-canvas/60 border-agrola-border",
    label: "text-agrola-muted",
  },
  emerald: {
    box: "bg-emerald-50/60 border-emerald-200",
    label: "text-emerald-800",
  },
};

/** Compact KPI/stat box reused across pricing and station analytics. */
export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  size = "md",
  valueClassName,
  className,
}: StatTileProps) {
  const t = TONES[tone];
  return (
    <div className={clsx("p-4 rounded-lg border", t.box, className)}>
      <span
        className={clsx(
          "text-[10px] uppercase font-bold tracking-wider block",
          t.label
        )}
      >
        {label}
      </span>
      <div
        className={clsx(
          "font-bold font-mono mt-0.5",
          size === "sm" ? "text-xl" : "text-2xl",
          valueClassName ?? "text-agrola-ink"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-[11px] mt-1 text-agrola-muted">{sub}</div>}
    </div>
  );
}
