"use client";

import React, { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { AggregatedStationMetrics } from "@/types";
import { Maximize2 } from "lucide-react";
import { fmtCH } from "@/lib/format";

interface MapInnerProps {
  rankings: AggregatedStationMetrics[];
  selectedStationId: string | null;
  onSelectStation: (stationId: string) => void;
  metricMode: "revenue" | "volume" | "margin" | "price";
}

// Bounding box for Switzerland [[south, west], [north, east]]
const SWISS_BOUNDS: [[number, number], [number, number]] = [
  [45.81, 5.95],
  [47.81, 10.49],
];
const SWISS_CENTER: [number, number] = [46.8182, 8.2275];
const DEFAULT_ZOOM = 8;

// Map controller to handle user-triggered centering and reset to Swiss overview
function MapController({
  selectedStation,
  userInteractedRef,
}: {
  selectedStation?: AggregatedStationMetrics;
  userInteractedRef: React.MutableRefObject<boolean>;
}) {
  const map = useMap();

  // On first mount, fit bounds to the entire Swiss territory so all 28 stations show!
  useEffect(() => {
    map.fitBounds(SWISS_BOUNDS, { padding: [20, 20] });
  }, [map]);

  // Only pan when the user explicitly interacted (clicked a station), NOT on initial load!
  useEffect(() => {
    if (userInteractedRef.current && selectedStation) {
      map.flyTo(
        [selectedStation.station.lat, selectedStation.station.lng],
        10,
        { duration: 0.7 }
      );
    }
  }, [selectedStation, map, userInteractedRef]);

  return null;
}

// Custom UI Button inside map to reset view to whole Switzerland
function ResetViewButton() {
  const map = useMap();
  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: 12, marginRight: 12, zIndex: 1000 }}>
      <button
        onClick={() => map.fitBounds(SWISS_BOUNDS, { padding: [20, 20], duration: 0.6 })}
        className="leaflet-bar bg-white text-agrola-forest font-bold text-xs px-3 py-1.5 rounded-lg shadow-md border border-agrola-border hover:bg-agrola-canvas flex items-center gap-1.5 cursor-pointer pointer-events-auto transition-colors"
        title="Ganze Schweiz anzeigen"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        <span>Ganze Schweiz</span>
      </button>
    </div>
  );
}

// Create custom SVG Leaflet DivIcon
function createPinIcon(
  metric: AggregatedStationMetrics,
  isSelected: boolean,
  metricMode: "revenue" | "volume" | "margin" | "price",
  maxMetricValue: number
) {
  let size = 30;
  let fillColor = "#173D30"; // default dark forest
  let valueLabel = "";

  if (metricMode === "revenue") {
    const ratio = maxMetricValue > 0 ? metric.totalRevenue / maxMetricValue : 0.5;
    size = Math.max(26, Math.min(48, Math.round(26 + ratio * 18)));
    fillColor = isSelected ? "#D9822B" : ratio > 0.8 ? "#1F5941" : "#173D30";
    valueLabel = (metric.totalRevenue / 1000).toFixed(0) + "k";
  } else if (metricMode === "volume") {
    const ratio = maxMetricValue > 0 ? metric.totalVolume / maxMetricValue : 0.5;
    size = Math.max(26, Math.min(48, Math.round(26 + ratio * 18)));
    fillColor = isSelected ? "#D9822B" : "#1E4C39";
    valueLabel = (metric.totalVolume / 1000).toFixed(0) + "k";
  } else if (metricMode === "margin") {
    fillColor = isSelected
      ? "#D9822B"
      : metric.avgMarginPercent >= 13
      ? "#237A4B"
      : metric.avgMarginPercent >= 11
      ? "#3B6955"
      : "#9E4738";
    size = 32;
    valueLabel = metric.avgMarginPercent.toFixed(1) + "%";
  } else {
    fillColor = isSelected ? "#D9822B" : "#2B463C";
    size = 30;
    valueLabel = metric.weightedAvgPrice.toFixed(2);
  }

  const borderStroke = isSelected ? "#FFFFFF" : "#B8D96B";
  const strokeWidth = isSelected ? 3.5 : 2;

  const html = `
    <div class="custom-leaflet-pin flex flex-col items-center justify-center cursor-pointer" style="width: ${size}px; height: ${size}px;">
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${fillColor};
        border: ${strokeWidth}px solid ${borderStroke};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: ${size > 36 ? "10px" : "9px"};
        font-weight: 700;
        font-family: var(--font-mono);
        box-shadow: 0 4px 14px rgba(24, 38, 32, 0.4);
      ">
        ${valueLabel}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-pin-wrapper",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function MapInner({
  rankings,
  selectedStationId,
  onSelectStation,
  metricMode,
}: MapInnerProps) {
  const userInteractedRef = useRef<boolean>(false);

  const maxVal = Math.max(
    ...rankings.map((r) =>
      metricMode === "revenue"
        ? r.totalRevenue
        : metricMode === "volume"
        ? r.totalVolume
        : r.avgMarginPercent
    ),
    1
  );

  const selectedStation = rankings.find(
    (r) => r.station.id === selectedStationId
  );

  const handleStationClick = (id: string) => {
    userInteractedRef.current = true;
    onSelectStation(id);
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[560px] rounded-xl overflow-hidden border border-agrola-border">
      <MapContainer
        center={SWISS_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        {/* 100% Free, high-precision ESRI World Light Gray Canvas with zero API key watermarks */}
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com/" target="_blank">Esri</a>, HERE, Garmin, &copy; OpenStreetMap'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />
        {/* Subtle reference layer for Swiss place names and transport corridors */}
        <TileLayer
          attribution=""
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        <MapController
          selectedStation={selectedStation}
          userInteractedRef={userInteractedRef}
        />

        <ResetViewButton />

        {rankings.map((r) => {
          const isSelected = r.station.id === selectedStationId;
          const icon = createPinIcon(r, isSelected, metricMode, maxVal);

          return (
            <Marker
              key={r.station.id}
              position={[r.station.lat, r.station.lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleStationClick(r.station.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -14]}
                opacity={0.96}
                className="bg-agrola-forest text-white text-xs rounded-md shadow-lg font-sans"
              >
                <div className="font-bold">{r.station.name}</div>
                <div className="text-[11px] opacity-90">
                  {r.station.city} ({r.station.canton}) · CHF{" "}
                  {fmtCH(r.totalRevenue)}
                </div>
              </Tooltip>

              <Popup>
                <div className="p-1 min-w-[210px]">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>{r.station.name}</span>
                    <span className="text-[10px] text-agrola-lime font-mono">
                      {r.station.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-200/80 mb-2">
                    {r.station.region} ({r.station.canton}) · {r.station.pumpsCount} Säulen
                  </div>
                  <div className="space-y-1 text-xs border-t border-white/10 pt-2 font-mono">
                    <div className="flex justify-between">
                      <span className="text-white/70">Umsatz:</span>
                      <span className="font-bold text-white">
                        CHF {fmtCH(r.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Absatz:</span>
                      <span className="text-white">
                        {fmtCH(r.totalVolume)} L
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Ø Verkaufspreis:</span>
                      <span className="text-agrola-lime font-bold">
                        CHF {r.weightedAvgPrice.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Bruttomarge:</span>
                      <span className="text-white">
                        {r.avgMarginPercent.toFixed(1)}% (CHF{" "}
                        {fmtCH(r.totalGrossMargin)})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStationClick(r.station.id)}
                    className="w-full mt-3 py-1.5 bg-agrola-lime text-agrola-forest text-xs font-bold rounded hover:bg-agrola-lime-bright transition-colors"
                  >
                    Standort analysieren →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
