"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

export default function CssTransformGeneratorTool() {
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [rotate, setRotate] = useState(-8);
  const [scaleX, setScaleX] = useState(100);
  const [scaleY, setScaleY] = useState(100);
  const [skewX, setSkewX] = useState(0);
  const [skewY, setSkewY] = useState(0);
  const [copied, setCopied] = useState(false);
  const transform = `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${(scaleX / 100).toFixed(2)}, ${(scaleY / 100).toFixed(2)}) skew(${skewX}deg, ${skewY}deg)`;
  const css = useMemo(() => `.transformed-element {\n  transform: ${transform};\n  transform-origin: center;\n}`, [transform]);
  const sliders = [
    { label: "Translate X", value: translateX, min: -100, max: 100, unit: "px", set: setTranslateX },
    { label: "Translate Y", value: translateY, min: -100, max: 100, unit: "px", set: setTranslateY },
    { label: "Rotate", value: rotate, min: -180, max: 180, unit: "deg", set: setRotate },
    { label: "Scale X", value: scaleX, min: 25, max: 200, unit: "%", set: setScaleX },
    { label: "Scale Y", value: scaleY, min: 25, max: 200, unit: "%", set: setScaleY },
    { label: "Skew X", value: skewX, min: -45, max: 45, unit: "deg", set: setSkewX },
    { label: "Skew Y", value: skewY, min: -45, max: 45, unit: "deg", set: setSkewY },
  ];
  function reset() { setTranslateX(0); setTranslateY(0); setRotate(-8); setScaleX(100); setScaleY(100); setSkewX(0); setSkewY(0); setCopied(false); }
  async function copyCss() { try { await navigator.clipboard.writeText(css); setCopied(true); } catch { setCopied(false); } }
  const valueClass = "font-mono text-violet-600 dark:text-violet-300";

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transform controls</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adjust each transform operation independently.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{sliders.map(item => <div key={item.label}><label className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"><span>{item.label}</span><span className={valueClass}>{item.value}{item.unit}</span></label><input aria-label={item.label} className="mt-3 w-full accent-violet-600" type="range" min={item.min} max={item.max} step={item.label.startsWith("Scale") ? 5 : 1} value={item.value} onChange={e => { item.set(Number(e.target.value)); setCopied(false); }} /></div>)}</div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The preview updates as you move the sliders. Extreme transforms may extend beyond the preview area.</p><div className="mt-4 flex min-h-80 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-950"><div style={{ transform, transformOrigin: "center" }} className="flex h-32 w-44 items-center justify-center rounded-2xl border-2 border-violet-300 bg-gradient-to-br from-violet-600 to-fuchsia-600 p-4 text-center font-bold text-white shadow-xl">Transform me</div></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={() => void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied CSS" : "Copy CSS"}</button></div><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Apply the <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">transformed-element</code> class to your target element.</p></section>
    <p className="text-xs text-slate-500 dark:text-slate-400">All calculations and preview rendering run locally in your browser. No data is uploaded.</p>
  </div>;
}
