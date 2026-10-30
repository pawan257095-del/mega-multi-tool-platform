"use client";

import { Box, Download, Menu, Moon, Search, Sun, X, Compass, LayoutGrid } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type InstallPromptChoice = { outcome: "accepted" | "dismissed"; platform?: string };
type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<InstallPromptChoice> };
type HeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMobileNav: () => void;
};

export default function Header({ query, onQueryChange, isDark, onToggleTheme, onToggleMobileNav }: HeaderProps) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
  useEffect(() => {
    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const onPrompt = (event: Event) => { event.preventDefault(); setInstallPrompt(event as InstallPromptEvent); };
    const onInstalled = () => { setIsInstalled(true); setInstallPrompt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);
  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setInstallPrompt(null);
    } else setShowInstallHelp(true);
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/75 shadow-[0_1px_0_rgba(15,23,42,.02)] backdrop-blur-2xl transition-colors duration-300 dark:border-slate-800/70 dark:bg-slate-950/75">
      <div className="mx-auto flex min-h-[76px] w-full max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" aria-label="Toolbox home" className="group flex shrink-0 items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25 ring-1 ring-white/60 transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105"><Box size={25} strokeWidth={2.2} /></span>
          <span><span className="block text-[19px] font-extrabold leading-5 tracking-tight text-slate-900 dark:text-white">Toolbox</span><span className="mt-1 hidden text-[10px] font-medium tracking-wide text-slate-500 sm:block dark:text-slate-400">Mega Multi Tool Platform</span></span>
        </Link>
        <label className="relative mx-auto hidden w-full max-w-xl lg:block"><span className="sr-only">Search tools</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={query} onChange={e => onQueryChange(e.target.value)} placeholder="Search tools (e.g. PDF to Word, image resize...)" className="h-11 w-full rounded-full border border-slate-200/70 bg-slate-100/80 pl-11 pr-4 text-sm text-slate-800 outline-none transition-all duration-300 placeholder:text-slate-400 hover:bg-slate-200/50 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-500/70 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:bg-slate-900 dark:focus:bg-slate-900" /></label>
        <nav className="ml-auto hidden items-center gap-1 xl:flex"><a href="#categories" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800"><Compass size={16}/> Categories</a><a href="#popular-tools" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-100 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800"><LayoutGrid size={16}/> Explore tools</a></nav>
        <div className="ml-auto flex shrink-0 items-center gap-2 xl:ml-0"><button type="button" onClick={onToggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 dark:hover:bg-slate-800">{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>{!isInstalled && <button type="button" onClick={installApp} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md sm:px-4"><Download size={16}/><span className="hidden sm:inline">Install App</span></button>}<button type="button" onClick={onToggleMobileNav} aria-label="Open navigation menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 transition-all duration-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300 xl:hidden"><Menu size={19}/></button></div>
      </div>
      <div className="border-t border-slate-200/50 bg-white/50 px-4 py-2 backdrop-blur-xl lg:hidden dark:border-slate-800/60 dark:bg-slate-950/50"><label className="relative block"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input type="search" value={query} onChange={e => onQueryChange(e.target.value)} placeholder="Search tools (PDF, image, JSON...)" className="h-10 w-full rounded-xl border border-slate-200/80 bg-white/80 pl-9 pr-4 text-sm outline-none transition-all duration-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white"/></label></div>
      {showInstallHelp && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowInstallHelp(false); }}><section role="dialog" aria-modal="true" aria-labelledby="header-install-help-title" className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"><div className="flex items-start justify-between gap-4"><div><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><Download size={21}/></span><h2 id="header-install-help-title" className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">Install Toolbox</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your browser has not made its one-tap install prompt available yet.</p></div><button type="button" aria-label="Close install instructions" onClick={() => setShowInstallHelp(false)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18}/></button></div><div className="mt-5 space-y-3 text-sm text-slate-700 dark:text-slate-200"><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="font-bold">Chrome / Edge on desktop</p><p className="mt-1 text-slate-600 dark:text-slate-300">Use the install icon in the address bar, or browser menu → <strong>Install Toolbox</strong> / <strong>Apps → Install this site as an app</strong>.</p></div><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="font-bold">Android</p><p className="mt-1 text-slate-600 dark:text-slate-300">Browser menu → <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p></div><div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/70"><p className="font-bold">iPhone / iPad</p><p className="mt-1 text-slate-600 dark:text-slate-300">Safari Share button → <strong>Add to Home Screen</strong>.</p></div></div><p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">One-tap installation is controlled by the browser and usually requires HTTPS (or localhost during development). A website cannot force installation if the browser does not provide the prompt.</p><button type="button" onClick={() => setShowInstallHelp(false)} className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700">Got it</button></section></div>}

    </header>
  );
}
