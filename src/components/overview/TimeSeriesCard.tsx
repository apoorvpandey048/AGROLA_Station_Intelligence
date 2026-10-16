"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TimeSeriesPoint } from "@/types";
import { TrendingUp, Calendar, Info } from "lucide-react";
import clsx from "clsx";
import { fmtCH } from "@/lib/format";

interface TimeSeriesCardProps {
  data: TimeSeriesPoint[];
  periodLabel: string;
}

export function TimeSeriesCard({ data, periodLabel }: TimeSeriesCardProps) {
  const [metricKey, setMetricKey] = useState<"revenue" | "volume" | "grossMargin">("revenue");
  const [showPrevOverlay, setShowPrevOverlay] = useState<boolean>(true);

  // Formatting helpers
  const formatYAxis = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
    return val.toString();
  };

  const getMetricLabel = () => {
    if (metricKey === "revenue") return "Umsatz (CHF)";
    if (metricKey === "volume") return "Absatz (Liter)";
    return "Bruttomarge (CHF)";
  };

  const getPrevKey = () => {
    if (metricKey === "revenue") return "prevRevenue";
    if (metricKey === "volume") return "prevVolume";
    return "prevMargin";
  };

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle">
      {/* Card Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-agrola-forest" />
              <span>Absatz- & Umsatzentwicklung</span>
            </h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
              {periodLabel}
            </span>
          </div>
          <p className="text-xs text-agrola-muted mt-0.5">
            Zeitreihenverlauf mit direktem Vergleich zur unmittelbar vorangehenden Periode
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-0.5 text-xs">
            <button
              onClick={() => setMetricKey("revenue")}
              className={clsx(
                "px-2.5 py-1 rounded font-semibold transition-all",
                metricKey === "revenue"
                  ? "bg-agrola-forest text-white shadow-xs"
                  : "text-agrola-ink hover:text-agrola-forest"
              )}
            >
              Umsatz
            </button>
            <button
              onClick={() => setMetricKey("volume")}
              className={clsx(
                "px-2.5 py-1 rounded font-semibold transition-all",
                metricKey === "volume"
                  ? "bg-agrola-forest text-white shadow-xs"
                  : "text-agrola-ink hover:text-agrola-forest"
              )}
            >
              Absatz (L)
            </button>
            <button
              onClick={() => setMetricKey("grossMargin")}
              className={clsx(
                "px-2.5 py-1 rounded font-semibold transition-all",
                metricKey === "grossMargin"
                  ? "bg-agrola-forest text-white shadow-xs"
                  : "text-agrola-ink hover:text-agrola-forest"
              )}
            >
              Bruttomarge
            </button>
          </div>

          {/* Toggle Prior Period Overlay */}
          <button
            onClick={() => setShowPrevOverlay(!showPrevOverlay)}
            className={clsx(
              "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
              showPrevOverlay
                ? "bg-agrola-amber-light text-agrola-amber border-agrola-amber/50"
                : "bg-white text-agrola-muted border-agrola-border hover:bg-agrola-canvas"
            )}
          >
            Vorperiode {showPrevOverlay ? "ein" : "aus"}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#173D30" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#173D30" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#DDE3DC" }}
              tick={{ fill: "#7E9088", fontSize: 11, fontFamily: "var(--font-mono)" }}
              interval="preserveStartEnd"
              minTickGap={24}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#7E9088", fontSize: 11, fontFamily: "var(--font-mono)" }}
              tickFormatter={formatYAxis}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const curVal = payload.find((p) => p.dataKey === metricKey)?.value as number;
                const prevVal = payload.find((p) => p.dataKey === getPrevKey())?.value as number;
                const point = payload[0]?.payload as TimeSeriesPoint;

                const diff =
                  prevVal !== undefined && prevVal > 0
                    ? ((curVal - prevVal) / prevVal) * 100
                    : null;

                return (
                  <div className="bg-agrola-forest text-white rounded-xl p-3 shadow-xl border border-white/10 font-sans text-xs min-w-[190px]">
                    <div className="font-bold text-white border-b border-white/15 pb-1.5 mb-2 flex items-center justify-between">
                      <span>{label}</span>
                      <span className="text-[10px] text-agrola-lime font-mono">
                        {point.date}
                      </span>
                    </div>

                    <div className="space-y-1 font-mono">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Aktuell:</span>
                        <span className="font-bold text-white">
                          {metricKey === "volume"
                            ? `${fmtCH(curVal ?? 0)} L`
                            : `CHF ${fmtCH(curVal ?? 0)}`}
                        </span>
                      </div>

                      {showPrevOverlay && prevVal !== undefined && (
                        <div className="flex justify-between items-center text-agrola-amber">
                          <span className="text-white/70">Vorperiode:</span>
                          <span>
                            {metricKey === "volume"
                              ? `${fmtCH(prevVal ?? 0)} L`
                              : `CHF ${fmtCH(prevVal ?? 0)}`}
                          </span>
                        </div>
                      )}

                      {diff !== null && (
                        <div className="flex justify-between items-center pt-1 border-t border-white/10 text-[11px]">
                          <span className="text-white/70">Veränderung:</span>
                          <span
                            className={clsx(
                              "font-bold",
                              diff >= 0 ? "text-agrola-lime" : "text-rose-300"
                            )}
                          >
                            {diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-white/60 pt-1">
                        <span>Ø Preis:</span>
                        <span>CHF {point.avgPrice.toFixed(3)} / L</span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />

            {/* Current period area */}
            <Area
              type="monotone"
              dataKey={metricKey}
              stroke="#173D30"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMetric)"
              name="Aktuelle Periode"
            />

            {/* Prior period overlay dashed line */}
            {showPrevOverlay && (
              <Line
                type="monotone"
                dataKey={getPrevKey()}
                stroke="#D9822B"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
                name="Vorperiode"
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend Footer */}
      <div className="mt-3 pt-3 border-t border-agrola-border flex items-center justify-between text-xs text-agrola-muted flex-wrap gap-2">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 bg-agrola-forest rounded-full"></span>
            <span className="font-medium text-agrola-ink">{getMetricLabel()} (Aktuell)</span>
          </div>
          {showPrevOverlay && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-agrola-amber"></span>
              <span className="font-medium text-agrola-amber">Gleiche Periode im Vorabschnitt</span>
            </div>
          )}
        </div>

        <div className="text-[11px] font-mono text-agrola-muted">
          Datenpunkte: {data.length} Tage
        </div>
      </div>
    </div>
  );
}
