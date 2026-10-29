"use client";

import React, { useState } from "react";
import {
  ForecastPoint,
  ForecastScenarioConfig,
  TimeSeriesPoint,
} from "@/types";
import { computeScenarioForecast } from "@/lib/analytics/calculations";
import {
  Sliders,
  TrendingUp,
  Info,
  DollarSign,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Percent,
  CheckCircle2,
  Table,
} from "lucide-react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { fmtCH } from "@/lib/format";

interface ForecastScenarioViewProps {
  timeSeries: TimeSeriesPoint[];
  activeSubview?: string;
  currentAvgPrice: number;
  currentAvgCost: number;
  layoutMode?: "kpi-first" | "plots-first";
}

export function ForecastScenarioView({
  timeSeries,
  activeSubview = "simulation",
  currentAvgPrice,
  currentAvgCost,
  layoutMode = "kpi-first",
}: ForecastScenarioViewProps) {
  const [horizonDays, setHorizonDays] = useState<30 | 60 | 90>(60);
  const [priceDelta, setPriceDelta] = useState<number>(0.02); // +2 Rappen / L
  const [elasticity, setElasticity] = useState<number>(-0.35); // -0.35 standard fuel elasticity

  const scenarioConfig: ForecastScenarioConfig = {
    horizonDays,
    priceDeltaPerLiter: priceDelta,
    costDeltaPerLiter: 0,
    elasticityCoefficient: elasticity,
    scenarioType: "baseline",
  };

  const { projectedPoints, summary } = computeScenarioForecast(
    timeSeries,
    scenarioConfig,
    currentAvgPrice,
    currentAvgCost
  );

  // Take recent 25 historical daily points
  const recentHistory = timeSeries.slice(-25);
  const lastHistoryPoint = recentHistory[recentHistory.length - 1];

  // Construct continuous chartData for ComposedChart with explicit nulls (not undefined) so Recharts connects lines seamlessly
  const historyData = recentHistory.map((h, i) => {
    const isBridge = i === recentHistory.length - 1;
    return {
      date: h.date,
      label: h.label,
      isProjected: false,
      historicalRevenue: h.revenue,
      // At bridge point, seed projection lines so they connect without gaps
      baselineRevenue: isBridge ? h.revenue : null,
      scenarioRevenue: isBridge ? h.revenue : null,
      upsideRevenue: isBridge ? h.revenue : null,
      downsideRevenue: isBridge ? h.revenue : null,
    };
  });

  const projectionData = projectedPoints.map((p) => ({
    date: p.date,
    label: p.label,
    isProjected: true,
    historicalRevenue: null,
    baselineRevenue: p.baselineRevenue,
    scenarioRevenue: p.scenarioRevenue,
    upsideRevenue: p.upsideRevenue,
    downsideRevenue: p.downsideRevenue,
  }));

  const chartData = [...historyData, ...projectionData];

  // Sensitivity Matrix across price increments (-0.06 to +0.06 CHF)
  const sensitivitySteps = [-0.06, -0.04, -0.02, 0.0, 0.02, 0.04, 0.06];
  const sensitivityRows = sensitivitySteps.map((delta) => {
    const res = computeScenarioForecast(
      timeSeries,
      { ...scenarioConfig, priceDeltaPerLiter: delta },
      currentAvgPrice,
      currentAvgCost
    );
    return {
      delta,
      label: delta === 0 ? "Status Quo (0.00)" : delta > 0 ? `+${delta.toFixed(2)} CHF` : `${delta.toFixed(2)} CHF`,
      isCurrent: Math.abs(delta - priceDelta) < 0.005,
      volumeDeltaPct: res.summary.volumeDeltaPct,
      revenueDelta: res.summary.revenueDelta,
      marginDelta: res.summary.marginDelta,
      projectedMargin: res.summary.scenarioProjectedMargin,
    };
  });

  const projectionChartSection = (
    <div key="chart" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle h-full flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 shrink-0">
        <div>
          <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-agrola-forest" />
            <span>Historischer Verlauf vs. Prädiktive Projektion (Tagesumsatz CHF)</span>
          </h3>
          <p className="text-xs text-agrola-muted mt-0.5">
            Historische Beobachtungen (grün) im nahtlosen Übergang zu Baseline (grau gestrichelt), Preisszenario (amber) und Unsicherheitskorridor
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-agrola-canvas text-agrola-forest text-xs font-mono font-semibold border border-agrola-border">
            <span className="w-2 h-2 rounded-full bg-agrola-lime inline-block"></span>
            {horizonDays} Tage Projektion
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />

            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#DDE3DC" }}
              tick={{ fontSize: 10, fill: "#7E9088", fontFamily: "var(--font-mono)" }}
              minTickGap={26}
            />

            <YAxis
              domain={["auto", "auto"]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#7E9088", fontFamily: "var(--font-mono)" }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0]?.payload;
                return (
                  <div className="bg-agrola-forest text-white rounded-xl p-3.5 shadow-xl border border-white/10 font-sans text-xs min-w-[220px]">
                    <div className="font-bold border-b border-white/15 pb-1 mb-2 flex items-center justify-between">
                      <span>{label}</span>
                      <span
                        className={clsx(
                          "text-[10px] font-mono px-1.5 py-0.2 rounded font-bold",
                          item.isProjected
                            ? "bg-agrola-lime text-agrola-forest"
                            : "bg-white/15 text-white"
                        )}
                      >
                        {item.isProjected ? "PROGNOSE" : "BEOBACHTUNG"}
                      </span>
                    </div>

                    <div className="space-y-1.5 font-mono text-[11px]">
                      {item.historicalRevenue !== null && (
                        <div className="flex justify-between">
                          <span className="text-white/70">Realer Umsatz:</span>
                          <span className="font-bold text-white">
                            CHF {fmtCH(item.historicalRevenue)}
                          </span>
                        </div>
                      )}
                      {item.scenarioRevenue !== null && (
                        <div className="flex justify-between text-agrola-amber font-bold">
                          <span>Szenario-Umsatz:</span>
                          <span>CHF {fmtCH(item.scenarioRevenue)}</span>
                        </div>
                      )}
                      {item.baselineRevenue !== null && (
                        <div className="flex justify-between text-white/80">
                          <span>Baseline (Status Quo):</span>
                          <span>CHF {fmtCH(item.baselineRevenue)}</span>
                        </div>
                      )}
                      {item.upsideRevenue !== null && (
                        <div className="flex justify-between text-emerald-300 text-[10px] pt-1 border-t border-white/10">
                          <span>Korridor Max (+6%):</span>
                          <span>CHF {fmtCH(item.upsideRevenue)}</span>
                        </div>
                      )}
                      {item.downsideRevenue !== null && (
                        <div className="flex justify-between text-rose-300 text-[10px]">
                          <span>Korridor Min (-6%):</span>
                          <span>CHF {fmtCH(item.downsideRevenue)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />

            {/* Shaded Corridor Area */}
            <Area
              type="monotone"
              dataKey="upsideRevenue"
              stroke="#B8D96B"
              strokeDasharray="3 3"
              fill="#B8D96B"
              fillOpacity={0.16}
              connectNulls={false}
              name="Szenario-Korridor"
            />

            {/* Baseline Scenario (Status Quo) */}
            <Line
              type="monotone"
              dataKey="baselineRevenue"
              name="Baseline Projektion (Status Quo)"
              stroke="#7E9088"
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />

            {/* Active Pricing Scenario */}
            <Line
              type="monotone"
              dataKey="scenarioRevenue"
              name="Preissimulation (Aktiv)"
              stroke="#D9822B"
              strokeWidth={3}
              dot={false}
              connectNulls={false}
            />

            {/* Observed History */}
            <Line
              type="monotone"
              dataKey="historicalRevenue"
              name="Beobachtete Historie"
              stroke="#173D30"
              strokeWidth={3}
              dot={{ r: 2.5, fill: "#173D30" }}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const controlsAndImpactSection = (
    <div key="controls" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-agrola-border">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-agrola-forest" />
            <h2 className="text-xl sm:text-2xl font-bold text-agrola-ink">
              Prädiktive Disposition & Preisszenarien
            </h2>
          </div>
          <p className="text-xs text-agrola-muted mt-1 max-w-2xl">
            Entscheidungsunterstützung zur Bewertung von Preiselastizität, Absatzreaktionen und Deckungsbeitragsveränderungen im Schweizer Markt.
          </p>
        </div>

        {/* Horizon Selector */}
        <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-1 text-xs">
          {([30, 60, 90] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizonDays(h)}
              className={clsx(
                "px-3 py-1.5 rounded-md font-semibold transition-all",
                horizonDays === h
                  ? "bg-agrola-forest text-white shadow-xs"
                  : "text-agrola-ink hover:text-agrola-forest hover:bg-white/60"
              )}
            >
              +{h} Tage Horizont
            </button>
          ))}
        </div>
      </div>

      {/* 2. Interactive Simulator Controls & Real-time Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-5">
        {/* Slider: Price Change */}
        <div className="p-4 rounded-xl bg-agrola-canvas/60 border border-agrola-border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-agrola-ink">
              Preisanpassung (Δ CHF / L)
            </label>
            <span className="font-mono text-sm font-bold text-agrola-forest bg-white px-2 py-0.5 rounded border border-agrola-border">
              {priceDelta > 0 ? `+${priceDelta.toFixed(2)}` : priceDelta.toFixed(2)} CHF
            </span>
          </div>
          <p className="text-[11px] text-agrola-muted mb-3">
            Veränderung des durchschnittlichen Netzwerk-Abgabepreises
          </p>
          <input
            type="range"
            min="-0.08"
            max="0.08"
            step="0.01"
            value={priceDelta}
            onChange={(e) => setPriceDelta(parseFloat(e.target.value))}
            className="w-full accent-agrola-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-agrola-muted font-mono mt-1">
            <span>-0.08 CHF (Aktion)</span>
            <span>0.00</span>
            <span>+0.08 CHF (Prämie)</span>
          </div>
        </div>

        {/* Slider: Price Elasticity Assumption */}
        <div className="p-4 rounded-xl bg-agrola-canvas/60 border border-agrola-border">
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold text-agrola-ink">
              Preiselastizität (ε)
            </label>
            <span className="font-mono text-sm font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-agrola-border">
              {elasticity.toFixed(2)}
            </span>
          </div>
          <p className="text-[11px] text-agrola-muted mb-3">
            Schweizer Pendlerstandard: ca. -0.35 (moderat unelastisch)
          </p>
          <input
            type="range"
            min="-0.70"
            max="-0.10"
            step="0.05"
            value={elasticity}
            onChange={(e) => setElasticity(parseFloat(e.target.value))}
            className="w-full accent-agrola-forest cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-agrola-muted font-mono mt-1">
            <span>-0.70 (Preissensibel)</span>
            <span>-0.35 (Basis)</span>
            <span>-0.10 (Starr)</span>
          </div>
        </div>

        {/* Calculated Impact Card */}
        <div className="p-4 rounded-xl bg-[#EAF2EB] border border-[#CDE5D1] flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
              Erwarteter Nettoeffekt ({horizonDays} Tage)
            </span>
            <div className="mt-2 space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-900/80">Umsatzeffekt:</span>
                <span className={clsx("font-bold text-sm", summary.revenueDelta >= 0 ? "text-emerald-800" : "text-rose-700")}>
                  {`${summary.revenueDelta >= 0 ? "+" : ""}CHF ${(summary.revenueDelta / 1000).toFixed(1)}k`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-900/80">Margeneffekt (DB I):</span>
                <span className={clsx("font-bold text-sm", summary.marginDelta >= 0 ? "text-emerald-800" : "text-rose-700")}>
                  {`${summary.marginDelta >= 0 ? "+" : ""}CHF ${(summary.marginDelta / 1000).toFixed(1)}k`}
                </span>
              </div>
              <div className="flex justify-between text-[11px] pt-1 border-t border-emerald-300/60">
                <span className="text-emerald-900/80">Volumenreaktion:</span>
                <span className="font-semibold text-emerald-900">
                  {`${summary.volumeDeltaPct >= 0 ? "+" : ""}${summary.volumeDeltaPct}% Absatzmenge`}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-emerald-900/70 mt-2 font-sans italic">
            Formel: ΔV% = ε · (ΔP / P_Basis)
          </div>
        </div>
      </div>
    </div>
  );

  const sensitivitySection = (
    <div key="sensitivity" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
      <div className="flex items-center justify-between pb-3 border-b border-agrola-border mb-4">
        <div>
          <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
            <Table className="w-4 h-4 text-agrola-forest" />
            <span>Sensitivitätsmatrix für Preisanpassungen ({horizonDays} Tage)</span>
          </h3>
          <p className="text-xs text-agrola-muted mt-0.5">
            Direktvergleich möglicher Preisschritte von -0.06 bis +0.06 CHF/L bei Elastizität {elasticity.toFixed(2)}
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-forest font-semibold border border-agrola-border">
          Entscheidungsmatrix
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-agrola-border text-left text-agrola-muted uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-semibold">Preisschritt</th>
              <th className="pb-2.5 font-semibold text-right">Volumeneffekt (%)</th>
              <th className="pb-2.5 font-semibold text-right">Umsatzeffekt (CHF)</th>
              <th className="pb-2.5 font-semibold text-right">Margeneffekt (CHF)</th>
              <th className="pb-2.5 font-semibold text-right">Erwartete Bruttomarge</th>
              <th className="pb-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-agrola-border/50 text-agrola-ink">
            {sensitivityRows.map((row) => (
              <tr
                key={row.delta}
                className={clsx(
                  "transition-colors",
                  row.isCurrent ? "bg-[#F3F7F2] font-bold" : "hover:bg-agrola-canvas/40"
                )}
              >
                <td className="py-2.5 font-sans">
                  <span className="font-bold">{row.label}</span>
                </td>
                <td className="py-2.5 text-right font-semibold">
                  <span className={row.volumeDeltaPct >= 0 ? "text-emerald-700" : "text-rose-700"}>
                    {`${row.volumeDeltaPct >= 0 ? "+" : ""}${row.volumeDeltaPct.toFixed(1)}%`}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span className={row.revenueDelta >= 0 ? "text-emerald-700 font-bold" : "text-rose-700"}>
                    {`${row.revenueDelta >= 0 ? "+" : ""}CHF ${(row.revenueDelta / 1000).toFixed(1)}k`}
                  </span>
                </td>
                <td className="py-2.5 text-right">
                  <span className={row.marginDelta >= 0 ? "text-emerald-700 font-bold" : "text-rose-700"}>
                    {`${row.marginDelta >= 0 ? "+" : ""}CHF ${(row.marginDelta / 1000).toFixed(1)}k`}
                  </span>
                </td>
                <td className="py-2.5 text-right font-bold text-agrola-forest">
                  CHF {(row.projectedMargin / 1000).toFixed(0)}k
                </td>
                <td className="py-2.5 text-center">
                  {row.isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-agrola-amber-light text-agrola-amber font-semibold border border-agrola-amber/40">
                      Aktiv gewählt
                    </span>
                  ) : (
                    <button
                      onClick={() => setPriceDelta(row.delta)}
                      className="text-[10px] px-2 py-0.5 rounded bg-agrola-canvas hover:bg-white text-agrola-forest font-semibold border border-agrola-border transition-colors"
                    >
                      Simulieren
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transparent Compliance Disclosure */}
      <div className="mt-4 p-3.5 rounded-lg bg-agrola-canvas border border-agrola-border text-[11px] text-agrola-muted leading-relaxed flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-agrola-forest shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-agrola-ink">Transparenz-Hinweis & Methodik:</span>{" "}
          Diese Projektion dient als konzeptionelle Entscheidungsunterstützung (Decision Support Prototype). Berechnungen basieren auf transparenten saisonalen Baselines und parametrisierter Preiselastizität. Es handelt sich um ein deterministisches Simulationsmodell, nicht um ein operativ kalibriertes Produktions-KI-System.
        </div>
      </div>
    </div>
  );

  let content: React.ReactNode;
  if (activeSubview === "sensitivitaet") {
    content = (
      <div className="h-full min-h-0 overflow-y-auto pr-0.5">{sensitivitySection}</div>
    );
  } else {
    // simulation: coupled controls + live projection chart (chart fills the viewport)
    content = (
      <div className="h-full flex flex-col gap-4 min-h-0">
        {layoutMode === "plots-first" ? (
          <>
            <div className="flex-1 min-h-0">{projectionChartSection}</div>
            <div className="shrink-0">{controlsAndImpactSection}</div>
          </>
        ) : (
          <>
            <div className="shrink-0">{controlsAndImpactSection}</div>
            <div className="flex-1 min-h-0">{projectionChartSection}</div>
          </>
        )}
      </div>
    );
  }

  return (
    <div key={activeSubview} className="animate-subview h-full min-h-0">
      {content}
    </div>
  );
}
