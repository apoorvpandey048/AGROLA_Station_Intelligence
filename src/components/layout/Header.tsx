"use client";

import React from "react";
import { Download, Menu, ShieldCheck, CalendarDays, BarChart2, Hash } from "lucide-react";
import { NavSection } from "./Sidebar";
import { SegmentedControl, SegmentedItem } from "@/components/ui/SegmentedControl";

interface HeaderProps {
  currentSection: NavSection;
  subviews: SegmentedItem[];
  currentSubview: string;
  onSelectSubview: (id: string) => void;
  onOpenMobileNav: () => void;
  onExportCsv: () => void;
  isExporting?: boolean;
  layoutMode?: "kpi-first" | "plots-first";
  onToggleLayoutMode?: (mode: "kpi-first" | "plots-first") => void;
}

/** Reference as-of date of the deterministic dataset (see lib/data/generator.ts). */
const DATA_AS_OF = "15.10.2026";

const SECTION_TITLES: Record<NavSection, { eyebrow: string; title: string; subtitle: string }> = {
  overview: {
    eyebrow: "Netzwerk-Analytik / Schweiz",
    title: "Tankstellen Cockpit",
    subtitle: "Strategische Übersicht über Standortperformance, Treibstoffabsatz und Margenentwicklung",
  },
  map: {
    eyebrow: "Geografisches Informationssystem",
    title: "Schweizer Standortnetzwerk",
    subtitle: "Interaktive Gebietsabdeckung, Standortkennzahlen und regionale Leistungsverteilung",
  },
  stations: {
    eyebrow: "Detail- & Benchmark-Analytik",
    title: "Standortanalyse & Vergleich",
    subtitle: "Tiefenprüfung einzelner Tankstellen mit Produktmix, Betriebskosten und Mehrfachvergleich",
  },
  pricing: {
    eyebrow: "Handelsspannen & Preisarchitektur",
    title: "Treibstoffpreise & Margenspannen",
    subtitle: "Verkaufspreise vs. Beschaffungskosten nach Kraftstoffsorte und Marktregion",
  },
  forecast: {
    eyebrow: "Entscheidungsunterstützung & Simulation",
    title: "Prognose & Preisszenario-Simulator",
    subtitle: "Prädiktive Nachfragehochrechnung und interaktive Simulation von Preisanpassungen",
  },
};

export function Header({
  currentSection,
  subviews,
  currentSubview,
  onSelectSubview,
  onOpenMobileNav,
  onExportCsv,
  isExporting = false,
  layoutMode = "kpi-first",
  onToggleLayoutMode,
}: HeaderProps) {
  const { eyebrow, title, subtitle } = SECTION_TITLES[currentSection];

  return (
    <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
      {/* Left: compact section identity */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-lg bg-white border border-agrola-border text-agrola-forest hover:bg-agrola-canvas transition-colors shrink-0"
          aria-label="Navigation öffnen"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <div className="text-[10px] font-bold tracking-widest uppercase text-agrola-forest">
            {eyebrow}
          </div>
          <div className="flex items-baseline gap-2.5 min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-agrola-ink truncate">
              {title}
            </h1>
            <p className="hidden 2xl:block text-xs text-agrola-muted truncate max-w-md">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: contextual subview tabs (primary) + utility cluster */}
      <div className="flex items-center gap-2.5 flex-wrap xl:justify-end">
        {/* Contextual subview switcher */}
        <SegmentedControl
          items={subviews}
          value={currentSubview}
          onChange={onSelectSubview}
          ariaLabel="Ansicht wechseln"
        />

        <div className="hidden xl:block h-6 w-px bg-agrola-border" aria-hidden="true" />

        {/* Data freshness chip */}
        <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-agrola-canvas text-agrola-muted border border-agrola-border text-[11px] font-medium">
          <CalendarDays className="w-3.5 h-3.5 text-agrola-forest" />
          <span>Daten per {DATA_AS_OF}</span>
        </div>

        {/* Layout order toggle (demoted, icon-forward) */}
        {onToggleLayoutMode && (
          <SegmentedControl
            size="sm"
            ariaLabel="Anordnung: Zahlen oder Plots zuerst"
            value={layoutMode}
            onChange={(id) => onToggleLayoutMode(id as "kpi-first" | "plots-first")}
            items={[
              { id: "kpi-first", label: "Zahlen", icon: <Hash className="w-3 h-3" />, title: "Zahlen & KPIs zuerst" },
              { id: "plots-first", label: "Plots", icon: <BarChart2 className="w-3 h-3" />, title: "Grafiken zuerst" },
            ]}
          />
        )}

        {/* Demo dataset badge (condensed on small screens) */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="hidden sm:inline">Synthetischer Datensatz (Demo)</span>
          <span className="sm:hidden">Demo</span>
        </div>

        <button
          onClick={onExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-agrola-ink border border-agrola-border hover:bg-[#F2F5F0] hover:border-[#CBD3CB] active:scale-[0.98] text-xs font-semibold shadow-subtle transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agrola-forest/40"
        >
          <Download className="w-3.5 h-3.5 text-agrola-forest" />
          <span>{isExporting ? "Generiere..." : "CSV Export"}</span>
        </button>
      </div>
    </header>
  );
}
