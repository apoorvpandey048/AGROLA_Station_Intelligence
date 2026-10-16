"use client";

import React from "react";
import { FuelProductMetric } from "@/types";
import { PieChart, Droplet, ArrowUpRight } from "lucide-react";
import clsx from "clsx";
import { fmtCH } from "@/lib/format";

interface ProductMixCardProps {
  products: FuelProductMetric[];
}

export function ProductMixCard({ products }: ProductMixCardProps) {
  const totalRev = products.reduce((sum, p) => sum + p.revenue, 0);

  // Colors for fuel types
  const fuelColors: Record<string, { bg: string; text: string; fill: string }> = {
    "Benzin 95": { bg: "bg-emerald-600", text: "text-emerald-700", fill: "#059669" },
    "Benzin 98": { bg: "bg-teal-700", text: "text-teal-800", fill: "#0F766E" },
    Diesel: { bg: "bg-amber-600", text: "text-amber-800", fill: "#D97706" },
  };

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-agrola-border mb-4">
          <div>
            <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
              <PieChart className="w-4 h-4 text-agrola-forest" />
              <span>Produktmix & Kraftstoffmargen</span>
            </h3>
            <p className="text-xs text-agrola-muted mt-0.5">
              Aufteilung nach Treibstoffsorte, Margenspanne und Deckungsbeitrag
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-muted border border-agrola-border">
            3 Kraftstoffarten
          </span>
        </div>

        {/* Stacked Proportional Distribution Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-agrola-muted font-medium mb-1.5">
            <span>Umsatzanteile im Netzwerk</span>
            <span className="font-mono">100% Gesamtabdeckung</span>
          </div>

          <div className="w-full h-4 rounded-full overflow-hidden flex bg-[#EAEFEA] p-0.5">
            {products.map((p) => {
              const widthPct = totalRev > 0 ? (p.revenue / totalRev) * 100 : 33.3;
              const color = fuelColors[p.fuelType] || fuelColors["Benzin 95"];
              return (
                <div
                  key={p.fuelType}
                  style={{ width: `${widthPct}%` }}
                  title={`${p.fuelType}: ${widthPct.toFixed(1)}%`}
                  className={clsx(color.bg, "h-full first:rounded-l-full last:rounded-r-full transition-all duration-300")}
                />
              );
            })}
          </div>
        </div>

        {/* Product Metric Rows */}
        <div className="space-y-3">
          {products.map((p) => {
            const color = fuelColors[p.fuelType] || fuelColors["Benzin 95"];
            return (
              <div
                key={p.fuelType}
                className="p-3 rounded-lg border border-agrola-border/70 bg-agrola-canvas/60 hover:bg-agrola-canvas transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={clsx("w-3 h-3 rounded-full", color.bg)} />
                    <span className="text-xs font-bold text-agrola-ink">
                      {p.fuelType}
                    </span>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white border border-agrola-border text-agrola-muted">
                      {p.revenueShare.toFixed(1)}% Umsatz
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold font-mono text-agrola-ink">
                      CHF {(p.revenue / 1000).toFixed(0)}k
                    </span>
                    <span className="text-[10px] text-agrola-muted block font-mono">
                      {fmtCH(p.volume)} L
                    </span>
                  </div>
                </div>

                {/* Sub-metrics: Price, Cost, Spread */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-agrola-border/50 text-[11px] font-mono">
                  <div>
                    <span className="text-agrola-muted text-[10px] block">Ø Verkauf</span>
                    <span className="font-semibold text-agrola-ink">CHF {p.avgRetailPrice.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-agrola-muted text-[10px] block">Ø Einstand</span>
                    <span className="text-agrola-muted">CHF {p.avgProcurementCost.toFixed(3)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-agrola-muted text-[10px] block">Margenspanne</span>
                    <span className="font-bold text-emerald-700">
                      +{p.spread.toFixed(3)} <span className="text-[9px]">CHF/L</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytical Insight Note */}
      <div className="mt-4 p-3 rounded-lg bg-[#EBF4EC] border border-[#CDE5D1] text-[11px] text-emerald-900 leading-relaxed">
        <span className="font-bold">Analytischer Hinweis:</span> Benzin 98 erzielt mit durchschnittlich +0.27 CHF/L die höchste pro-Liter Handelsspanne. Diesel dominiert mit hohem Flottenvolumen an den Schweizer Autobahn- und Gewerbestandorten.
      </div>
    </div>
  );
}
