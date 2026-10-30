"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import type { Tool } from "@/data/tools";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ToolCard from "@/components/tool-card";
import { LayoutGrid, Heart, Home, Layers, Download, X } from "lucide-react";

type AppShellProps = { children: React.ReactNode };

declare global { interface WindowEventMap { "toolbox:search": CustomEvent<string>; "toolbox:category": CustomEvent<string>; "toolbox:install": CustomEvent<void>; } }

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All tools");
  const [isDark, setIsDark] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeNavPulse, setActiveNavPulse] = useState<string>("home");
  useEffect(() => {
    const savedTheme = window.localStorage.getItem("toolbox-theme");
    const dark = savedTheme ? savedTheme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(dark); document.documentElement.classList.toggle("dark", dark);

    const recordView = (view: string, nextQuery = "") => {
      const historyState = { ...(window.history.state ?? {}), toolboxView: view, toolboxQuery: nextQuery };
      if (window.location.pathname === "/") {
        // Add an in-app history entry so Android/browser Back restores the previous tab/view.
        window.history.pushState(historyState, "", window.location.href);
      } else {
        router.push("/");
        window.setTimeout(() => {
          window.history.replaceState({ ...(window.history.state ?? {}), toolboxView: view, toolboxQuery: nextQuery }, "", window.location.href);
        }, 80);
      }
    };

    const onSearch = (event: CustomEvent<string>) => {
      const nextQuery = event.detail;
      setQuery(nextQuery);
      setActiveCategory("All tools");
      setActiveNavPulse("all-tools");
      recordView("All tools", nextQuery);
    };
    const onCategory = (event: CustomEvent<string>) => {
      const nextView = event.detail;
      setActiveCategory(nextView);
      setQuery("");
      setActiveNavPulse(nextView === "Browse all tools" ? "all-tools" : nextView === "Browse categories" || (nextView !== "All tools" && nextView !== "Popular tools") ? "categories" : nextView === "Popular tools" ? "popular" : "home");
      recordView(nextView, "");
    };
    const onPopState = (event: PopStateEvent) => {
      const state = event.state as { toolboxView?: string; toolboxQuery?: string } | null;
      const restoredView = state?.toolboxView ?? "All tools";
      const restoredQuery = state?.toolboxQuery ?? "";
      setActiveCategory(restoredView);
      setQuery(restoredQuery);
      setActiveNavPulse(restoredQuery ? "all-tools" : restoredView === "Browse all tools" ? "all-tools" : restoredView === "Browse categories" || (restoredView !== "All tools" && restoredView !== "Popular tools") ? "categories" : restoredView === "Popular tools" ? "popular" : "home");
    };
    window.addEventListener("toolbox:search", onSearch);
    window.addEventListener("toolbox:category", onCategory);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("toolbox:search", onSearch);
      window.removeEventListener("toolbox:category", onCategory);
      window.removeEventListener("popstate", onPopState);
    };
  }, [pathname, router]);
  useEffect(() => { document.documentElement.classList.toggle("dark", isDark); }, [isDark]);
  const fuse = useMemo(() => new Fuse<Tool>(tools, { keys: ["name", "description", "category", "keywords"], threshold: 0.36, ignoreLocation: true }), []);
  const visibleTools = useMemo(() => {
    const searched = query.trim() ? fuse.search(query.trim()).map(result => result.item) : tools;
    return searched.filter(tool => activeCategory === "All tools" || activeCategory === "Browse all tools" || activeCategory === "Browse categories" || (activeCategory === "Popular tools" ? Boolean(tool.popular) : tool.category === activeCategory));
  }, [activeCategory, fuse, query]);
  function toggleTheme() { const next = !isDark; setIsDark(next); window.localStorage.setItem("toolbox-theme", next ? "dark" : "light"); }
  function changeQuery(value: string) { setQuery(value); setActiveCategory("All tools"); setActiveNavPulse(value.trim() ? "all-tools" : "home"); }
  const showResults = pathname === "/" && (query.trim().length > 0 || activeCategory !== "All tools");
  const browsingCategories = activeCategory === "Browse categories" && !query.trim();
  const pageTitle = query.trim() ? "Search results" : browsingCategories ? "Explore all categories" : activeCategory === "Browse all tools" || activeCategory === "All tools" ? "All tools" : activeCategory;
  return <div className="flex min-h-screen flex-col bg-slate-50/50 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-50">
    <Header query={query} onQueryChange={changeQuery} isDark={isDark} onToggleTheme={toggleTheme} onToggleMobileNav={() => setMobileNavOpen(open => !open)}/>
    {mobileNavOpen && <div className="fixed inset-x-3 top-[7.5rem] z-50 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xl sm:inset-x-auto sm:right-6 sm:w-72 dark:border-slate-800 dark:bg-slate-900/95"><div className="mb-2 flex items-center justify-between px-2"><span className="text-sm font-semibold">Explore Toolbox</span><button onClick={() => setMobileNavOpen(false)} aria-label="Close menu" className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={17}/></button></div>{[{label:"All tools",value:"All tools"},{label:"Popular tools",value:"Popular tools"},...categories.filter(c => !["All tools","Popular tools"].includes(c.name)).slice(0,8).map(c => ({label:c.name,value:c.name}))].map(item => <button key={item.value} onClick={() => {window.dispatchEvent(new CustomEvent("toolbox:category",{detail:item.value === "All tools" ? "Browse all tools" : item.value}));setMobileNavOpen(false);}} className="block w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-slate-300 dark:hover:bg-slate-800">{item.label}</button>)}</div>}
    <main id="main-content" className="relative mx-auto w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
      {showResults ? <section className="min-h-[65vh] py-8 pb-28 md:pb-10"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600 dark:text-indigo-400">Tool library</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">{pageTitle}</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{browsingCategories ? `${categories.filter(category => !["All tools", "Popular tools"].includes(category.name)).length} categories to explore` : `${visibleTools.length} ${visibleTools.length === 1 ? "tool" : "tools"} found`}</p></div><button onClick={() => {setQuery("");setActiveCategory("All tools");}} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Back to home</button></div>{browsingCategories ? <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.filter(category => !["All tools", "Popular tools"].includes(category.name)).map(category => { const count = tools.filter(tool => tool.category === category.name).length; return <button key={category.name} onClick={() => {setActiveCategory(category.name); setQuery("");}} className={`group relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${["border-rose-100 bg-gradient-to-br from-white to-rose-50/80 hover:border-rose-200 hover:shadow-rose-500/10 dark:border-rose-900/50 dark:from-slate-900 dark:to-rose-950/30", "border-sky-100 bg-gradient-to-br from-white to-sky-50/80 hover:border-sky-200 hover:shadow-sky-500/10 dark:border-sky-900/50 dark:from-slate-900 dark:to-sky-950/30", "border-emerald-100 bg-gradient-to-br from-white to-emerald-50/80 hover:border-emerald-200 hover:shadow-emerald-500/10 dark:border-emerald-900/50 dark:from-slate-900 dark:to-emerald-950/30", "border-amber-100 bg-gradient-to-br from-white to-amber-50/80 hover:border-amber-200 hover:shadow-amber-500/10 dark:border-amber-900/50 dark:from-slate-900 dark:to-amber-950/30"][categories.indexOf(category) % 4]}` }><span className="flex items-center justify-between gap-3"><span className="font-bold tracking-tight">{category.name}</span><LayoutGrid size={18} className="text-indigo-500 transition-transform duration-300 group-hover:scale-110"/></span><span className="mt-2 block text-sm text-slate-500 dark:text-slate-400">{category.description}</span><span className="mt-3 inline-flex rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">{count} {count === 1 ? "tool" : "tools"}</span></button>; })}</div> : visibleTools.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleTools.map(tool => <ToolCard key={tool.id} tool={tool}/>)}</div> : <div className="rounded-3xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-slate-700"><p className="font-semibold">No matching tools found</p><p className="mt-1 text-sm text-slate-500">Try another search or category.</p></div>}</section> : children}
    </main>
    {pathname !== "/" && <Footer/>}
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 items-end border-t border-slate-200/70 bg-white/90 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(15,23,42,.06)] backdrop-blur-xl md:hidden dark:border-slate-800/80 dark:bg-slate-950/92 dark:shadow-black/20">
      <button type="button" aria-current={activeNavPulse === "home" ? "page" : undefined} onClick={() => window.dispatchEvent(new CustomEvent("toolbox:category", { detail: "All tools" }))} className={`group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] transition-all duration-200 active:scale-95 ${activeNavPulse === "home" ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-900"}`}>
        <span className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${activeNavPulse === "home" ? "bg-blue-50 shadow-sm dark:bg-blue-950/60" : ""}`}><Home size={19} className={activeNavPulse === "home" ? "fill-blue-600/10" : ""}/></span><span>Home</span>
      </button>
      <button type="button" aria-current={activeNavPulse === "all-tools" ? "page" : undefined} onClick={() => window.dispatchEvent(new CustomEvent("toolbox:category", { detail: "Browse all tools" }))} className={`group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] transition-all duration-200 active:scale-95 ${activeNavPulse === "all-tools" ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-900"}`}>
        <span className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${activeNavPulse === "all-tools" ? "bg-blue-50 shadow-sm dark:bg-blue-950/60" : ""}`}><LayoutGrid size={19}/></span><span>All Tools</span>
      </button>
      <button type="button" aria-label="Install Toolbox" onClick={() => window.dispatchEvent(new CustomEvent("toolbox:install"))} className="-mt-6 flex flex-col items-center gap-1 text-[10px] font-semibold text-blue-600 transition-transform duration-200 active:scale-95 dark:text-blue-400"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 text-white shadow-lg shadow-blue-600/30 ring-4 ring-slate-50 transition-all duration-200 hover:scale-105 dark:ring-slate-950"><Download size={21}/></span><span>Install</span></button>
      <button type="button" aria-current={activeNavPulse === "categories" ? "page" : undefined} onClick={() => window.dispatchEvent(new CustomEvent("toolbox:category", { detail: "Browse categories" }))} className={`group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] transition-all duration-200 active:scale-95 ${activeNavPulse === "categories" ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-900"}`}>
        <span className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${activeNavPulse === "categories" ? "bg-blue-50 shadow-sm dark:bg-blue-950/60" : ""}`}><Layers size={19}/></span><span>Categories</span>
      </button>
      <button type="button" aria-current={activeNavPulse === "popular" ? "page" : undefined} onClick={() => window.dispatchEvent(new CustomEvent("toolbox:category", { detail: "Popular tools" }))} className={`group flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1 text-[10px] transition-all duration-200 active:scale-95 ${activeNavPulse === "popular" ? "font-bold text-blue-600 dark:text-blue-400" : "font-medium text-slate-500 hover:bg-slate-100/80 dark:text-slate-400 dark:hover:bg-slate-900"}`}>
        <span className={`flex h-8 w-10 items-center justify-center rounded-xl transition-all duration-200 ${activeNavPulse === "popular" ? "bg-blue-50 shadow-sm dark:bg-blue-950/60" : ""}`}><Heart size={19} className={activeNavPulse === "popular" ? "fill-blue-600/10" : ""}/></span><span>Popular</span>
      </button>
    </nav>
  </div>;
}
