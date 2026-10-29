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
  // Tighter padding and a single-line value, for rows that share the screen with a map.
  compact?: boolean;
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
  compact = false,
}: MetricCardProps) {
  const isPositive = diffPercent !== undefined && diffPercent > 0;
  const isNegative = diffPercent !== undefined && diffPercent < 0;
  const isZero = diffPercent !== undefined && Math.abs(diffPercent) < 0.01;

  return (
    <div
      className={clsx(
        "relative rounded-xl transition-all duration-200 border",
        compact ? "px-3.5 py-3" : "p-4",
        highlight
          ? "bg-agrola-forest text-white border-agrola-forest shadow-md"
          : "bg-white text-agrola-ink border-agrola-border hover:border-[#CBD3CB] shadow-subtle"
      )}
    >
      <div className={clsx("flex items-center justify-between gap-2", !compact && "mb-2")}>
        <span
          title={compact ? label : undefined}
          className={clsx(
            "text-[11px] font-semibold uppercase tracking-wider",
            compact && "truncate",
            highlight ? "text-agrola-lime" : "text-agrola-muted"
          )}
        >
          {label}
        </span>
        {icon && (
          <div
            className={clsx(
              "rounded-lg flex items-center justify-center text-sm shrink-0",
              compact ? "w-6 h-6" : "w-7 h-7",
              highlight
                ? "bg-white/10 text-agrola-lime"
                : "bg-agrola-canvas text-agrola-forest border border-agrola-border/60"
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className={clsx("flex items-baseline gap-2", compact ? "mt-0.5" : "my-1")}>
        <span
          className={clsx(
            "font-bold tracking-tight tabular-nums",
            compact ? "text-xl whitespace-nowrap" : "text-xl sm:text-2xl"
          )}
        >
          {value}
        </span>
        {unit && (
          <span
            className={clsx(
              "text-xs font-medium",
              compact && "whitespace-nowrap",
              highlight ? "text-white/70" : "text-agrola-muted"
            )}
          >
            {unit}
          </span>
        )}
      </div>

      <div
        className={clsx(
          "flex items-center justify-between text-xs",
          compact ? "mt-1" : "mt-2 pt-2 border-t border-black/5 dark:border-white/10"
        )}
      >
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
