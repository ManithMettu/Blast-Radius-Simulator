"use client";

import { Activity, Menu } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";

export function Header() {
  const setMobileOpen = useSidebarStore((state) => state.setMobileOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Platform overview
          </p>
          <p className="hidden text-sm text-slate-700 sm:block">
            Model dependencies, simulate failures, analyze blast radius
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
        <Activity className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Live system view</span>
        <span className="sm:hidden">Live</span>
      </div>
    </header>
  );
}
