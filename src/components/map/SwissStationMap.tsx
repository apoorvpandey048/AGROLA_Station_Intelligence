"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { AggregatedStationMetrics } from "@/types";
import { Layers, MapPin, Sparkles, Navigation, Fuel, Store, Car, Zap } from "lucide-react";
import clsx from "clsx";
import { fmtCH } from "@/lib/format";

// Dynamically import Leaflet component to prevent SSR hydration errors
const DynamicMap = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] lg:h-[540px] rounded-xl bg-[#E8ECE5] flex flex-col items-center justify-center text-agrola-muted border border-agrola-border">
      <div className="w-8 h-8 border-2 border-agrola-forest border-t-transparent rounded-full animate-spin mb-3"></div>
      <div className="text-xs font-semibold">Lade Schweizer Geodaten & Stationen...</div>
    </div>
  ),
});

interface SwissStationMapProps {
  rankings: AggregatedStationMetrics[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onGoToAnalytics?: (stationId: string) => void;
}

export function SwissStationMap({
  rankings,
  selectedStationId,
  onSelectStation,
  onGoToAnalytics,
}: SwissStationMapProps) {
  const [metricMode, setMetricMode] = useState<"revenue" | "volume" | "margin" | "price">("revenue");

  const selectedStation = rankings.find(
    (r) => r.station.id === selectedStationId
  ) || rankings[0];

  return (
    <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-agrola-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-agrola-forest" />
              <span>Standortnetzwerk Schweiz</span>
            </h2>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-agrola-canvas text-agrola-forest font-semibold border border-agrola-border">
              {rankings.length} Standorte
            </span>
          </div>
          <p className="text-xs text-agrola-muted mt-0.5">
            Interaktive Visualisierung nach Performance-Metrik · Auf Marker klicken für Details
          </p>
        </div>

        {/* Metric Mode Pill Selector */}
        <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-0.5 text-xs">
          <button
            onClick={() => setMetricMode("revenue")}
            className={clsx(
              "px-2.5 py-1 font-semibold rounded-md transition-all",
              metricMode === "revenue"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-ink hover:text-agrola-forest"
            )}
          >
            Umsatz
          </button>
          <button
            onClick={() => setMetricMode("volume")}
            className={clsx(
              "px-2.5 py-1 font-semibold rounded-md transition-all",
              metricMode === "volume"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-ink hover:text-agrola-forest"
            )}
          >
            Absatz (L)
          </button>
          <button
            onClick={() => setMetricMode("margin")}
            className={clsx(
              "px-2.5 py-1 font-semibold rounded-md transition-all",
              metricMode === "margin"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-ink hover:text-agrola-forest"
            )}
          >
            Marge %
          </button>
          <button
            onClick={() => setMetricMode("price")}
            className={clsx(
              "px-2.5 py-1 font-semibold rounded-md transition-all",
              metricMode === "price"
                ? "bg-agrola-forest text-white shadow-xs"
                : "text-agrola-ink hover:text-agrola-forest"
            )}
          >
            Ø Preis
          </button>
        </div>
      </div>

      {/* Map Component */}
      <DynamicMap
        rankings={rankings}
        selectedStationId={selectedStationId}
        onSelectStation={onSelectStation}
        onGoToAnalytics={onGoToAnalytics}
        metricMode={metricMode}
      />

      {/* Selected Station Bottom Detail Card */}
      {selectedStation && (
        <div className="mt-4 p-4 rounded-xl bg-agrola-canvas border border-agrola-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-agrola-amber animate-pulse"></span>
              <h3 className="text-sm font-bold text-agrola-ink">
                {selectedStation.station.name}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-agrola-muted border border-agrola-border">
                {selectedStation.station.id}
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {selectedStation.station.type}
              </span>
            </div>
            <div className="text-xs text-agrola-muted flex items-center gap-3">
              <span>{selectedStation.station.region} ({selectedStation.station.canton})</span>
              <span>·</span>
              <span>{selectedStation.station.pumpsCount} Zapfsäulen</span>
              <div className="hidden sm:flex items-center gap-1.5 ml-2 text-agrola-forest">
                {selectedStation.station.hasShop && <span title="Shop vorhanden" className="flex items-center gap-0.5 text-[10px] bg-white px-1.5 py-0.5 rounded border border-agrola-border"><Store className="w-3 h-3" /> Shop</span>}
                {selectedStation.station.hasCarWash && <span title="Waschanlage" className="flex items-center gap-0.5 text-[10px] bg-white px-1.5 py-0.5 rounded border border-agrola-border"><Car className="w-3 h-3" /> Waschanlage</span>}
                {selectedStation.station.evCharging && <span title="EV Ladepunkt" className="flex items-center gap-0.5 text-[10px] bg-white px-1.5 py-0.5 rounded border border-agrola-border"><Zap className="w-3 h-3 text-emerald-600" /> Fast-EV</span>}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="bg-white px-3 py-2 rounded-lg border border-agrola-border">
              <div className="text-[10px] uppercase font-semibold text-agrola-muted">Umsatz</div>
              <div className="text-sm font-bold text-agrola-ink tabular-nums">
                CHF {fmtCH(selectedStation.totalRevenue)}
              </div>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-agrola-border">
              <div className="text-[10px] uppercase font-semibold text-agrola-muted">Absatz</div>
              <div className="text-sm font-bold text-agrola-ink tabular-nums">
                {fmtCH(selectedStation.totalVolume)} L
              </div>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg border border-agrola-border">
              <div className="text-[10px] uppercase font-semibold text-agrola-muted">Bruttomarge</div>
              <div className="text-sm font-bold text-emerald-700 tabular-nums">
                {selectedStation.avgMarginPercent.toFixed(1)}%
              </div>
            </div>
            {onGoToAnalytics && (
              <button
                onClick={() => onGoToAnalytics(selectedStation.station.id)}
                className="px-3.5 py-2 rounded-lg bg-agrola-forest text-white text-xs font-semibold hover:bg-agrola-forest-light transition-colors shadow-xs"
              >
                Vollanalyse öffnen →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-agrola-muted pt-2 border-t border-agrola-border/60">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#173D30] border border-agrola-lime inline-block"></span>
            <span>Standardstation</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-agrola-amber border border-white inline-block"></span>
            <span>Aktive Selektion</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-mono text-[10px]">Grösse/Zahl = gewählte Metrik ({metricMode})</span>
          </span>
        </div>
        <span className="hidden sm:inline font-mono text-[10px]">
          Koordinaten: WGS84 CH
        </span>
      </div>
    </div>
  );
}
