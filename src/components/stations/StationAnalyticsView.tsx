"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics, DailyRecord, Station } from "@/types";
import { STATIONS } from "@/lib/data/stations";
import {
  Building2,
  MapPin,
  TrendingUp,
  Fuel,
  Percent,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Store,
  Car,
  Zap,
  Layers,
  CheckCircle2,
  X,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { fmtCH } from "@/lib/format";
import { BarGradient, BAR_RADIUS } from "@/components/charts/ChartBits";

interface StationAnalyticsViewProps {
  rankings: AggregatedStationMetrics[];
  selectedStationId: string;
  activeSubview?: string;
  onSelectStation: (stationId: string) => void;
  periodLabel: string;
  onBack?: () => void;
  layoutMode?: "kpi-first" | "plots-first";
}

export function StationAnalyticsView({
  rankings,
  selectedStationId,
  activeSubview = "profil",
  onSelectStation,
  periodLabel,
  onBack,
  layoutMode = "kpi-first",
}: StationAnalyticsViewProps) {
  // Compare station IDs (up to 3 stations), synced when selectedStationId changes
  const [compareIds, setCompareIds] = useState<string[]>([selectedStationId]);

  // Keep primary station synced with selectedStationId prop
  React.useEffect(() => {
    setCompareIds((prev) => {
      if (prev.includes(selectedStationId)) return prev;
      return [selectedStationId, ...prev.slice(0, 2)];
    });
  }, [selectedStationId]);

  const activeMetric =
    rankings.find((r) => r.station.id === selectedStationId) || rankings[0];

  // Calculate actual network rank (1-indexed) based on revenue
  const revenueRank = rankings.findIndex((r) => r.station.id === selectedStationId) + 1;
  const marginRank = [...rankings]
    .sort((a, b) => b.avgMarginPercent - a.avgMarginPercent)
    .findIndex((r) => r.station.id === selectedStationId) + 1;

  // Helper to add or remove comparison station
  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      if (compareIds.length > 1) {
        setCompareIds(compareIds.filter((x) => x !== id));
      }
    } else {
      if (compareIds.length < 3) {
        setCompareIds([...compareIds, id]);
      }
    }
  };

  const comparedMetrics = compareIds
    .map((id) => rankings.find((r) => r.station.id === id))
    .filter(Boolean) as AggregatedStationMetrics[];

  if (!activeMetric) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-agrola-border h-full flex flex-col items-center justify-center">
        <p className="text-sm text-agrola-muted">Keine Standortdaten für diesen Filter verfügbar.</p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-3 px-4 py-2 bg-agrola-forest text-white text-xs font-semibold rounded-lg hover:bg-agrola-forest-light transition-colors"
          >
            ← Zurück zur Übersicht
          </button>
        )}
      </div>
    );
  }

  const s = activeMetric.station;

  // Comparison chart data (Product mix volume by station)
  const comparisonChartData = comparedMetrics.map((cm) => ({
    name: cm.station.name.split("/")[0].trim(),
    "Benzin 95": cm.products["Benzin 95"]?.volume || 0,
    "Benzin 98": cm.products["Benzin 98"]?.volume || 0,
    Diesel: cm.products["Diesel"]?.volume || 0,
  }));

  const headerAndMetricsSection = (
    <div key="metrics" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-agrola-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-agrola-forest text-agrola-lime flex items-center justify-center font-bold text-xl shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-agrola-ink">
                {s.name}
              </h2>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-agrola-canvas border border-agrola-border text-agrola-muted">
                {s.id}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {s.type}
              </span>
              <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                Netzwerk-Rang #{revenueRank > 0 ? revenueRank : 1}
              </span>
            </div>
            <p className="text-xs text-agrola-muted mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-agrola-forest" />
                {s.city}, Kanton {s.canton} · Region {s.region}
              </span>
              <span>·</span>
              <span>{s.pumpsCount} Zapfsäulen</span>
            </p>
          </div>
        </div>

        {/* Amenities & Fast Station Switcher */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            {s.hasShop && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-agrola-canvas text-agrola-forest border border-agrola-border text-[11px] font-medium">
                <Store className="w-3.5 h-3.5" /> AGROLA TopShop
              </span>
            )}
            {s.hasCarWash && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-agrola-canvas text-agrola-forest border border-agrola-border text-[11px] font-medium">
                <Car className="w-3.5 h-3.5" /> Waschanlage
              </span>
            )}
            {s.evCharging && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                <Zap className="w-3.5 h-3.5 text-emerald-600" /> Fast-EV Charging
              </span>
            )}
          </div>

          {/* Quick Station Dropdown */}
          <select
            value={selectedStationId}
            onChange={(e) => {
              onSelectStation(e.target.value);
              setCompareIds([e.target.value]);
            }}
            className="bg-agrola-canvas border border-agrola-border text-xs font-semibold rounded-lg px-3 py-2 text-agrola-ink focus:ring-1 focus:ring-agrola-forest"
          >
            {rankings.map((r) => (
              <option key={r.station.id} value={r.station.id}>
                {r.station.name} ({r.station.canton})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics Grid for this Station */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        <div className="p-3.5 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
          <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
            Umsatz ({periodLabel})
          </span>
          <div className="text-xl font-bold font-mono text-agrola-ink mt-0.5">
            CHF {fmtCH(activeMetric.totalRevenue)}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
            <span
              className={clsx(
                activeMetric.revenueGrowthPct >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              )}
            >
              {`${activeMetric.revenueGrowthPct >= 0 ? "+" : ""}${activeMetric.revenueGrowthPct.toFixed(1)}% vs. Vorperiode`}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
          <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
            Treibstoffabsatz
          </span>
          <div className="text-xl font-bold font-mono text-agrola-ink mt-0.5">
            {fmtCH(activeMetric.totalVolume)} L
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold">
            <span
              className={clsx(
                activeMetric.volumeGrowthPct >= 0
                  ? "text-emerald-700"
                  : "text-rose-700"
              )}
            >
              {`${activeMetric.volumeGrowthPct >= 0 ? "+" : ""}${activeMetric.volumeGrowthPct.toFixed(1)}% vs. Vorperiode`}
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
          <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
            Ø Verkaufspreis
          </span>
          <div className="text-xl font-bold font-mono text-agrola-ink mt-0.5">
            CHF {activeMetric.weightedAvgPrice.toFixed(3)}
          </div>
          <div className="mt-1 text-[11px] text-agrola-muted">
            Margenspanne: +CHF {activeMetric.avgSpread.toFixed(3)} / L
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
          <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
            Bruttomarge & DB II
          </span>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-0.5">
            {activeMetric.avgMarginPercent.toFixed(1)}%
          </div>
          <div className="mt-1 text-[11px] font-mono text-agrola-muted">
            DB II: CHF {fmtCH(activeMetric.netOperatingProfit)}
          </div>
        </div>
      </div>
    </div>
  );

  const productAndBenchmarkSection = (
    <div key="benchmark" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Product Breakdown Table */}
      <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle">
        <h3 className="text-base font-bold text-agrola-ink mb-1 flex items-center gap-2">
          <Fuel className="w-4 h-4 text-agrola-forest" />
          <span>Produktmix & Deckungsbeitrag am Standort</span>
        </h3>
        <p className="text-xs text-agrola-muted mb-4">
          Volumen, Verkaufspreise und Erträge nach Kraftstoffsorte
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-agrola-border text-[10px] uppercase tracking-wider text-agrola-muted">
                <th className="pb-2 font-semibold">Treibstoff</th>
                <th className="pb-2 font-semibold text-right">Absatz (L)</th>
                <th className="pb-2 font-semibold text-right">Umsatz (CHF)</th>
                <th className="pb-2 font-semibold text-right">Ø Preis</th>
                <th className="pb-2 font-semibold text-right">Marge %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-agrola-border/50">
              {(["Benzin 95", "Benzin 98", "Diesel"] as const).map((fuel) => {
                const p = activeMetric.products[fuel];
                if (!p) return null;
                return (
                  <tr key={fuel} className="hover:bg-agrola-canvas/40">
                    <td className="py-2.5 font-bold font-sans text-agrola-ink flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "w-2 h-2 rounded-full",
                          fuel === "Benzin 95"
                            ? "bg-emerald-600"
                            : fuel === "Benzin 98"
                            ? "bg-teal-700"
                            : "bg-amber-600"
                        )}
                      />
                      {fuel}
                    </td>
                    <td className="py-2.5 text-right font-semibold">
                      {fmtCH(p.volume)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-agrola-ink">
                      CHF {fmtCH(p.revenue)}
                    </td>
                    <td className="py-2.5 text-right text-agrola-forest">
                      {p.avgRetailPrice.toFixed(3)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-emerald-700">
                      {p.marginPercent.toFixed(1)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Regional Benchmark Comparison */}
      <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-agrola-ink mb-1 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-agrola-forest" />
            <span>Standortbenchmark vs. Regionalschnitt</span>
          </h3>
          <p className="text-xs text-agrola-muted mb-4">
            Relative Positionierung gegenüber dem Durchschnitt aller Stationen in {s.region}
          </p>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-agrola-ink">Umsatz vs. Regionsschnitt</span>
                <span
                  className={clsx(
                    "font-mono font-bold",
                    activeMetric.revenueVsRegionAvgPct >= 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                  )}
                >
                  {`${activeMetric.revenueVsRegionAvgPct >= 0 ? "+" : ""}${activeMetric.revenueVsRegionAvgPct.toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full bg-[#EAEFEA] h-2 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full",
                    activeMetric.revenueVsRegionAvgPct >= 0
                      ? "bg-emerald-600"
                      : "bg-rose-500"
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, 50 + activeMetric.revenueVsRegionAvgPct)
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-agrola-ink">Absatzvolumen vs. Regionsschnitt</span>
                <span
                  className={clsx(
                    "font-mono font-bold",
                    activeMetric.volumeVsRegionAvgPct >= 0
                      ? "text-emerald-700"
                      : "text-rose-700"
                  )}
                >
                  {`${activeMetric.volumeVsRegionAvgPct >= 0 ? "+" : ""}${activeMetric.volumeVsRegionAvgPct.toFixed(1)}%`}
                </span>
              </div>
              <div className="w-full bg-[#EAEFEA] h-2 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full",
                    activeMetric.volumeVsRegionAvgPct >= 0
                      ? "bg-agrola-forest"
                      : "bg-amber-500"
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(10, 50 + activeMetric.volumeVsRegionAvgPct)
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Network Overview Ranking Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-agrola-border/60 text-xs">
              <div className="p-2 rounded bg-agrola-canvas border border-agrola-border">
                <span className="text-[10px] text-agrola-muted uppercase block font-semibold">Umsatz-Rang</span>
                <span className="font-mono font-bold text-agrola-ink">#{revenueRank > 0 ? revenueRank : 1}</span>
                <span className="text-[10px] text-agrola-muted block">von {rankings.length} Stationen</span>
              </div>
              <div className="p-2 rounded bg-agrola-canvas border border-agrola-border">
                <span className="text-[10px] text-agrola-muted uppercase block font-semibold">Margen-Rang</span>
                <span className="font-mono font-bold text-emerald-700">#{marginRank > 0 ? marginRank : 1}</span>
                <span className="text-[10px] text-agrola-muted block">nach Bruttomarge %</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-agrola-canvas rounded-lg border border-agrola-border text-[11px] text-agrola-muted leading-relaxed">
          <span className="font-bold text-agrola-forest">Standort-Bewertung:</span>{" "}
          {activeMetric.revenueVsRegionAvgPct >= 0
            ? `Überdurchschnittlicher Absatzstandort im Kanton ${s.canton} (Netzwerk-Rang #${revenueRank > 0 ? revenueRank : 1}). Durch die Klassifikation als ${s.type} wird ein stabiler Kundenstrom gesichert.`
            : `Unterdurchschnittliche Auslastung im regionalen Vergleich (${s.region}). Optimierungspotenzial bei Werbemassnahmen oder Shop-Cross-Selling prüfen.`}
        </div>
      </div>
    </div>
  );

  const comparisonSection = (
    <div key="compare" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-agrola-border mb-4">
        <div>
          <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
            <Layers className="w-4 h-4 text-agrola-forest" />
            <span>Multi-Standortvergleich (bis zu 3 Stationen)</span>
          </h3>
          <p className="text-xs text-agrola-muted mt-0.5">
            Direkter Kennzahlen- und Produktmixvergleich ausgewählter Tankstellen
          </p>
        </div>

        {/* Selector pills to add stations */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-agrola-muted font-medium">Station hinzufügen:</span>
          <select
            onChange={(e) => {
              if (e.target.value) toggleCompare(e.target.value);
            }}
            value=""
            className="text-xs bg-agrola-canvas border border-agrola-border rounded-lg px-2.5 py-1 text-agrola-ink font-medium"
          >
            <option value="" disabled>+ Station wählen...</option>
            {rankings
              .filter((r) => !compareIds.includes(r.station.id))
              .map((r) => (
                <option key={r.station.id} value={r.station.id}>
                  {r.station.name} ({r.station.canton})
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Selected Comparison Tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {comparedMetrics.map((cm) => (
          <div
            key={cm.station.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-agrola-canvas border border-agrola-border text-xs font-semibold text-agrola-ink"
          >
            <span>{cm.station.name} ({cm.station.canton})</span>
            {compareIds.length > 1 && (
              <button
                onClick={() => toggleCompare(cm.station.id)}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-agrola-border text-left text-agrola-muted uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-semibold">Kennzahl</th>
              {comparedMetrics.map((cm) => (
                <th key={cm.station.id} className="pb-2.5 font-bold font-sans text-agrola-ink text-right">
                  {cm.station.name.split("/")[0].trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-agrola-border/50 text-agrola-ink">
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Kanton & Region</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-sans">
                  {cm.station.canton} · {cm.station.region}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Standorttyp</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-sans">
                  {cm.station.type} ({cm.station.pumpsCount} Säulen)
                </td>
              ))}
            </tr>
            <tr className="bg-agrola-canvas/30">
              <td className="py-2.5 font-sans font-bold text-agrola-ink">Gesamtumsatz (CHF)</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-bold text-agrola-forest">
                  CHF {fmtCH(cm.totalRevenue)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Treibstoffabsatz (L)</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-semibold">
                  {fmtCH(cm.totalVolume)} L
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Ø Verkaufspreis</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-bold">
                  CHF {cm.weightedAvgPrice.toFixed(3)}
                </td>
              ))}
            </tr>
            <tr className="bg-agrola-canvas/30">
              <td className="py-2.5 font-sans font-bold text-agrola-ink">Bruttomarge %</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-bold text-emerald-700">
                  {cm.avgMarginPercent.toFixed(1)}% (CHF {fmtCH(cm.totalGrossMargin)})
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Operativer Deckungsbeitrag</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-semibold text-agrola-ink">
                  CHF {fmtCH(cm.netOperatingProfit)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2.5 font-sans font-medium text-agrola-muted">Umsatzwachstum vs. Vorperiode</td>
              {comparedMetrics.map((cm) => (
                <td key={cm.station.id} className="py-2.5 text-right font-semibold">
                  <span className={cm.revenueGrowthPct >= 0 ? "text-emerald-700" : "text-rose-700"}>
                    {`${cm.revenueGrowthPct >= 0 ? "+" : ""}${cm.revenueGrowthPct.toFixed(1)}%`}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Volume comparison stacked bar chart */}
      <div>
        <div className="text-xs font-bold text-agrola-ink mb-2">
          Absatzvolumen nach Treibstoffsorte (Liter)
        </div>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <BarGradient id="grad-b95" color="#059669" />
                <BarGradient id="grad-b98" color="#0F766E" />
                <BarGradient id="grad-diesel" color="#D97706" />
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />
              <XAxis dataKey="name" tickLine={false} tick={{ fontSize: 11, fill: "#7E9088" }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#7E9088", fontFamily: "var(--font-mono)" }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value: any) => [`${fmtCH(Number(value))} L`]}
                contentStyle={{ backgroundColor: "#173D30", borderColor: "#173D30", color: "#fff", borderRadius: 8, fontSize: 11 }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="Benzin 95" fill="url(#grad-b95)" radius={BAR_RADIUS} />
              <Bar dataKey="Benzin 98" fill="url(#grad-b98)" radius={BAR_RADIUS} />
              <Bar dataKey="Diesel" fill="url(#grad-diesel)" radius={BAR_RADIUS} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const subviewContent =
    activeSubview === "benchmark"
      ? productAndBenchmarkSection
      : activeSubview === "vergleich"
      ? comparisonSection
      : headerAndMetricsSection;

  return (
    <div className="h-full flex flex-col min-h-0 gap-3">
      {/* Back / Navigation Bar */}
      {onBack && (
        <div className="flex items-center justify-between shrink-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-agrola-border text-agrola-forest text-xs font-bold hover:bg-agrola-canvas transition-colors shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agrola-forest/40"
          >
            <span>← Zurück zum Dashboard</span>
          </button>
          <div className="text-xs text-agrola-muted">
            Rang <span className="font-bold text-agrola-ink font-mono">#{revenueRank > 0 ? revenueRank : 1}</span> von {rankings.length} Stationen im Umsatz
          </div>
        </div>
      )}

      <div
        key={activeSubview}
        className="animate-subview flex-1 min-h-0 overflow-y-auto pr-0.5"
      >
        {subviewContent}
      </div>
    </div>
  );
}
