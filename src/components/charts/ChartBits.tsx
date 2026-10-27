"use client";

import React from "react";

/**
 * Shared Recharts building blocks so every chart in the cockpit reads as one
 * system: consistent axis/grid styling, vertical gradient bar fills, and a
 * single dark-forest tooltip card.
 */

export const CHART_GRID_STROKE = "#EBEFE9";
export const CHART_AXIS_FILL = "#7E9088";

export const axisTick = {
  fontSize: 11,
  fill: CHART_AXIS_FILL,
  fontFamily: "var(--font-mono)",
} as const;

export const BAR_RADIUS: [number, number, number, number] = [5, 5, 0, 0];

/** A vertical top→bottom gradient for bars, referenced via url(#id). */
export function BarGradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={color} stopOpacity={0.95} />
      <stop offset="100%" stopColor={color} stopOpacity={0.62} />
    </linearGradient>
  );
}

interface TooltipRow {
  label: string;
  value: React.ReactNode;
  className?: string;
}

/** Dark-forest tooltip card matching the area/line chart tooltips. */
export function TooltipCard({
  title,
  badge,
  rows,
}: {
  title: React.ReactNode;
  badge?: React.ReactNode;
  rows: TooltipRow[];
}) {
  return (
    <div className="bg-agrola-forest text-white rounded-xl p-3 shadow-elevated border border-white/10 font-sans text-xs min-w-[200px]">
      <div className="font-bold border-b border-white/15 pb-1 mb-2 flex items-center justify-between gap-2">
        <span className="truncate">{title}</span>
        {badge}
      </div>
      <div className="space-y-1 font-mono text-[11px]">
        {rows.map((r, i) => (
          <div key={i} className={`flex justify-between ${r.className ?? ""}`}>
            <span className="text-white/70">{r.label}</span>
            <span className="font-semibold">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
