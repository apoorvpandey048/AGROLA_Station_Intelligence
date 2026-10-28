"use client";

import React, { useState } from "react";
import { AggregatedStationMetrics } from "@/types";
import { SwissStationMap } from "./SwissStationMap";
import { MapPin, Search } from "lucide-react";
import clsx from "clsx";

interface FullMapViewProps {
  rankings: AggregatedStationMetrics[];
  activeSubview?: string;
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  onGoToAnalytics: (stationId: string) => void;
}

export function FullMapView({
  rankings,
  activeSubview = "karte",
  selectedStationId,
  onSelectStation,
  onGoToAnalytics,
}: FullMapViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filteredRankings = rankings.filter((r) => {
    const matchesSearch =
      r.station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.station.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.station.canton.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterType === "all" || r.station.type === filterType;

    return matchesSearch && matchesType;
  });

  if (activeSubview === "karte") {
    return (
      <div key="karte" className="animate-subview h-full min-h-0">
        <SwissStationMap
          rankings={rankings}
          selectedStationId={selectedStationId}
          onSelectStation={onSelectStation}
          onGoToAnalytics={onGoToAnalytics}
          fillHeight
          showStationDetail
        />
      </div>
    );
  }

  return (
    <div key="verzeichnis" className="animate-subview h-full min-h-0">
      {/* Station Directory & GIS Filter */}
      <div className="bg-white rounded-xl border border-agrola-border p-5 shadow-subtle h-full flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-agrola-border mb-4 shrink-0">
          <div>
            <h3 className="text-base font-bold text-agrola-ink flex items-center gap-2">
              <MapPin className="w-4 h-4 text-agrola-forest" />
              <span>Standortverzeichnis ({filteredRankings.length} von {rankings.length})</span>
            </h3>
            <p className="text-xs text-agrola-muted mt-0.5">
              Direktsuche nach Ort, Kanton oder Standorttyp zur Fokussierung auf der Karte
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-agrola-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Station oder Ort suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-agrola-canvas border border-agrola-border rounded-lg text-xs text-agrola-ink placeholder:text-agrola-muted focus:outline-none focus:ring-1 focus:ring-agrola-forest w-[200px]"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-agrola-canvas border border-agrola-border rounded-lg px-3 py-1.5 text-agrola-ink font-medium"
            >
              <option value="all">Alle Standorttypen</option>
              <option value="Autobahn">Autobahn</option>
              <option value="Hauptstrasse">Hauptstrasse</option>
              <option value="Gewerbezone">Gewerbezone</option>
              <option value="Stadt">Stadt</option>
            </select>
          </div>
        </div>

        {/* Station Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 min-h-0 overflow-y-auto pr-0.5 content-start stagger-children">
          {filteredRankings.map((r) => {
            const isSelected = r.station.id === selectedStationId;
            return (
              <div
                key={r.station.id}
                onClick={() => onSelectStation(r.station.id)}
                className={clsx(
                  "p-3.5 rounded-lg border cursor-pointer flex flex-col justify-between lift",
                  isSelected
                    ? "bg-[#F3F7F2] border-agrola-forest shadow-xs ring-1 ring-agrola-forest"
                    : "bg-agrola-canvas/50 border-agrola-border hover:bg-agrola-canvas hover:shadow-card"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-white text-agrola-muted border border-agrola-border">
                      {r.station.id}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                      {r.station.type}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-agrola-ink truncate">
                    {r.station.name}
                  </h4>
                  <div className="text-[11px] text-agrola-muted mt-0.5">
                    {r.station.city} ({r.station.canton}) · {r.station.region}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-agrola-border/60 flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-agrola-muted block">Umsatz</span>
                    <span className="font-bold text-agrola-ink">
                      CHF {(r.totalRevenue / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-agrola-muted block">Marge</span>
                    <span className="font-bold text-emerald-700">
                      {r.avgMarginPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
