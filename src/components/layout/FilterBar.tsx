"use client";

import React from "react";
import { FilterState, FuelType, PeriodFilter, SwissRegion } from "@/types";
import { STATIONS } from "@/lib/data/stations";
import { RotateCcw, Filter, ChevronDown, Check } from "lucide-react";
import clsx from "clsx";

interface FilterBarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  filteredStationCount?: number;
}

const REGIONS: SwissRegion[] = [
  "Nordwestschweiz",
  "Mittelland",
  "Zürich / Ost",
  "Zentralschweiz",
  "Romandie",
  "Tessin",
];

const FUEL_TYPES: { id: "all" | FuelType; label: string }[] = [
  { id: "all", label: "Alle Treibstoffe" },
  { id: "Benzin 95", label: "Benzin 95" },
  { id: "Benzin 98", label: "Benzin 98" },
  { id: "Diesel", label: "Diesel" },
];

const PERIODS: { id: PeriodFilter; label: string }[] = [
  { id: "30", label: "Letzte 30 Tage" },
  { id: "90", label: "Letzte 90 Tage" },
  { id: "365", label: "Letzte 12 Monate" },
];

export function FilterBar({
  filters,
  onChange,
  onReset,
  filteredStationCount,
}: FilterBarProps) {
  // Available stations filtered by selected region
  const availableStations = STATIONS.filter(
    (s) => filters.region === "all" || s.region === filters.region
  );

  const hasActiveCustomFilters =
    filters.region !== "all" ||
    filters.stationId !== "all" ||
    filters.fuelType !== "all" ||
    filters.period !== "30";

  return (
    <div className="bg-white rounded-xl border border-agrola-border px-3.5 py-2.5 shadow-subtle">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        {/* Left Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-agrola-forest mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span className="uppercase tracking-wider text-[10px]">Filter:</span>
          </div>

          {/* Region Dropdown */}
          <div className="relative">
            <select
              value={filters.region}
              onChange={(e) => {
                const nextRegion = e.target.value as "all" | SwissRegion;
                onChange({
                  ...filters,
                  region: nextRegion,
                  // If current station not in new region, reset stationId to all
                  stationId:
                    filters.stationId !== "all"
                      ? STATIONS.find(
                          (s) =>
                            s.id === filters.stationId &&
                            (nextRegion === "all" || s.region === nextRegion)
                        )
                        ? filters.stationId
                        : "all"
                      : "all",
                });
              }}
              className="appearance-none bg-agrola-canvas hover:bg-[#EAEFEA] text-agrola-ink font-medium text-xs rounded-lg pl-3 pr-8 py-2 border border-agrola-border focus:outline-none focus:ring-1 focus:ring-agrola-forest cursor-pointer transition-colors"
            >
              <option value="all">Alle Regionen (Schweiz)</option>
              {REGIONS.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-agrola-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Station Dropdown */}
          <div className="relative">
            <select
              value={filters.stationId}
              onChange={(e) =>
                onChange({ ...filters, stationId: e.target.value })
              }
              className="appearance-none bg-agrola-canvas hover:bg-[#EAEFEA] text-agrola-ink font-medium text-xs rounded-lg pl-3 pr-8 py-2 border border-agrola-border focus:outline-none focus:ring-1 focus:ring-agrola-forest cursor-pointer transition-colors max-w-[210px] truncate"
            >
              <option value="all">
                Alle Standorte ({availableStations.length})
              </option>
              {availableStations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.canton})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-agrola-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Fuel Product Selector */}
          <div className="relative">
            <select
              value={filters.fuelType}
              onChange={(e) =>
                onChange({
                  ...filters,
                  fuelType: e.target.value as "all" | FuelType,
                })
              }
              className="appearance-none bg-agrola-canvas hover:bg-[#EAEFEA] text-agrola-ink font-medium text-xs rounded-lg pl-3 pr-8 py-2 border border-agrola-border focus:outline-none focus:ring-1 focus:ring-agrola-forest cursor-pointer transition-colors"
            >
              {FUEL_TYPES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-agrola-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Period Button Group */}
          <div className="inline-flex rounded-lg border border-agrola-border bg-agrola-canvas p-0.5">
            {PERIODS.map((p) => {
              const isSelected = filters.period === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => onChange({ ...filters, period: p.id })}
                  className={clsx(
                    "px-2.5 py-1.5 text-xs font-semibold rounded-md transition-all",
                    isSelected
                      ? "bg-agrola-forest text-white shadow-xs"
                      : "text-agrola-ink hover:text-agrola-forest hover:bg-white/60"
                  )}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Status / Reset */}
        <div className="flex items-center gap-2">
          {hasActiveCustomFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Zurücksetzen</span>
            </button>
          )}

          {filteredStationCount !== undefined && (
            <div className="text-[11px] font-mono text-agrola-muted bg-agrola-canvas px-2.5 py-1 rounded-md border border-agrola-border/70">
              {filteredStationCount} {filteredStationCount === 1 ? "Standort" : "Standorte"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
