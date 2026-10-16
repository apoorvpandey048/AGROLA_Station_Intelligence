"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics, FuelProductMetric, FuelType } from "@/types";
import {
  TrendingUp,
  Fuel,
  ArrowRightLeft,
  DollarSign,
  BarChart2,
  AlertCircle,
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
  LineChart,
  Line,
} from "recharts";
import { fmtCH } from "@/lib/format";

interface PriceSalesViewProps {
  rankings: AggregatedStationMetrics[];
  productMix: FuelProductMetric[];
  periodLabel: string;
}

export function PriceSalesView({
  rankings,
  productMix,
  periodLabel,
}: PriceSalesViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<FuelType>("Benzin 95");

  // Prepare station price distribution data sorted by retail price
  const priceSpreadData = rankings
    .map((r) => {
      const p = r.products[selectedProduct];
      return {
        stationName: r.station.name.split("/")[0].trim(),
        region: r.station.region,
        retailPrice: p ? +p.avgRetailPrice.toFixed(3) : 0,
        procurementCost: p ? +p.avgProcurementCost.toFixed(3) : 0,
        spread: p ? +(p.avgRetailPrice - p.avgProcurementCost).toFixed(3) : 0,
        volume: p ? p.volume : 0,
      };
    })
    .filter((d) => d.retailPrice > 0)
    .sort((a, b) => b.retailPrice - a.retailPrice);

  const activeProductMetric = productMix.find(
    (p) => p.fuelType === selectedProduct
  );

  return (
    <div className="space-y-6">
      {/* 1. Architecture Banner: Retail Selling Price vs Procurement Cost */}
      <div className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-agrola-border">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-agrola-forest" />
              <h2 className="text-xl sm:text-2xl font-bold text-agrola-ink">
                Preis- & Margenspannen-Architektur
              </h2>
            </div>
            <p className="text-xs text-agrola-muted mt-1 max-w-2xl">
              Transparente Trennung von Endverbraucher-Verkaufspreis (Retail Price) und referenziertem Treibstoff-Einstandspreis (Procurement Cost).
            </p>
          </div>

          {/* Fuel Switcher Tabs */}
          <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-1 text-xs">
            {(["Benzin 95", "Benzin 98", "Diesel"] as FuelType[]).map((fuel) => (
              <button
                key={fuel}
                onClick={() => setSelectedProduct(fuel)}
                className={clsx(
                  "px-3 py-1.5 rounded-md font-semibold transition-all",
                  selectedProduct === fuel
                    ? "bg-agrola-forest text-white shadow-xs"
                    : "text-agrola-ink hover:text-agrola-forest hover:bg-white/60"
                )}
              >
                {fuel}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Overview Stat Boxes for Selected Fuel */}
        {activeProductMetric && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
            <div className="p-4 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
              <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
                Ø Endverbraucherpreis
              </span>
              <div className="text-2xl font-bold font-mono text-agrola-ink mt-0.5">
                CHF {activeProductMetric.avgRetailPrice.toFixed(3)}
              </div>
              <span className="text-[11px] text-agrola-muted block mt-1">
                Absatzgewichtet im Schweizer Netz
              </span>
            </div>

            <div className="p-4 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
              <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
                Ø Beschaffungskosten (Einstand)
              </span>
              <div className="text-2xl font-bold font-mono text-slate-700 mt-0.5">
                CHF {activeProductMetric.avgProcurementCost.toFixed(3)}
              </div>
              <span className="text-[11px] text-agrola-muted block mt-1">
                Raffinerie- & Großhandelspreis (sim.)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
                Ø Handelsspanne (Spread)
              </span>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-0.5">
                +CHF {activeProductMetric.spread.toFixed(3)} / L
              </div>
              <span className="text-[11px] text-emerald-700 block mt-1">
                Bruttomargenquote: {activeProductMetric.marginPercent.toFixed(1)}%
              </span>
            </div>

            <div className="p-4 rounded-lg bg-agrola-canvas/60 border border-agrola-border">
              <span className="text-[10px] uppercase font-bold text-agrola-muted tracking-wider block">
                Gesamtertrag Kraftstoff
              </span>
              <div className="text-2xl font-bold font-mono text-agrola-forest mt-0.5">
                CHF {(activeProductMetric.revenue / 1000).toFixed(0)}k
              </div>
              <span className="text-[11px] text-agrola-muted block mt-1">
                Absatz: {fmtCH(activeProductMetric.volume)} L
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Visual Price Spread Chart across Stations */}
      <div className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-agrola-forest" />
              <span>Verkaufspreis vs. Einkaufskosten nach Tankstelle ({selectedProduct})</span>
            </h3>
            <p className="text-xs text-agrola-muted mt-0.5">
              Vergleich der realisierten Spanne je Standort · Geordnet nach höchstem Verkaufspreis
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
            {priceSpreadData.length} Standorte
          </span>
        </div>

        {/* Chart */}
        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={priceSpreadData}
              margin={{ top: 15, right: 10, left: -10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEFE9" />
              <XAxis
                dataKey="stationName"
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                tick={{ fontSize: 10, fill: "#7E9088" }}
              />
              <YAxis
                domain={[1.3, 2.1]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#7E9088", fontFamily: "var(--font-mono)" }}
                tickFormatter={(v) => v.toFixed(2)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0]?.payload;
                  return (
                    <div className="bg-agrola-forest text-white rounded-xl p-3 shadow-xl border border-white/10 font-sans text-xs min-w-[200px]">
                      <div className="font-bold border-b border-white/15 pb-1 mb-2">
                        {label} ({item.region})
                      </div>
                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-white/70">Verkaufspreis:</span>
                          <span className="font-bold text-white">CHF {item.retailPrice.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/70">Einstandskosten:</span>
                          <span className="text-emerald-200">CHF {item.procurementCost.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/10 font-bold text-agrola-lime">
                          <span>Margenspanne:</span>
                          <span>+CHF {item.spread.toFixed(3)} / L</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="retailPrice" name="Verkaufspreis (CHF/L)" fill="#173D30" radius={[4, 4, 0, 0]} />
              <Bar dataKey="procurementCost" name="Einstandspreis (CHF/L)" fill="#B8D96B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote on pricing policy */}
        <div className="mt-4 pt-3 border-t border-agrola-border text-[11px] text-agrola-muted flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-agrola-forest shrink-0 mt-0.5" />
          <p>
            Hinweis zur Preisstellung: Schweizer Autobahnstationen erzielen aufgrund von 24/7-Konzessionen und hohem Transitaufkommen durchschnittlich CHF 0.04 bis 0.06 höhere Abgabepreise als ländliche Standorte. Lokale Discounter im Mittelland setzen den Marktpreis unter Druck.
          </p>
        </div>
      </div>
    </div>
  );
}
