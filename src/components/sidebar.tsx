"use client";

import {
  AudioLines, Calculator, Clock3, Clapperboard, Code2, FileText, Gamepad2, Star,
  GraduationCap, Grid2X2, HeartPulse, Image as ImageIcon, LayoutGrid, Network,
  Palette, Ruler, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, Type,
  Wallet, X, ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Category } from "@/data/categories";

const iconMap: Record<string, LucideIcon> = {
  "layout-grid": LayoutGrid, "file-text": FileText, image: ImageIcon, type: Type,
  "code-2": Code2, search: Search, calculator: Calculator, "audio-lines": AudioLines,
  network: Network, wallet: Wallet, ruler: Ruler, palette: Palette, "share-2": Share2,
  "shield-check": ShieldCheck, sparkles: Sparkles, "graduation-cap": GraduationCap,
  "heart-pulse": HeartPulse, "shopping-bag": ShoppingBag, clapperboard: Clapperboard,
  "gamepad-2": Gamepad2, "clock-3": Clock3, "grid-2x2": Grid2X2, star: Star,
  terminal: Code2,
};

type SidebarProps = {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onCloseMobileNav: () => void;
  isMobileOpen: boolean;
};

export default function Sidebar({
  categories, activeCategory, onSelectCategory, onCloseMobileNav, isMobileOpen,
}: SidebarProps) {
  return (
    <>
      {isMobileOpen && <button aria-label="Close category menu" onClick={onCloseMobileNav} className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm lg:hidden" />}
      <aside className={`fixed bottom-0 left-0 top-[128px] z-50 w-[290px] overflow-y-auto border-r border-slate-200/60 bg-white/80 p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-xl transition-all duration-300 ease-out dark:border-slate-800/80 dark:bg-slate-900/80 dark:shadow-black/25 md:top-[76px] lg:sticky lg:top-[76px] lg:z-10 lg:block lg:h-[calc(100vh-76px)] lg:w-[270px] lg:shrink-0 lg:translate-x-0 lg:shadow-none ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
          <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Browse categories</span>
          <button type="button" onClick={onCloseMobileNav} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-500 transition-all duration-300 ease-out hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Explore toolbox</p>
          <span className="rounded-full border border-slate-200/80 bg-white/70 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-400">{categories.length - 2}+</span>
        </div>
        <nav aria-label="Tool categories" className="space-y-1">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Grid2X2;
            const active = activeCategory === category.name;
            return (
              <button key={category.name} type="button" onClick={() => onSelectCategory(category.name)}
                aria-current={active ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-300 ease-out ${active ? "border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50/70 font-semibold text-blue-700 shadow-sm shadow-blue-500/5 dark:border-blue-900/70 dark:from-blue-950/70 dark:to-indigo-950/40 dark:text-blue-300" : "border-transparent text-slate-600 hover:border-slate-200/80 hover:bg-white/80 hover:text-slate-950 dark:text-slate-400 dark:hover:border-slate-800 dark:hover:bg-slate-950/60 dark:hover:text-white"}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ease-out ${active ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-slate-100/80 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 dark:bg-slate-800/80 dark:text-slate-400 dark:group-hover:bg-blue-950 dark:group-hover:text-blue-300"}`}>
                  <Icon size={16} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 leading-5">{category.name}</span>
                {active ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 dark:bg-blue-400" /> : <ChevronRight size={14} className="shrink-0 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 dark:text-slate-600" />}
              </button>
            );
          })}
        </nav>
        <div className="my-6 border-t border-slate-200/70 dark:border-slate-800/80" />
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-600/15">
          <div aria-hidden="true" className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
          <div className="relative mb-3 inline-flex rounded-xl border border-white/15 bg-white/15 p-2 shadow-inner shadow-white/10"><Grid2X2 size={18} aria-hidden="true" /></div>
          <p className="relative text-sm font-bold">One place for everyday tools</p>
          <p className="relative mt-1.5 text-xs leading-5 text-blue-100">A focused collection of helpful utilities for work, study and daily tasks.</p>
        </div>
        <p className="px-3 pb-2 pt-5 text-[11px] font-medium text-slate-400">Toolbox · all in one place</p>
      </aside>
    </>
  );
}
