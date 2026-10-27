"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics } from "@/types";
import { Trophy, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { fmtCH } from "@/lib/format";
import { SegmentedControl } from "@/components/ui/SegmentedControl";

interface RankingPanelProps {
  rankings: AggregatedStationMetrics[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onGoToAnalytics?: (stationId: string) => void;
}

export function RankingPanel({
  rankings,
  selectedStationId,
  onSelectStation,
  onGoToAnalytics,
}: RankingPanelProps) {
  const [tab, setTab] = useState<"top" | "bottom" | "margin">("top");

  // Top by revenue
  const topList = [...rankings].slice(0, 7);
  // Bottom by revenue / Optimization potential
  // We sort by revenue ascending to highlight stations with lowest volume/revenue needing uplift
  const potentialList = [...rankings]
    .sort((a, b) => a.totalRevenue - b.totalRevenue)
    .slice(0, 7);
  // Top by margin %
  const marginList = [...rankings]
    .sort((a, b) => b.avgMarginPercent - a.avgMarginPercent)
    .slice(0, 7);

  const currentList =
    tab === "top" ? topList : tab === "bottom" ? potentialList : marginList;

  const maxRevenue = Math.max(...rankings.map((r) => r.totalRevenue), 1);
  const maxMargin = Math.max(...rankings.map((r) => r.avgMarginPercent), 1);

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle flex flex-col h-full min-w-0">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-agrola-border mb-3">
        <div>
          <h3 className="text-sm font-bold text-agrola-ink flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-agrola-amber" />
            <span>Standort-Rankings</span>
          </h3>
          <p className="text-[11px] text-agrola-muted">
            Klicken zur Selektion auf der Schweizer Karte
          </p>
        </div>

        <SegmentedControl
          size="sm"
          surface="canvas"
          ariaLabel="Ranking-Kriterium"
          className="shrink-0 self-start sm:self-auto"
          value={tab}
          onChange={(id) => setTab(id as "top" | "bottom" | "margin")}
          items={[
            { id: "top", label: "Top Umsatz" },
            { id: "margin", label: "Beste Marge" },
            { id: "bottom", label: "Potenzial" },
          ]}
        />
      </div>

      {/* List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
        {currentList.map((item, idx) => {
          const isSelected = item.station.id === selectedStationId;
          const barWidth =
            tab === "margin"
              ? Math.min(100, Math.max(8, (item.avgMarginPercent / maxMargin) * 100))
              : Math.min(100, Math.max(8, (item.totalRevenue / maxRevenue) * 100));

          return (
            <div
              key={item.station.id}
              onClick={() => onSelectStation(item.station.id)}
              className={clsx(
                "group p-3 rounded-lg border transition-all cursor-pointer flex flex-col justify-between w-full",
                isSelected
                  ? "bg-[#F3F7F2] border-agrola-forest shadow-xs ring-1 ring-agrola-forest/40"
                  : "bg-white border-agrola-border/70 hover:border-agrola-border hover:bg-agrola-canvas/50"
              )}
            >
              {/* Row 1: Rank, Name, Canton, Primary Value, Secondary Volume */}
              <div className="flex items-center justify-between gap-2 w-full min-w-0">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className={clsx(
                      "font-mono text-[11px] font-bold w-5 shrink-0 text-center",
                      isSelected ? "text-agrola-forest" : "text-agrola-muted"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-agrola-ink text-xs block truncate" title={item.station.name}>
                      {item.station.name}
                    </span>
                    <span className="text-[10px] text-agrola-muted font-mono block">
                      Kanton {item.station.canton} · {item.station.type}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-bold font-mono text-agrola-ink text-xs block">
                    {tab === "margin"
                      ? `${item.avgMarginPercent.toFixed(1)}%`
                      : `CHF ${(item.totalRevenue / 1000).toFixed(0)}k`}
                  </span>
                  <span className="text-[10px] text-agrola-muted block font-mono">
                    {fmtCH(item.totalVolume)} L
                  </span>
                </div>
              </div>

              {/* Row 2: Standardized progress bar inside card bounds */}
              <div className="w-full mt-2 pt-1.5 border-t border-agrola-border/40">
                <div className="w-full bg-[#EAEFEA] h-2 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full transition-all duration-500",
                      isSelected
                        ? "bg-agrola-amber"
                        : tab === "margin"
                        ? "bg-emerald-600"
                        : tab === "bottom"
                        ? "bg-slate-600"
                        : "bg-agrola-forest"
                    )}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onGoToAnalytics && selectedStationId && (
        <button
          onClick={() => onGoToAnalytics(selectedStationId)}
          className="mt-3 w-full py-2 bg-agrola-canvas hover:bg-white text-agrola-forest font-semibold text-xs rounded-lg border border-agrola-border flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer active:scale-[0.99]"
        >
          <span>Standortvergleich & Deep Dive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
