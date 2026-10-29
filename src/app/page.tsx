"use client";

import React, { useState, useMemo } from "react";
import {
  LayoutDashboard,
  LineChart,
  Globe2,
  Sparkles,
  Map as MapIcon,
  List,
  Building2,
  BarChart3,
  Layers,
  Gauge,
  BarChart2,
  Sliders,
  Table,
} from "lucide-react";
import { FilterState, SwissRegion } from "@/types";
import { getSyntheticDataset } from "@/lib/data/generator";
import {
  computeNetworkSummary,
  filterDataset,
} from "@/lib/analytics/calculations";
import { generateCsvExport, triggerDownload } from "@/lib/export/csv";
import { NavSection, Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { FilterBar } from "@/components/layout/FilterBar";
import { NetworkOverview } from "@/components/overview/NetworkOverview";
import { FullMapView } from "@/components/map/FullMapView";
import { StationAnalyticsView } from "@/components/stations/StationAnalyticsView";
import { PriceSalesView } from "@/components/pricing/PriceSalesView";
import { ForecastScenarioView } from "@/components/forecast/ForecastScenarioView";
import type { SegmentedItem } from "@/components/ui/SegmentedControl";

/**
 * Contextual subviews per sidebar section. Each section's content is split into
 * screen-sized subviews, switched from the top-right header without navigating away.
 * The first entry is the default subview selected whenever its section opens.
 */
const SUBVIEWS: Record<NavSection, SegmentedItem[]> = {
  overview: [
    { id: "uebersicht", label: "Übersicht", icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
    { id: "trends", label: "Trends", icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: "regionen", label: "Regionen", icon: <Globe2 className="w-3.5 h-3.5" /> },
    { id: "insights", label: "Insights", icon: <Sparkles className="w-3.5 h-3.5" /> },
  ],
  map: [
    { id: "karte", label: "Karte", icon: <MapIcon className="w-3.5 h-3.5" /> },
    { id: "verzeichnis", label: "Verzeichnis", icon: <List className="w-3.5 h-3.5" /> },
  ],
  stations: [
    { id: "profil", label: "Profil", icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: "benchmark", label: "Benchmark", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "vergleich", label: "Vergleich", icon: <Layers className="w-3.5 h-3.5" /> },
  ],
  pricing: [
    { id: "kennzahlen", label: "Kennzahlen", icon: <Gauge className="w-3.5 h-3.5" /> },
    { id: "preisvergleich", label: "Preisvergleich", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ],
  forecast: [
    { id: "simulation", label: "Simulation", icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: "sensitivitaet", label: "Sensitivität", icon: <Table className="w-3.5 h-3.5" /> },
  ],
};

export default function Home() {
  const [currentSection, setCurrentSection] = useState<NavSection>("overview");
  const [currentSubview, setCurrentSubview] = useState<string>(
    SUBVIEWS.overview[0].id
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"kpi-first" | "plots-first">("plots-first");

  // Switch sidebar section and reset to that section's default subview.
  const selectSection = (sec: NavSection) => {
    setCurrentSection(sec);
    setCurrentSubview(SUBVIEWS[sec][0].id);
  };

  // Drill down into a specific station's full analysis (from map / ranking / exceptions).
  const goToStationAnalysis = (id: string) => {
    setSelectedStationId(id);
    setCurrentSection("stations");
    setCurrentSubview("profil");
  };

  // Global Filter State
  const [filters, setFilters] = useState<FilterState>({
    region: "all",
    stationId: "all",
    fuelType: "all",
    period: "30",
    metricMode: "revenue",
  });

  // Selected station for details & map sync (defaults to Zurich or first top station)
  const [selectedStationId, setSelectedStationId] = useState<string>("AGR-301");

  // In-memory deterministic dataset (12 months of daily Swiss station data)
  const allRecords = useMemo(() => getSyntheticDataset(), []);

  // Filter current and prior comparable records
  const { currentRecords, prevRecords } = useMemo(
    () => filterDataset(allRecords, filters),
    [allRecords, filters]
  );

  // Reconciled network executive summary
  const summary = useMemo(
    () => computeNetworkSummary(currentRecords, prevRecords, filters),
    [currentRecords, prevRecords, filters]
  );

  // CSV Export action
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const csv = generateCsvExport(currentRecords, ";");
      const filename = `agrola_cockpit_export_${filters.period}d_${filters.region}_${Date.now()}.csv`;
      triggerDownload(csv, filename);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setTimeout(() => setIsExporting(false), 400);
    }
  };

  const periodLabels: Record<string, string> = {
    "30": "Letzte 30 Tage",
    "90": "Letzte 90 Tage",
    "365": "Letzte 12 Monate",
  };

  const activePeriodLabel = periodLabels[filters.period] || "Letzte 30 Tage";

  return (
    <div className="h-[100dvh] overflow-hidden bg-agrola-canvas flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={selectSection}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* 2. Main Executive Content Column (fixed-height cockpit frame) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 h-[100dvh]">
        {/* Top bar: compact header + global filters (does not grow) */}
        <div className="shrink-0 border-b border-agrola-border/70 bg-agrola-canvas/75 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_16px_-12px_rgba(24,38,32,0.25)]">
          <div className="px-4 lg:px-6 pt-4 pb-3 w-full max-w-[1700px] mx-auto">
          <Header
            currentSection={currentSection}
            subviews={SUBVIEWS[currentSection]}
            currentSubview={currentSubview}
            onSelectSubview={setCurrentSubview}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            onExportCsv={handleExportCsv}
            isExporting={isExporting}
            layoutMode={layoutMode}
            onToggleLayoutMode={setLayoutMode}
          />

          <div className="mt-3">
            <FilterBar
              filters={filters}
              onChange={(newFilters) => {
                setFilters(newFilters);
                if (newFilters.stationId !== "all") {
                  setSelectedStationId(newFilters.stationId);
                }
              }}
              onReset={() =>
                setFilters({
                  region: "all",
                  stationId: "all",
                  fuelType: "all",
                  period: "30",
                  metricMode: "revenue",
                })
              }
              filteredStationCount={summary.activeStationsCount}
            />
          </div>
          </div>
        </div>

        {/* Content region: fills remaining viewport height, no page-level scroll */}
        <main className="flex-1 min-h-0 overflow-hidden px-4 lg:px-6 pt-4 pb-4 w-full max-w-[1700px] mx-auto">
          <div key={currentSection} className="h-full">
            {currentSection === "overview" && (
              <NetworkOverview
                summary={summary}
                activeSubview={currentSubview}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                onGoToAnalytics={goToStationAnalysis}
                onOpenFullMap={() => selectSection("map")}
                periodLabel={activePeriodLabel}
                activeRegion={filters.region !== "all" ? filters.region : undefined}
                onSelectRegion={(reg) =>
                  setFilters({ ...filters, region: reg as SwissRegion, stationId: "all" })
                }
                layoutMode={layoutMode}
              />
            )}

            {currentSection === "map" && (
              <FullMapView
                rankings={summary.rankings}
                activeSubview={currentSubview}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                onGoToAnalytics={goToStationAnalysis}
              />
            )}

            {currentSection === "stations" && (
              <StationAnalyticsView
                rankings={summary.rankings}
                activeSubview={currentSubview}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                periodLabel={activePeriodLabel}
                onBack={() => selectSection("overview")}
                layoutMode={layoutMode}
              />
            )}

            {currentSection === "pricing" && (
              <PriceSalesView
                rankings={summary.rankings}
                productMix={summary.productMix}
                activeSubview={currentSubview}
                periodLabel={activePeriodLabel}
                layoutMode={layoutMode}
              />
            )}

            {currentSection === "forecast" && (
              <ForecastScenarioView
                timeSeries={summary.timeSeries}
                activeSubview={currentSubview}
                currentAvgPrice={summary.weightedAvgPrice}
                currentAvgCost={
                  summary.weightedAvgPrice * (1 - summary.avgMarginPercent / 100)
                }
                layoutMode={layoutMode}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
