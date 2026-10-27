"use client";

import {
  AudioLines, Calculator, Clock3, Clapperboard, Code2, FileText, Gamepad2, Star,
  GraduationCap, Grid2X2, HeartPulse, Image as ImageIcon, LayoutGrid, Network,
  Palette, Ruler, Search, Share2, ShieldCheck, ShoppingBag, Sparkles, Type,
  Wallet, X,
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
};

type SidebarProps = {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onCloseMobileNav: () => void;
  isMobileOpen: boolean;
};

export default function Sidebar({ categories, activeCategory, onSelectCategory, onCloseMobileNav, isMobileOpen }: SidebarProps) {
  return (
    <>
      {isMobileOpen && <button aria-label="Close category menu" onClick={onCloseMobileNav} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
      <aside className={`fixed bottom-0 left-0 top-[116px] z-50 w-[290px] overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 md:top-[72px] lg:sticky lg:top-[72px] lg:z-10 lg:block lg:h-[calc(100vh-72px)] lg:w-[270px] lg:shrink-0 lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="mb-5 flex items-center justify-between px-2 lg:hidden">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Browse categories</span>
          <button type="button" onClick={onCloseMobileNav} aria-label="Close menu" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"><X size={18} /></button>
        </div>
        <div className="mb-3 flex items-center justify-between px-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Tool categories</p>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">20 categories</span>
        </div>
        <nav aria-label="Tool categories" className="space-y-1">
          {categories.map((category) => {
            const Icon = iconMap[category.icon] ?? Grid2X2;
            const active = activeCategory === category.name;
            return (
              <button
                key={category.name}
                type="button"
                onClick={() => onSelectCategory(category.name)}
                aria-current={active ? "page" : undefined}
                className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${active ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"}`}
              >
                <Icon size={17} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
                <span className="min-w-0 flex-1 leading-5">{category.name}</span>
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600 dark:bg-violet-400" />}
              </button>
            );
          })}
        </nav>

        <div className="my-6 border-t border-slate-100 dark:border-slate-800" />
        <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
          <div className="mb-3 inline-flex rounded-lg bg-white/15 p-2"><Grid2X2 size={18} aria-hidden="true" /></div>
          <p className="text-sm font-semibold">One place for everyday tools</p>
          <p className="mt-1.5 text-xs leading-5 text-violet-100">Browse the complete toolbox, from everyday essentials to specialist utilities.</p>
        </div>
        <p className="px-3 pb-2 pt-5 text-xs text-slate-400">Tool library · all categories</p>
      </aside>
    </>
  );
}
