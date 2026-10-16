"use client";

import React from "react";
import { PerformanceException } from "@/types";
import { AlertTriangle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import clsx from "clsx";

interface PerformanceExceptionsProps {
  exceptions: PerformanceException[];
  onSelectStation?: (stationId: string) => void;
}

export function PerformanceExceptions({
  exceptions,
  onSelectStation,
}: PerformanceExceptionsProps) {
  if (!exceptions || exceptions.length === 0) return null;

  const severityIcons = {
    critical: <AlertCircle className="w-4 h-4 text-rose-600" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600" />,
    opportunity: <Sparkles className="w-4 h-4 text-emerald-600" />,
  };

  const severityStyles = {
    critical: "bg-rose-50/70 border-rose-200 text-rose-950",
    warning: "bg-amber-50/70 border-amber-200 text-amber-950",
    opportunity: "bg-emerald-50/70 border-emerald-200 text-emerald-950",
  };

  const badgeStyles = {
    critical: "bg-rose-100 text-rose-800 border-rose-300",
    warning: "bg-amber-100 text-amber-800 border-amber-300",
    opportunity: "bg-emerald-100 text-emerald-800 border-emerald-300",
  };

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle mb-6">
      <div className="flex items-center justify-between pb-3 border-b border-agrola-border mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-agrola-amber" />
          <h3 className="text-sm font-bold text-agrola-ink">
            Operative Ausnahmen & Anomalien (Disposition)
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
          {exceptions.length} Ereignisse detektiert
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {exceptions.map((exc) => (
          <div
            key={exc.id}
            onClick={() => onSelectStation && onSelectStation(exc.stationId)}
            className={clsx(
              "p-3 rounded-lg border flex flex-col justify-between transition-all cursor-pointer hover:shadow-xs",
              severityStyles[exc.severity]
            )}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span
                  className={clsx(
                    "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border",
                    badgeStyles[exc.severity]
                  )}
                >
                  {exc.badge}
                </span>
                <span className="text-[10px] font-mono font-bold">
                  {exc.impactMetric}: {exc.impactValue}
                </span>
              </div>

              <div className="font-bold text-xs text-agrola-ink mb-1 flex items-center gap-1.5">
                {severityIcons[exc.severity]}
                <span className="truncate">{exc.stationName}</span>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-700">
                {exc.description}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between text-[10px] font-semibold text-agrola-forest">
              <span>{exc.region}</span>
              <span className="flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                Prüfen <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
