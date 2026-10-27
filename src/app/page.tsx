import { ArrowUpRight, CheckCircle2, ShieldCheck, Sparkles, Zap } from "lucide-react";
import ToolCard from "@/components/tool-card";
import { tools } from "@/data/tools";

export default function HomePage() {
  const popularTools = tools.filter((tool) => tool.popular);
  const allTools = [...tools].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <section className="relative isolate overflow-hidden rounded-3xl border border-violet-100 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:px-9 sm:py-10 lg:px-11 lg:py-12">
        <div className="pointer-events-none absolute -right-14 -top-24 -z-10 h-64 w-64 rounded-full bg-violet-200/60 blur-3xl dark:bg-violet-800/20" />
        <div className="pointer-events-none absolute -bottom-28 right-1/3 -z-10 h-52 w-52 rounded-full bg-sky-100 blur-3xl dark:bg-sky-900/20" />
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300">
            <Sparkles size={14} aria-hidden="true" /> Your everyday digital toolbox
          </span>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
            Less busywork. <span className="text-violet-600 dark:text-violet-400">More getting done.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            A growing collection of simple tools for documents, images, text, code, and everyday calculations—organized in one fast, easy-to-use workspace.
          </p>
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-950/50">
              <Zap size={17} className="mt-0.5 shrink-0 text-amber-500" aria-hidden="true" />
              <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Simple by design</p><p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Clear steps, fewer distractions.</p></div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-950/50">
              <ShieldCheck size={17} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Privacy-minded</p><p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Prefer local processing where practical.</p></div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white/75 p-3 dark:border-slate-700 dark:bg-slate-950/50">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-violet-600" aria-hidden="true" />
              <div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">No account for basics</p><p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">Planned for lightweight tools.</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-9" aria-labelledby="popular-tools-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Start here</p>
            <h2 id="popular-tools-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">Popular tools</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Frequently used tools from across the entire toolbox.</p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">{popularTools.length} popular tools <ArrowUpRight size={16} aria-hidden="true" /></span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {popularTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </section>

      <section className="mt-12" aria-labelledby="all-tools-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Complete library</p>
            <h2 id="all-tools-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">All tools</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse every available tool in one place, or use search and categories to narrow the list.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{allTools.length} tools</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allTools.map((tool) => <ToolCard key={tool.id} tool={tool} />)}
        </div>
      </section>
    </div>
  );
}
