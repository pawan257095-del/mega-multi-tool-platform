"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return { r: 109, g: 40, b: 217 };
  return { r: parseInt(clean.slice(0, 2), 16), g: parseInt(clean.slice(2, 4), 16), b: parseInt(clean.slice(4, 6), 16) };
}

export default function CssTextShadowGeneratorTool() {
  const [sample, setSample] = useState("Make it stand out!");
  const [x, setX] = useState(4);
  const [y, setY] = useState(4);
  const [blur, setBlur] = useState(8);
  const [color, setColor] = useState("#6d28d9");
  const [opacity, setOpacity] = useState(0.65);
  const [fontSize, setFontSize] = useState(42);
  const [copied, setCopied] = useState(false);
  const rgb = hexToRgb(color);
  const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity.toFixed(2)})`;
  const shadow = `${x}px ${y}px ${blur}px ${shadowColor}`;
  const css = useMemo(() => `.text-shadow-example {\n  text-shadow: ${shadow};\n}`, [shadow]);
  const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const labelClass = "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200";
  const sliders = [
    { label: "Horizontal offset", value: x, min: -30, max: 30, unit: "px", set: setX },
    { label: "Vertical offset", value: y, min: -30, max: 30, unit: "px", set: setY },
    { label: "Blur radius", value: blur, min: 0, max: 40, unit: "px", set: setBlur },
    { label: "Font size", value: fontSize, min: 16, max: 80, unit: "px", set: setFontSize },
    { label: "Shadow opacity", value: opacity, min: 0, max: 1, unit: "", set: setOpacity },
  ];
  function reset() { setSample("Make it stand out!"); setX(4); setY(4); setBlur(8); setColor("#6d28d9"); setOpacity(0.65); setFontSize(42); setCopied(false); }
  async function copyCss() { try { await navigator.clipboard.writeText(css); setCopied(true); } catch { setCopied(false); } }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Shadow settings</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Change the text and shadow properties to build your effect.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="shadow-sample">Preview text</label><input id="shadow-sample" maxLength={80} className={field} value={sample} onChange={e => { setSample(e.target.value); setCopied(false); }} /></div><div><label className={labelClass} htmlFor="shadow-color">Shadow color</label><div className="flex gap-2"><input id="shadow-color" aria-label="Shadow color picker" type="color" value={color} onChange={e => { setColor(e.target.value); setCopied(false); }} className="h-10 w-12 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/><input aria-label="Shadow color HEX" className={field} value={color} onChange={e => { setColor(e.target.value); setCopied(false); }} /></div></div></div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{sliders.map(item => <div key={item.label}><label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200"><span>{item.label}</span><span className="font-mono text-violet-600 dark:text-violet-300">{item.label === "Shadow opacity" ? item.value.toFixed(2) : `${item.value}${item.unit}`}</span></label><input aria-label={item.label} className="mt-3 w-full accent-violet-600" type="range" min={item.min} max={item.max} step={item.label === "Shadow opacity" ? 0.05 : 1} value={item.value} onChange={e => { item.set(Number(e.target.value)); setCopied(false); }} /></div>)}</div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">The text below updates as you adjust the settings.</p><div className="mt-4 flex min-h-52 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-950"><span style={{ textShadow: shadow, fontSize, fontWeight: 800, lineHeight: 1.25, overflowWrap: "anywhere" }} className="text-slate-900 dark:text-white">{sample || "Preview text"}</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={() => void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied CSS" : "Copy CSS"}</button></div><pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Add the class <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">text-shadow-example</code> to the text element you want to style.</p></section>
    <p className="text-xs text-slate-500 dark:text-slate-400">All preview rendering and CSS generation run locally in your browser. No text or settings are uploaded.</p>
  </div>;
}
