"use client";

import React from "react";
import { Download, Menu, ShieldCheck } from "lucide-react";
import { NavSection } from "./Sidebar";

interface HeaderProps {
  currentSection: NavSection;
  onOpenMobileNav: () => void;
  onExportCsv: () => void;
  isExporting?: boolean;
}

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
  onOpenMobileNav,
  onExportCsv,
  isExporting = false,
}: HeaderProps) {
  const { eyebrow, title, subtitle } = SECTION_TITLES[currentSection];

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-agrola-border">
      <div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-lg bg-white border border-agrola-border text-agrola-forest hover:bg-agrola-canvas"
            aria-label="Navigation öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-[10px] font-bold tracking-widest uppercase text-agrola-forest flex items-center gap-1.5">
              <span>{eyebrow}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-agrola-ink mt-0.5">
              {title}
            </h1>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-agrola-muted mt-1 max-w-2xl">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Synthetischer Datensatz (Demo)</span>
        </div>

        <button
          onClick={onExportCsv}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white text-agrola-ink border border-agrola-border hover:bg-[#F2F5F0] hover:border-[#CBD3CB] active:scale-[0.98] text-xs font-semibold shadow-subtle transition-all duration-150 disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5 text-agrola-forest" />
          <span>{isExporting ? "Generiere..." : "CSV Export"}</span>
        </button>
      </div>
    </header>
  );
}
