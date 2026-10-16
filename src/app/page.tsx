"use client";

import React, { useState, useMemo } from "react";
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

export default function Home() {
  const [currentSection, setCurrentSection] = useState<NavSection>("overview");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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
    <div className="min-h-screen bg-agrola-canvas flex">
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
      />

      {/* 2. Main Executive Content Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Header */}
          <Header
            currentSection={currentSection}
            onOpenMobileNav={() => setIsMobileNavOpen(true)}
            onExportCsv={handleExportCsv}
            isExporting={isExporting}
          />

          {/* Global Filter Bar */}
          <div className="mt-6">
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

          {/* Dynamic Section Switcher */}
          <div className="mt-6">
            {currentSection === "overview" && (
              <NetworkOverview
                summary={summary}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                onGoToAnalytics={(id) => {
                  setSelectedStationId(id);
                  setCurrentSection("stations");
                }}
                periodLabel={activePeriodLabel}
                activeRegion={filters.region !== "all" ? filters.region : undefined}
                onSelectRegion={(reg) =>
                  setFilters({ ...filters, region: reg as SwissRegion, stationId: "all" })
                }
              />
            )}

            {currentSection === "map" && (
              <FullMapView
                rankings={summary.rankings}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                onGoToAnalytics={(id) => {
                  setSelectedStationId(id);
                  setCurrentSection("stations");
                }}
              />
            )}

            {currentSection === "stations" && (
              <StationAnalyticsView
                rankings={summary.rankings}
                selectedStationId={selectedStationId}
                onSelectStation={(id) => setSelectedStationId(id)}
                periodLabel={activePeriodLabel}
              />
            )}

            {currentSection === "pricing" && (
              <PriceSalesView
                rankings={summary.rankings}
                productMix={summary.productMix}
                periodLabel={activePeriodLabel}
              />
            )}

            {currentSection === "forecast" && (
              <ForecastScenarioView
                timeSeries={summary.timeSeries}
                currentAvgPrice={summary.weightedAvgPrice}
                currentAvgCost={
                  summary.weightedAvgPrice * (1 - summary.avgMarginPercent / 100)
                }
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
