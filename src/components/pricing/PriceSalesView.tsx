"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics, FuelProductMetric, FuelType } from "@/types";
import {
  TrendingUp,
  BarChart2,
  AlertCircle,
} from "lucide-react";
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
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatTile } from "@/components/ui/StatTile";
import { BarGradient, BAR_RADIUS } from "@/components/charts/ChartBits";

interface PriceSalesViewProps {
  rankings: AggregatedStationMetrics[];
  productMix: FuelProductMetric[];
  activeSubview?: string;
  periodLabel: string;
  layoutMode?: "kpi-first" | "plots-first";
}

const FUEL_ITEMS = (["Benzin 95", "Benzin 98", "Diesel"] as FuelType[]).map((f) => ({
  id: f,
  label: f,
}));

export function PriceSalesView({
  rankings,
  productMix,
  activeSubview = "kennzahlen",
  periodLabel,
  layoutMode = "kpi-first",
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

  const fuelSwitcher = (
    <SegmentedControl
      size="sm"
      surface="canvas"
      ariaLabel="Treibstoffsorte wählen"
      items={FUEL_ITEMS}
      value={selectedProduct}
      onChange={(id) => setSelectedProduct(id as FuelType)}
    />
  );

  const statsSection = (
    <div key="stats" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle">
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

        {fuelSwitcher}
      </div>

      {/* 3 Overview Stat Boxes for Selected Fuel */}
      {activeProductMetric && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5 stagger-children">
          <StatTile
            label="Ø Endverbraucherpreis"
            value={`CHF ${activeProductMetric.avgRetailPrice.toFixed(3)}`}
            sub="Absatzgewichtet im Schweizer Netz"
          />
          <StatTile
            label="Ø Beschaffungskosten (Einstand)"
            value={`CHF ${activeProductMetric.avgProcurementCost.toFixed(3)}`}
            valueClassName="text-slate-700"
            sub="Raffinerie- & Großhandelspreis (sim.)"
          />
          <StatTile
            tone="emerald"
            label="Ø Handelsspanne (Spread)"
            value={`+CHF ${activeProductMetric.spread.toFixed(3)} / L`}
            valueClassName="text-emerald-800"
            sub={
              <span className="text-emerald-700">
                Bruttomargenquote: {activeProductMetric.marginPercent.toFixed(1)}%
              </span>
            }
          />
          <StatTile
            label="Gesamtertrag Kraftstoff"
            value={`CHF ${(activeProductMetric.revenue / 1000).toFixed(0)}k`}
            valueClassName="text-agrola-forest"
            sub={`Absatz: ${fmtCH(activeProductMetric.volume)} L`}
          />
        </div>
      )}
    </div>
  );

  const plotSection = (
    <div key="plot" className="bg-white rounded-xl border border-agrola-border p-6 shadow-subtle h-full flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 shrink-0">
        <div>
          <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-agrola-forest" />
            <span>Verkaufspreis vs. Einkaufskosten nach Tankstelle ({selectedProduct})</span>
          </h3>
          <p className="text-xs text-agrola-muted mt-0.5">
            Vergleich der realisierten Spanne je Standort · Geordnet nach höchstem Verkaufspreis
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          {fuelSwitcher}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
            {priceSpreadData.length} Standorte
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={priceSpreadData}
            margin={{ top: 15, right: 10, left: -10, bottom: 40 }}
          >
            <defs>
              <BarGradient id="grad-retail" color="#173D30" />
              <BarGradient id="grad-procure" color="#B8D96B" />
            </defs>
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
            <Bar dataKey="retailPrice" name="Verkaufspreis (CHF/L)" fill="url(#grad-retail)" radius={BAR_RADIUS} />
            <Bar dataKey="procurementCost" name="Einstandspreis (CHF/L)" fill="url(#grad-procure)" radius={BAR_RADIUS} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footnote on pricing policy */}
      <div className="mt-4 pt-3 border-t border-agrola-border text-[11px] text-agrola-muted flex items-start gap-2 shrink-0">
        <AlertCircle className="w-4 h-4 text-agrola-forest shrink-0 mt-0.5" />
        <p>
          Hinweis zur Preisstellung: Schweizer Autobahnstationen erzielen aufgrund von 24/7-Konzessionen und hohem Transitaufkommen durchschnittlich CHF 0.04 bis 0.06 höhere Abgabepreise als ländliche Standorte. Lokale Discounter im Mittelland setzen den Marktpreis unter Druck.
        </p>
      </div>
    </div>
  );

  const content =
    activeSubview === "preisvergleich" ? (
      <div className="h-full min-h-0">{plotSection}</div>
    ) : (
      <div className="h-full min-h-0 overflow-y-auto pr-0.5">{statsSection}</div>
    );

  return (
    <div key={activeSubview} className="animate-subview h-full min-h-0">
      {content}
    </div>
  );
}
