import React from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  diffPercent?: number;
  diffPeriodLabel?: string;
  subtext?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function MetricCard({
  label,
  value,
  unit,
  diffPercent,
  diffPeriodLabel = "vs. Vorperiode",
  subtext,
  icon,
  highlight = false,
}: MetricCardProps) {
  const isPositive = diffPercent !== undefined && diffPercent > 0;
  const isNegative = diffPercent !== undefined && diffPercent < 0;
  const isZero = diffPercent !== undefined && Math.abs(diffPercent) < 0.01;

  return (
    <div
      className={clsx(
        "relative rounded-xl p-5 transition-all duration-200 border",
        highlight
          ? "bg-agrola-forest text-white border-agrola-forest shadow-md"
          : "bg-white text-agrola-ink border-agrola-border hover:border-[#CBD3CB] shadow-subtle"
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-wider",
            highlight ? "text-agrola-lime" : "text-agrola-muted"
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={clsx(
              "w-7 h-7 rounded-lg flex items-center justify-center text-sm",
              highlight
                ? "bg-white/10 text-agrola-lime"
                : "bg-agrola-canvas text-agrola-forest border border-agrola-border/60"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span
            className={clsx(
              "text-xs font-medium",
              highlight ? "text-white/70" : "text-agrola-muted"
            )}
          >
            {unit}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-black/5 dark:border-white/10 text-xs">
        {diffPercent !== undefined ? (
          <div className="flex items-center gap-1.5 font-medium tabular-nums">
            <span
              className={clsx(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-semibold",
                highlight
                  ? isPositive
                    ? "bg-agrola-lime/20 text-agrola-lime"
                    : isNegative
                    ? "bg-rose-500/20 text-rose-300"
                    : "text-white/60"
                  : isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  : isNegative
                  ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                  : "bg-slate-50 text-slate-600"
              )}
            >
              {isPositive && <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />}
              {isNegative && <ArrowDownRight className="w-3 h-3 stroke-[2.5]" />}
              {isZero && <Minus className="w-3 h-3" />}
              {isPositive ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`}
            </span>
            <span
              className={clsx(
                "text-[11px]",
                highlight ? "text-white/60" : "text-agrola-muted"
              )}
            >
              {diffPeriodLabel}
            </span>
          </div>
        ) : subtext ? (
          <span
            className={clsx(
              "text-[11px]",
              highlight ? "text-white/60" : "text-agrola-muted"
            )}
          >
            {subtext}
          </span>
        ) : null}
      </div>
    </div>
  );
}
