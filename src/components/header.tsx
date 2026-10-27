"use client";

import { Command, Download, Menu, Moon, Search, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

type InstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform?: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<InstallPromptChoice>;
};

type HeaderProps = {
  query: string;
  onQueryChange: (query: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onToggleMobileNav: () => void;
};

export default function Header({ query, onQueryChange, isDark, onToggleTheme, onToggleMobileNav }: HeaderProps) {
  const [installPrompt, setInstallPrompt] =
  useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(
  () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(
        (navigator as Navigator & { standalone?: boolean }).standalone,
      )),
);

  useEffect(() => {
    
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setIsInstalled(true);
      setInstallPrompt(null);
      return;
    }
    window.alert("To install Toolbox, use your browser menu: in Microsoft Edge choose Apps > Install this site as an app, or in Chrome choose Save and share > Install page as app / Create shortcut.");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-[72px] w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          aria-label="Toggle categories menu"
          onClick={onToggleMobileNav}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden"
        >
          <Menu size={19} aria-hidden="true" />
        </button>
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Toolbox home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-600/20">
            <Command size={19} strokeWidth={2.4} aria-hidden="true" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">toolbox<span className="text-violet-600 dark:text-violet-400">.</span></span>
        </Link>

        <label className="relative mx-auto hidden w-full max-w-xl md:block">
          <span className="sr-only">Search tools</span>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            name="tool-library-search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tools… try ‘PDF’, ‘image’, or ‘JSON’"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-violet-700 dark:focus:bg-slate-900"
          />
          {query ? (
            <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
              <X size={16} />
            </button>
          ) : <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 xl:block dark:border-slate-700">LIVE SEARCH</span>}
        </label>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          {!isInstalled && <button type="button" onClick={installApp} aria-label="Install Toolbox app" title="Install Toolbox app" className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300 dark:hover:bg-violet-950">
            <Download size={16} aria-hidden="true" /><span className="hidden sm:inline">Install app</span>
          </button>}
          <button type="button" onClick={onToggleTheme} aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
            {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
          </button>
        </div>
      </div>
      <div className="border-t border-slate-100 px-4 py-2.5 md:hidden dark:border-slate-900">
        <label className="relative block">
          <span className="sr-only">Search tools</span>
          <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            name="tool-library-search-mobile"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search tools…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-slate-800 dark:bg-slate-900"
          />
          {query && <button type="button" onClick={() => onQueryChange("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}
        </label>
      </div>
    </header>
  );
}
