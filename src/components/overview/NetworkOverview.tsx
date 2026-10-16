"use client";

import React from "react";
import { NetworkSummary } from "@/types";
import { KpiGrid } from "./KpiGrid";
import { SwissStationMap } from "../map/SwissStationMap";
import { RankingPanel } from "./RankingPanel";
import { TimeSeriesCard } from "./TimeSeriesCard";
import { ProductMixCard } from "./ProductMixCard";
import { RegionalBenchmarkBar } from "./RegionalBenchmarkBar";
import { PerformanceExceptions } from "./PerformanceExceptions";

interface NetworkOverviewProps {
  summary: NetworkSummary;
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onGoToAnalytics: (stationId: string) => void;
  periodLabel: string;
  activeRegion?: string;
  onSelectRegion?: (region: string) => void;
}

export function NetworkOverview({
  summary,
  selectedStationId,
  onSelectStation,
  onGoToAnalytics,
  periodLabel,
  activeRegion,
  onSelectRegion,
}: NetworkOverviewProps) {
  return (
    <div className="space-y-6">
      {/* 1. Executive Top KPI Row */}
      <KpiGrid summary={summary} />

      {/* 2. Performance Exceptions & Operating Anomalies */}
      <PerformanceExceptions
        exceptions={summary.exceptions}
        onSelectStation={onSelectStation}
      />

      {/* 3. Central Geographic & Ranking Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
        <div className="xl:col-span-2">
          <SwissStationMap
            rankings={summary.rankings}
            selectedStationId={selectedStationId}
            onSelectStation={onSelectStation}
            onGoToAnalytics={onGoToAnalytics}
          />
        </div>

        <div className="xl:col-span-1">
          <RankingPanel
            rankings={summary.rankings}
            selectedStationId={selectedStationId}
            onSelectStation={onSelectStation}
            onGoToAnalytics={onGoToAnalytics}
          />
        </div>
      </div>

      {/* 4. Time Series Trend & Product Mix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TimeSeriesCard
            data={summary.timeSeries}
            periodLabel={periodLabel}
          />
        </div>

        <div className="lg:col-span-1">
          <ProductMixCard products={summary.productMix} />
        </div>
      </div>

      {/* 5. Regional Benchmark Breakdown across Swiss Territories */}
      <RegionalBenchmarkBar
        benchmarks={summary.regionalBenchmarks}
        activeRegion={activeRegion}
        onSelectRegion={onSelectRegion}
      />

      {/* Footer Disclaimer & Enterprise Compliance */}
      <div className="pt-4 border-t border-agrola-border text-[11px] text-agrola-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p>
          Konzept- & Vertriebsdemonstration für AGROLA · Alle Datenpunkte, Mengensätze und Preise sind deterministisch simuliert.
          Kartendaten basieren auf amtlichen WGS84-Koordinaten.
        </p>
        <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
          Berechnungsmodell: Schweizer Handelsspannenlogik (reconciled)
        </span>
      </div>
    </div>
  );
}
