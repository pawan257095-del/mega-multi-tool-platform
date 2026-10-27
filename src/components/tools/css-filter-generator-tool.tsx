"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

const defaults = { blur: 0, brightness: 100, contrast: 100, grayscale: 0, hue: 0, invert: 0, saturate: 100, sepia: 0, opacity: 100 };
type FilterKey = keyof typeof defaults;

export default function CssFilterGeneratorTool() {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<"landscape" | "gradient">("landscape");
  const filter = useMemo(() => `blur(${values.blur}px) brightness(${values.brightness}%) contrast(${values.contrast}%) grayscale(${values.grayscale}%) hue-rotate(${values.hue}deg) invert(${values.invert}%) saturate(${values.saturate}%) sepia(${values.sepia}%) opacity(${values.opacity}%)`, [values]);
  const css = `.filtered-image {\n  filter: ${filter};\n}`;
  const controls: { key: FilterKey; label: string; min: number; max: number; unit: string; step?: number }[] = [
    { key: "blur", label: "Blur", min: 0, max: 20, unit: "px", step: 0.5 },
    { key: "brightness", label: "Brightness", min: 0, max: 200, unit: "%" },
    { key: "contrast", label: "Contrast", min: 0, max: 200, unit: "%" },
    { key: "grayscale", label: "Grayscale", min: 0, max: 100, unit: "%" },
    { key: "hue", label: "Hue rotate", min: 0, max: 360, unit: "deg" },
    { key: "invert", label: "Invert", min: 0, max: 100, unit: "%" },
    { key: "saturate", label: "Saturation", min: 0, max: 300, unit: "%" },
    { key: "sepia", label: "Sepia", min: 0, max: 100, unit: "%" },
    { key: "opacity", label: "Opacity", min: 0, max: 100, unit: "%" },
  ];
  function update(key: FilterKey, value: number) { setValues(current => ({ ...current, [key]: value })); setCopied(false); }
  function reset() { setValues(defaults); setCopied(false); }
  async function copyCss() { try { await navigator.clipboard.writeText(css); setCopied(true); } catch { setCopied(false); } }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Filter controls</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the sliders to combine multiple CSS filter functions.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{controls.map(item => <div key={item.key}><label htmlFor={`filter-${item.key}`} className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{item.label}</span><span className="font-mono text-violet-600 dark:text-violet-300">{values[item.key]}{item.unit}</span></label><input id={`filter-${item.key}`} aria-label={item.label} className="mt-3 w-full accent-violet-600" type="range" min={item.min} max={item.max} step={item.step ?? 1} value={values[item.key]} onChange={e => update(item.key, Number(e.target.value))}/></div>)}</div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Switch the sample to compare filters on a photo-style image or a gradient.</p></div><div className="flex gap-2"><button type="button" onClick={() => setPreviewImage("landscape")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${previewImage === "landscape" ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>Landscape</button><button type="button" onClick={() => setPreviewImage("gradient")} className={`rounded-lg px-3 py-2 text-sm font-semibold ${previewImage === "gradient" ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>Gradient</button></div></div>
      <div className="mt-5 flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"><div aria-label="CSS filter sample preview" style={{ filter, background: previewImage === "landscape" ? "linear-gradient(165deg, transparent 48%, #14532d 49%), linear-gradient(135deg, #38bdf8 0%, #a5f3fc 40%, #fef3c7 41%, #f59e0b 68%, #166534 69%, #052e16 100%)" : "linear-gradient(135deg, #f43f5e 0%, #f59e0b 25%, #84cc16 50%, #06b6d4 75%, #8b5cf6 100%)" }} className="flex h-52 w-full max-w-2xl items-end justify-center rounded-xl p-5 shadow-lg transition-[filter] duration-150"><span className="rounded-lg bg-black/40 px-4 py-2 text-xl font-bold tracking-wide text-white">Filter Preview</span></div></div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={() => void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied CSS" : "Copy CSS"}</button></div><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Apply the <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">filtered-image</code> class to an image or other HTML element.</p>
    </section>
    <p className="text-xs text-slate-500 dark:text-slate-400">All filter calculations and previews run locally in your browser. No image is uploaded.</p>
  </div>;
}
