"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics } from "@/types";
import { Trophy, TrendingDown, ArrowRight } from "lucide-react";
import clsx from "clsx";
import { fmtCH } from "@/lib/format";

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
  // Bottom by revenue
  const bottomList = [...rankings].reverse().slice(0, 7);
  // Top by margin %
  const marginList = [...rankings]
    .sort((a, b) => b.avgMarginPercent - a.avgMarginPercent)
    .slice(0, 7);

  const currentList =
    tab === "top" ? topList : tab === "bottom" ? bottomList : marginList;

  const maxRevenue = Math.max(...rankings.map((r) => r.totalRevenue), 1);
  const maxMargin = Math.max(...rankings.map((r) => r.avgMarginPercent), 1);

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle flex flex-col h-full">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-agrola-border mb-3">
        <div>
          <h3 className="text-sm font-bold text-agrola-ink flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-agrola-amber" />
            <span>Standort-Rankings</span>
          </h3>
          <p className="text-[11px] text-agrola-muted">
            Klicken zur Selektion auf der Schweizer Karte
          </p>
        </div>

        <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-0.5 text-[11px]">
          <button
            onClick={() => setTab("top")}
            className={clsx(
              "px-2 py-1 rounded font-semibold transition-all",
              tab === "top"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-muted hover:text-agrola-ink"
            )}
          >
            Top Umsatz
          </button>
          <button
            onClick={() => setTab("margin")}
            className={clsx(
              "px-2 py-1 rounded font-semibold transition-all",
              tab === "margin"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-muted hover:text-agrola-ink"
            )}
          >
            Beste Marge
          </button>
          <button
            onClick={() => setTab("bottom")}
            className={clsx(
              "px-2 py-1 rounded font-semibold transition-all",
              tab === "bottom"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-muted hover:text-agrola-ink"
            )}
          >
            Potenzial
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {currentList.map((item, idx) => {
          const isSelected = item.station.id === selectedStationId;
          const barWidth =
            tab === "margin"
              ? (item.avgMarginPercent / maxMargin) * 100
              : (item.totalRevenue / maxRevenue) * 100;

          return (
            <div
              key={item.station.id}
              onClick={() => onSelectStation(item.station.id)}
              className={clsx(
                "group p-2.5 rounded-lg border transition-all cursor-pointer",
                isSelected
                  ? "bg-[#F3F7F2] border-agrola-forest shadow-xs ring-1 ring-agrola-forest/30"
                  : "bg-white border-agrola-border/70 hover:border-agrola-border hover:bg-agrola-canvas/50"
              )}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "font-mono text-[10px] font-bold w-4 text-center",
                      isSelected ? "text-agrola-forest" : "text-agrola-muted"
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-agrola-ink truncate max-w-[150px]">
                    {item.station.name}
                  </span>
                  <span className="text-[10px] text-agrola-muted font-mono">
                    ({item.station.canton})
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold font-mono text-agrola-ink">
                    {tab === "margin"
                      ? `${item.avgMarginPercent.toFixed(1)}%`
                      : `CHF ${(item.totalRevenue / 1000).toFixed(0)}k`}
                  </span>
                  <span className="text-[10px] text-agrola-muted block font-mono">
                    {fmtCH(item.totalVolume)} L
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full bg-[#EAEFEA] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    isSelected
                      ? "bg-agrola-amber"
                      : tab === "margin"
                      ? "bg-emerald-600"
                      : "bg-agrola-forest"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {onGoToAnalytics && selectedStationId && (
        <button
          onClick={() => onGoToAnalytics(selectedStationId)}
          className="mt-3 w-full py-2 bg-agrola-canvas hover:bg-white text-agrola-forest font-semibold text-xs rounded-lg border border-agrola-border flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Standortvergleich & Deep Dive</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
