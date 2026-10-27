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
  activeSubview?: string;
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onGoToAnalytics: (stationId: string) => void;
  periodLabel: string;
  activeRegion?: string;
  onSelectRegion?: (region: string) => void;
  layoutMode?: "kpi-first" | "plots-first";
}

const FOOTER = (
  <div className="pt-3 mt-3 border-t border-agrola-border text-[11px] text-agrola-muted flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
    <p>
      Konzept- & Vertriebsdemonstration für AGROLA · Alle Datenpunkte, Mengensätze und Preise sind deterministisch simuliert.
      Kartendaten basieren auf amtlichen WGS84-Koordinaten.
    </p>
    <span className="font-mono text-[10px] text-slate-500 whitespace-nowrap">
      Berechnungsmodell: Schweizer Handelsspannenlogik (reconciled)
    </span>
  </div>
);

export function NetworkOverview({
  summary,
  activeSubview = "uebersicht",
  selectedStationId,
  onSelectStation,
  onGoToAnalytics,
  periodLabel,
  activeRegion,
  onSelectRegion,
  layoutMode = "kpi-first",
}: NetworkOverviewProps) {
  const kpiRow = <KpiGrid summary={summary} />;

  const mapCol = (
    <div className="xl:col-span-2 min-h-0">
      <SwissStationMap
        rankings={summary.rankings}
        selectedStationId={selectedStationId}
        onSelectStation={onSelectStation}
        onGoToAnalytics={onGoToAnalytics}
        fillHeight
      />
    </div>
  );

  const rankingCol = (
    <div className="xl:col-span-1 min-h-0">
      <RankingPanel
        rankings={summary.rankings}
        selectedStationId={selectedStationId}
        onSelectStation={onSelectStation}
        onGoToAnalytics={onGoToAnalytics}
      />
    </div>
  );

  let content: React.ReactNode = null;

  if (activeSubview === "trends") {
    content = (
      <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        <div className="lg:col-span-2 min-h-0">
          <TimeSeriesCard data={summary.timeSeries} periodLabel={periodLabel} fillHeight />
        </div>
        <div className="lg:col-span-1 min-h-0 overflow-y-auto pr-0.5">
          <ProductMixCard products={summary.productMix} />
        </div>
      </div>
    );
  } else if (activeSubview === "regionen") {
    content = (
      <div className="h-full grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0">
        <div className="xl:col-span-2 min-h-0 overflow-y-auto pr-0.5">
          <RegionalBenchmarkBar
            benchmarks={summary.regionalBenchmarks}
            activeRegion={activeRegion}
            onSelectRegion={onSelectRegion}
          />
        </div>
        {rankingCol}
      </div>
    );
  } else if (activeSubview === "insights") {
    content = (
      <div className="h-full flex flex-col gap-4 min-h-0">
        <div className="shrink-0">{kpiRow}</div>
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <PerformanceExceptions
            exceptions={summary.exceptions}
            onSelectStation={onSelectStation}
          />
        </div>
        {FOOTER}
      </div>
    );
  } else {
    // uebersicht (default): KPI row + Map + Ranking, filling the viewport
    const grid = (
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-3 gap-4 min-h-0 items-stretch">
        {mapCol}
        {rankingCol}
      </div>
    );
    content = (
      <div className="h-full flex flex-col gap-4 min-h-0">
        {layoutMode === "plots-first" ? (
          <>
            {grid}
            <div className="shrink-0">{kpiRow}</div>
          </>
        ) : (
          <>
            <div className="shrink-0">{kpiRow}</div>
            {grid}
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
