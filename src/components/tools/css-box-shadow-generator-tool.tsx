"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const presets = [
  { name: "Soft Card", x: 0, y: 8, blur: 24, spread: -4, opacity: 12, color: "#0F172A", inset: false, radius: 16 },
  { name: "Floating Panel", x: 0, y: 18, blur: 40, spread: -10, opacity: 18, color: "#334155", inset: false, radius: 24 },
  { name: "Neon Glow", x: 0, y: 0, blur: 28, spread: 2, opacity: 55, color: "#8B5CF6", inset: false, radius: 16 },
  { name: "Inset Well", x: 0, y: 3, blur: 8, spread: 0, opacity: 18, color: "#0F172A", inset: true, radius: 12 },
];
function rgba(hex: string, opacity: number) {
  const n = Number.parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${(opacity / 100).toFixed(2)})`;
}
function randomHex() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "#" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default function CssBoxShadowGeneratorTool() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(30);
  const [spread, setSpread] = useState(-4);
  const [opacity, setOpacity] = useState(18);
  const [color, setColor] = useState("#334155");
  const [inset, setInset] = useState(false);
  const [radius, setRadius] = useState(18);
  const [copied, setCopied] = useState(false);
  const shadow = useMemo(() => `${inset ? "inset " : ""}${x}px ${y}px ${blur}px ${spread}px ${rgba(color, opacity)}`, [x, y, blur, spread, opacity, color, inset]);
  const css = `box-shadow: ${shadow};\nborder-radius: ${radius}px;`;
  async function copy() {
    try { await navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { setCopied(false); }
  }
  function applyPreset(p: typeof presets[number]) {
    setX(p.x); setY(p.y); setBlur(p.blur); setSpread(p.spread); setOpacity(p.opacity); setColor(p.color); setInset(p.inset); setRadius(p.radius); setCopied(false);
  }
  function randomize() {
    setX(Math.floor(Math.random() * 41) - 20);
    setY(Math.floor(Math.random() * 41) - 10);
    setBlur(Math.floor(Math.random() * 51));
    setSpread(Math.floor(Math.random() * 21) - 10);
    setOpacity(Math.floor(Math.random() * 61) + 10);
    setColor(randomHex());
    setInset(Math.random() > 0.8);
    setRadius(Math.floor(Math.random() * 41));
    setCopied(false);
  }
  function reset() { setX(0); setY(12); setBlur(30); setSpread(-4); setOpacity(18); setColor("#334155"); setInset(false); setRadius(18); setCopied(false); }
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold text-slate-900 dark:text-white">Shadow controls</h2>
      <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Horizontal offset: {x}px<input className="mt-3 w-full accent-violet-600" type="range" min="-40" max="40" value={x} onChange={(e) => setX(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Vertical offset: {y}px<input className="mt-3 w-full accent-violet-600" type="range" min="-20" max="60" value={y} onChange={(e) => setY(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Blur radius: {blur}px<input className="mt-3 w-full accent-violet-600" type="range" min="0" max="80" value={blur} onChange={(e) => setBlur(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Spread radius: {spread}px<input className="mt-3 w-full accent-violet-600" type="range" min="-30" max="30" value={spread} onChange={(e) => setSpread(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Shadow opacity: {opacity}%<input className="mt-3 w-full accent-violet-600" type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} /></label>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Border radius: {radius}px<input className="mt-3 w-full accent-violet-600" type="range" min="0" max="100" value={radius} onChange={(e) => setRadius(Number(e.target.value))} /></label>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"><input type="checkbox" checked={inset} onChange={(e) => setInset(e.target.checked)} className="accent-violet-600" /> Inset shadow</label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">Shadow color <input type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} aria-label="Shadow color" className="h-9 w-12 rounded border border-slate-200 p-1 dark:border-slate-700" /></label>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied CSS" : "Copy CSS"}</button>
        <button type="button" onClick={randomize} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Shuffle size={15} /> Randomize</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    <section className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex h-44 w-full max-w-sm items-center justify-center border border-slate-200 bg-white text-center dark:border-slate-700 dark:bg-slate-900" style={{ boxShadow: shadow, borderRadius: `${radius}px` }}><div><p className="font-semibold text-slate-900 dark:text-white">Live preview</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Shadow + rounded corners</p></div></div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h2>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-slate-950 p-4 text-xs leading-6 text-emerald-300"><code>{css}</code></pre>
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Paste these declarations into a CSS rule. The preview is illustrative; final appearance depends on the element and surrounding layout.</p>
      </div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">Quick presets</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{presets.map((p) => <button type="button" key={p.name} onClick={() => applyPreset(p)} className="rounded-xl border border-slate-200 p-3 text-left dark:border-slate-700"><span className="mb-3 block h-16 rounded-lg bg-slate-100 dark:bg-slate-800" style={{ boxShadow: `${p.inset ? "inset " : ""}${p.x}px ${p.y}px ${p.blur}px ${p.spread}px ${rgba(p.color, p.opacity / 100 * 100)}`, borderRadius: `${p.radius}px` }} /><span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</span></button>)}</div>
    </section>
  </div>;
}
