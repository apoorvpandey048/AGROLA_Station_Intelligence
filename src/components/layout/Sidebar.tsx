"use client";

import React from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  TrendingUp,
  Sliders,
  Database,
  ExternalLink,
} from "lucide-react";

export type NavSection = "overview" | "map" | "stations" | "pricing" | "forecast";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  className?: string;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  currentSection,
  onSelectSection,
  className,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const navItems: { id: NavSection; label: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: "overview",
      label: "Netzwerk-Übersicht",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: "map",
      label: "Interaktive Karte",
      icon: <MapPin className="w-4 h-4" />,
      badge: "28 Stationen",
    },
    {
      id: "stations",
      label: "Standortanalyse",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "pricing",
      label: "Preise & Margen",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: "forecast",
      label: "Prognose & Szenarien",
      icon: <Sliders className="w-4 h-4" />,
      badge: "Simulator",
    },
  ];

  const handleNavClick = (id: NavSection) => {
    onSelectSection(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#142C23] text-white flex flex-col justify-between border-r border-[#1F3D32] transition-transform duration-300 lg:translate-x-0",
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="p-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#214336]">
            <div className="w-10 h-10 rounded-xl bg-agrola-lime text-agrola-forest flex items-center justify-center font-black text-xl shadow-md">
              A
            </div>
            <div>
              <div className="font-extrabold tracking-wider text-base text-white">
                AGROLA
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-widest text-emerald-300/80">
                Station Intelligence
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="mt-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/60 px-3 mb-2">
              Analytik & Disposition
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 text-left",
                      isActive
                        ? "bg-[#235040] text-white shadow-sm ring-1 ring-emerald-400/30"
                        : "text-emerald-100/70 hover:bg-[#1B382D] hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={clsx(isActive ? "text-agrola-lime" : "text-emerald-300/60")}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-white/10 text-emerald-200 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Swiss Industrial System Status Panel */}
        <div className="p-5 border-t border-[#1F3D32] bg-[#0F231C]">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-agrola-lime opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-agrola-lime"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wide text-emerald-200">
              Demo-Cockpit Aktiv
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-200/60">
            28 Schweizer Standorte mit 365 Tagen deterministischer Simulation. Reale Berechnungslogik (Reconciliation).
          </p>
          <div className="mt-3 pt-3 border-t border-[#1F3D32]/60 flex items-center justify-between text-[10px] text-emerald-300/50 font-mono">
            <span>v2.4 · AGALITH CH</span>
            <span className="flex items-center gap-1">
              <Database className="w-3 h-3" /> REST API
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
