import React from "react";
import { NetworkSummary } from "@/types";
import { MetricCard } from "../ui/MetricCard";
import { fmtCH } from "@/lib/format";
import {
  Banknote,
  Fuel,
  TrendingUp,
  MapPin,
  Percent,
  Wallet,
} from "lucide-react";

interface KpiGridProps {
  summary: NetworkSummary;
}

export function KpiGrid({ summary }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 stagger-children">
      {/* 1. Gesamtumsatz */}
      <MetricCard
        label="Gesamtumsatz"
        value={`CHF ${(summary.totalRevenue / 1000000).toFixed(2)}M`}
        unit=""
        diffPercent={summary.revenueGrowthPct}
        diffPeriodLabel="vs. Vorperiode"
        subtext={`Exakt: CHF ${fmtCH(summary.totalRevenue)}`}
        icon={<Banknote className="w-4 h-4" />}
        highlight={true}
      />

      {/* 2. Treibstoffabsatz */}
      <MetricCard
        label="Treibstoffabsatz"
        value={`${(summary.totalVolume / 1000000).toFixed(2)}M`}
        unit="Liter"
        diffPercent={summary.volumeGrowthPct}
        diffPeriodLabel="vs. Vorperiode"
        subtext={`${fmtCH(summary.totalVolume)} L`}
        icon={<Fuel className="w-4 h-4" />}
      />

      {/* 3. Ø Verkaufspreis */}
      <MetricCard
        label="Ø Verkaufspreis"
        value={summary.weightedAvgPrice.toFixed(3)}
        unit="CHF / L"
        subtext="Absatzgewichtet"
        icon={<TrendingUp className="w-4 h-4" />}
      />

      {/* 4. Bruttomarge */}
      <MetricCard
        label="Bruttomarge"
        value={`CHF ${(summary.totalGrossMargin / 1000).toFixed(0)}k`}
        unit={`(${summary.avgMarginPercent.toFixed(1)}%)`}
        diffPercent={summary.marginGrowthPct}
        diffPeriodLabel="vs. Vorperiode"
        icon={<Percent className="w-4 h-4 text-emerald-600" />}
      />

      {/* 5. Operatives Nettoergebnis */}
      <MetricCard
        label="Operativer Deckungsbeitrag"
        value={`CHF ${(summary.netOperatingProfit / 1000).toFixed(0)}k`}
        unit=""
        subtext="Nach Stationsoverhead & Logistik"
        icon={<Wallet className="w-4 h-4 text-agrola-forest" />}
      />

      {/* 6. Aktive Standorte */}
      <MetricCard
        label="Aktive Standorte"
        value={summary.activeStationsCount}
        unit="Stationen"
        subtext="Im gewählten Filter"
        icon={<MapPin className="w-4 h-4" />}
      />
    </div>
  );
}
