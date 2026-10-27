"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

type Direction = "row" | "row-reverse" | "column" | "column-reverse";
type Justify = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
type Align = "stretch" | "flex-start" | "center" | "flex-end" | "baseline";
type Wrap = "nowrap" | "wrap" | "wrap-reverse";
const defaults = { direction: "row" as Direction, justify: "center" as Justify, align: "center" as Align, wrap: "wrap" as Wrap, gap: 12, count: 6, minHeight: 260 };

export default function CssFlexboxPlaygroundTool() {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const css = `.flex-container {\n  display: flex;\n  flex-direction: ${values.direction};\n  justify-content: ${values.justify};\n  align-items: ${values.align};\n  flex-wrap: ${values.wrap};\n  gap: ${values.gap}px;\n}`;
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
  const labels: { key: "direction" | "justify" | "align" | "wrap"; label: string; options: string[] }[] = [
    { key: "direction", label: "Flex direction", options: ["row", "row-reverse", "column", "column-reverse"] },
    { key: "justify", label: "Justify content", options: ["flex-start", "center", "flex-end", "space-between", "space-around", "space-evenly"] },
    { key: "align", label: "Align items", options: ["stretch", "flex-start", "center", "flex-end", "baseline"] },
    { key: "wrap", label: "Flex wrap", options: ["nowrap", "wrap", "wrap-reverse"] },
  ];
  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Layout controls</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change container properties to understand how Flexbox distributes items.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {labels.map(item => <div key={item.key}><label htmlFor={`flex-${item.key}`} className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</label><select id={`flex-${item.key}`} className={selectClass} value={values[item.key]} onChange={e => update(item.key, e.target.value as never)}>{item.options.map(option => <option key={option} value={option}>{option}</option>)}</select></div>)}
        <div><label htmlFor="flex-gap" className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200"><span>Gap</span><span className="font-mono text-violet-600 dark:text-violet-300">{values.gap}px</span></label><input id="flex-gap" className="mt-4 w-full accent-violet-600" type="range" min="0" max="40" value={values.gap} onChange={e => update("gap", Number(e.target.value))}/></div>
        <div><label htmlFor="flex-count" className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200"><span>Number of items</span><span className="font-mono text-violet-600 dark:text-violet-300">{values.count}</span></label><input id="flex-count" className="mt-4 w-full accent-violet-600" type="range" min="2" max="12" value={values.count} onChange={e => update("count", Number(e.target.value))}/></div>
        <div><label htmlFor="flex-height" className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200"><span>Preview height</span><span className="font-mono text-violet-600 dark:text-violet-300">{values.minHeight}px</span></label><input id="flex-height" className="mt-4 w-full accent-violet-600" type="range" min="180" max="420" step="20" value={values.minHeight} onChange={e => update("minHeight", Number(e.target.value))}/></div>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Resize the browser window to see wrapping and alignment changes in action.</p>
      <div className="mt-5 overflow-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"><div style={{ display: "flex", flexDirection: values.direction, justifyContent: values.justify, alignItems: values.align, flexWrap: values.wrap, gap: `${values.gap}px`, minHeight: `${values.minHeight}px` }} className="rounded-lg border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-900 dark:bg-violet-950/30">{Array.from({ length: values.count }, (_, i) => <div key={i} style={{ minWidth: values.direction.startsWith("column") ? "auto" : "72px", minHeight: 56 + (i % 3) * 10 }} className="flex shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white px-4 py-3 text-sm font-bold text-violet-700 shadow-sm dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300">{i + 1}</div>)}</div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={() => void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied CSS" : "Copy CSS"}</button></div><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre>
    </section>
    <p className="text-xs text-slate-500 dark:text-slate-400">Preview and CSS generation run locally in your browser. No data is uploaded.</p>
  </div>;
}
