"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

type AutoFlow = "row" | "column" | "row dense" | "column dense";
type Align = "stretch" | "start" | "center" | "end";
const defaults = { columns: 3, rows: 2, columnGap: 12, rowGap: 12, autoFlow: "row" as AutoFlow, justifyItems: "stretch" as Align, alignItems: "stretch" as Align, count: 8 };

export default function CssGridPlaygroundTool() {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const css = `.grid-container {\n  display: grid;\n  grid-template-columns: repeat(${values.columns}, minmax(0, 1fr));\n  grid-template-rows: repeat(${values.rows}, minmax(70px, auto));\n  grid-auto-flow: ${values.autoFlow};\n  justify-items: ${values.justifyItems};\n  align-items: ${values.alignItems};\n  column-gap: ${values.columnGap}px;\n  row-gap: ${values.rowGap}px;\n}`;
  function update<K extends keyof typeof defaults>(key: K, value: (typeof defaults)[K]) {
    setValues(current => ({ ...current, [key]: value }));
    setCopied(false);
  }
  function reset() { setValues(defaults); setCopied(false); }
  async function copyCss() {
    try { await navigator.clipboard.writeText(css); setCopied(true); }
    catch { setCopied(false); }
  }
  const selectClass = "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";
  const rangeClass = "mt-4 w-full accent-violet-600";
  const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-200";
  const alignOptions: Align[] = ["stretch", "start", "center", "end"];
  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Grid controls</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adjust the grid tracks, spacing, flow, and item alignment.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div><label htmlFor="grid-columns" className={labelClass}>Columns <span className="font-mono text-violet-600 dark:text-violet-300">{values.columns}</span></label><input id="grid-columns" className={rangeClass} type="range" min="1" max="6" value={values.columns} onChange={e => update("columns", Number(e.target.value))}/></div>
        <div><label htmlFor="grid-rows" className={labelClass}>Rows <span className="font-mono text-violet-600 dark:text-violet-300">{values.rows}</span></label><input id="grid-rows" className={rangeClass} type="range" min="1" max="5" value={values.rows} onChange={e => update("rows", Number(e.target.value))}/></div>
        <div><label htmlFor="grid-column-gap" className={labelClass}>Column gap <span className="font-mono text-violet-600 dark:text-violet-300">{values.columnGap}px</span></label><input id="grid-column-gap" className={rangeClass} type="range" min="0" max="40" value={values.columnGap} onChange={e => update("columnGap", Number(e.target.value))}/></div>
        <div><label htmlFor="grid-row-gap" className={labelClass}>Row gap <span className="font-mono text-violet-600 dark:text-violet-300">{values.rowGap}px</span></label><input id="grid-row-gap" className={rangeClass} type="range" min="0" max="40" value={values.rowGap} onChange={e => update("rowGap", Number(e.target.value))}/></div>
        <div><label htmlFor="grid-flow" className={labelClass}>Auto flow</label><select id="grid-flow" className={selectClass} value={values.autoFlow} onChange={e => update("autoFlow", e.target.value as AutoFlow)}>{(["row", "column", "row dense", "column dense"] as AutoFlow[]).map(option => <option key={option}>{option}</option>)}</select></div>
        <div><label htmlFor="grid-justify" className={labelClass}>Justify items</label><select id="grid-justify" className={selectClass} value={values.justifyItems} onChange={e => update("justifyItems", e.target.value as Align)}>{alignOptions.map(option => <option key={option}>{option}</option>)}</select></div>
        <div><label htmlFor="grid-align" className={labelClass}>Align items</label><select id="grid-align" className={selectClass} value={values.alignItems} onChange={e => update("alignItems", e.target.value as Align)}>{alignOptions.map(option => <option key={option}>{option}</option>)}</select></div>
        <div><label htmlFor="grid-count" className={labelClass}>Preview items <span className="font-mono text-violet-600 dark:text-violet-300">{values.count}</span></label><input id="grid-count" className={rangeClass} type="range" min="1" max="18" value={values.count} onChange={e => update("count", Number(e.target.value))}/></div>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The preview includes implicit rows or columns when there are more items than explicit tracks.</p>
      <div className="mt-5 overflow-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"><div style={{ display: "grid", gridTemplateColumns: `repeat(${values.columns}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${values.rows}, minmax(70px, auto))`, gridAutoFlow: values.autoFlow, justifyItems: values.justifyItems, alignItems: values.alignItems, columnGap: `${values.columnGap}px`, rowGap: `${values.rowGap}px` }} className="rounded-lg border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-900 dark:bg-violet-950/30">{Array.from({ length: values.count }, (_, i) => <div key={i} className="flex min-h-[58px] w-full items-center justify-center rounded-lg border border-violet-200 bg-white px-2 py-3 text-sm font-bold text-violet-700 shadow-sm dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300">{i + 1}</div>)}</div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={() => void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied CSS" : "Copy CSS"}</button></div><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre>
    </section>
    <p className="text-xs text-slate-500 dark:text-slate-400">Preview and CSS generation run locally in your browser. No data is uploaded.</p>
  </div>;
}
