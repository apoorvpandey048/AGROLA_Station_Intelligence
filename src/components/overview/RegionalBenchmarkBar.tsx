"use client";

import React from "react";
import { RegionalBenchmark } from "@/types";
import { Globe2 } from "lucide-react";

interface RegionalBenchmarkBarProps {
  benchmarks: RegionalBenchmark[];
  onSelectRegion?: (region: string) => void;
  activeRegion?: string;
}

export function RegionalBenchmarkBar({
  benchmarks,
  onSelectRegion,
  activeRegion,
}: RegionalBenchmarkBarProps) {
  const maxRevenue = Math.max(...benchmarks.map((b) => b.totalRevenue), 1);

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle">
      <div className="flex items-center justify-between pb-3 border-b border-agrola-border mb-4">
        <div>
          <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-agrola-forest" />
            <span>Regionale Wirtschaftsräume Schweiz</span>
          </h3>
          <p className="text-xs text-agrola-muted mt-0.5">
            Vergleich der 6 Schweizer Großregionen nach Absatz, Umsatzanteil und Ø Margenquote
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
          6 Regionen
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {benchmarks.map((reg) => {
          const isSelected = activeRegion === reg.region;
          const barWidth = (reg.totalRevenue / maxRevenue) * 100;

          return (
            <div
              key={reg.region}
              onClick={() => onSelectRegion && onSelectRegion(reg.region)}
              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F3F7F2] border-agrola-forest shadow-xs ring-1 ring-agrola-forest"
                  : "bg-agrola-canvas/50 border-agrola-border/80 hover:bg-agrola-canvas hover:border-agrola-border"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-agrola-ink">
                  {reg.region}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-agrola-border text-agrola-forest font-semibold">
                  {reg.stationCount} {reg.stationCount === 1 ? "Station" : "Stationen"}
                </span>
              </div>

              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-agrola-muted">Umsatz:</span>
                  <span className="font-bold text-agrola-ink">
                    CHF {(reg.totalRevenue / 1000).toFixed(0)}k
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-agrola-muted">Netzwerkanteil:</span>
                  <span className="text-agrola-forest font-semibold">
                    {reg.shareOfNetworkRevenue.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-agrola-muted">Ø Verkaufspreis:</span>
                  <span className="text-agrola-ink">
                    CHF {reg.avgRetailPrice.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-agrola-muted">Ø Bruttomarge:</span>
                  <span className="font-semibold text-emerald-700">
                    {reg.avgMarginPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Volume Share Bar */}
              <div className="w-full bg-[#E4EAE3] h-1.5 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-agrola-forest rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
