"use client";

import Fuse from "fuse.js";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { categories } from "@/data/categories";
import { tools } from "@/data/tools";
import type { Tool } from "@/data/tools";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import ToolCard from "@/components/tool-card";

type AppShellProps = { children: React.ReactNode };

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [queryPathname, setQueryPathname] = useState(pathname);

if (queryPathname !== pathname) {
  setQueryPathname(pathname);
  setQuery("");
}
  const [activeCategory, setActiveCategory] = useState(() => {
  if (typeof window === "undefined") return "All tools";

  const savedCategory = window.sessionStorage.getItem("toolbox-active-category");

  if (
    savedCategory &&
    (categories.some((category) => category.name === savedCategory) ||
      savedCategory === "Popular tools")
  ) {
    return savedCategory;
  }

  return "All tools";
});
  const [isDark, setIsDark] = useState(() => {
  if (typeof window === "undefined") return false;

  const savedTheme = window.localStorage.getItem("toolbox-theme");
  return savedTheme
    ? savedTheme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  

  useEffect(() => {
    window.sessionStorage.setItem("toolbox-active-category", activeCategory);
  }, [activeCategory]);

 

  useEffect(() => {
    // Give every enabled button a visible post-press pulse, including buttons in
    // tool components. This is visual feedback only and does not replace each
    // tool's own success/error status message.
    const timers = new WeakMap<HTMLButtonElement, number>();
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!(button instanceof HTMLButtonElement) || button.disabled) return;
      button.dataset.justPressed = "true";
      const previous = timers.get(button);
      if (previous !== undefined) window.clearTimeout(previous);
      const timer = window.setTimeout(() => {
        delete button.dataset.justPressed;
        timers.delete(button);
      }, 560);
      timers.set(button, timer);
    };
    document.addEventListener("click", handleButtonClick, true);
    return () => document.removeEventListener("click", handleButtonClick, true);
  }, []);

 useEffect(() => {
  document.documentElement.classList.toggle("dark", isDark);
}, [isDark]);

  const fuse = useMemo(
    () => new Fuse<Tool>(tools, {
      keys: ["name", "description", "category", "keywords"],
      threshold: 0.36,
      ignoreLocation: true,
    }),
    [],
  );

  const visibleTools = useMemo(() => {
    const searched = query.trim()
      ? fuse.search(query.trim()).map((result) => result.item)
      : tools;
    return searched.filter((tool) => {
      if (activeCategory === "All tools") return true;
      if (activeCategory === "Popular tools") return Boolean(tool.popular);
      return tool.category === activeCategory;
    });
  }, [activeCategory, fuse, query]);

  function toggleTheme() {
    const nextDark = !isDark;
    document.documentElement.classList.toggle("dark", nextDark);
    window.localStorage.setItem("toolbox-theme", nextDark ? "dark" : "light");
    setIsDark(nextDark);
  }

  function chooseCategory(category: string) {
    setActiveCategory(category);
    window.sessionStorage.setItem("toolbox-active-category", category);
    setQuery("");
    setMobileNavOpen(false);

    // Categories remain usable while a tool is open. Return to the tool library
    // and show the selected category without requiring the browser Back button.
    if (pathname !== "/") router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        query={query}
        onQueryChange={setQuery}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onToggleMobileNav={() => setMobileNavOpen((open) => !open)}
      />
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1">
        <Sidebar
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={chooseCategory}
          onCloseMobileNav={() => setMobileNavOpen(false)}
          isMobileOpen={mobileNavOpen}
        />
        <main className="min-w-0 flex-1" id="main-content">
          {pathname === "/" && (query.trim() || activeCategory !== "All tools") ? (
            <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Tool library</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {query.trim() ? "Search results" : activeCategory}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {visibleTools.length} {visibleTools.length === 1 ? "tool" : "tools"} found
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setQuery(""); setActiveCategory("All tools"); }}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >Clear filters</button>
              </div>
              {visibleTools.length ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visibleTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
                  <p className="font-semibold text-slate-900 dark:text-white">No matching tools found</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try another search term or select a different category.</p>
                </div>
              )}
            </div>
          ) : children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
