"use client";

import { useMemo, useState } from "react";
import { Copy, Check, Download, RotateCcw, Shuffle } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const presets = [
  { name: "Sunset", a: "#F97316", b: "#DB2777", angle: 135 },
  { name: "Ocean", a: "#06B6D4", b: "#1D4ED8", angle: 120 },
  { name: "Forest", a: "#84CC16", b: "#047857", angle: 135 },
  { name: "Lavender", a: "#C084FC", b: "#6366F1", angle: 135 },
];
const hexPattern = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function validHex(value: string) { return hexPattern.test(value.trim()); }
function normalizeHex(value: string) {
  const clean = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(clean)) return "#" + clean.slice(1).split("").map((c) => c + c).join("").toUpperCase();
  return clean.toUpperCase();
}
function randomHex() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "#" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export default function GradientGeneratorTool() {
  const [first, setFirst] = useState("#7C3AED");
  const [second, setSecond] = useState("#06B6D4");
  const [angle, setAngle] = useState(135);
  const [kind, setKind] = useState("linear");
  const [position, setPosition] = useState(50);
  const [copied, setCopied] = useState(false);
  const valid = validHex(first) && validHex(second);
  const css = useMemo(() => {
    const a = normalizeHex(first), b = normalizeHex(second);
    if (!validHex(first) || !validHex(second)) return "";
    if (kind === "radial") return `background: radial-gradient(circle, ${a} 0%, ${b} 100%);`;
    return `background: linear-gradient(${angle}deg, ${a} 0%, ${b} ${position}%, ${a} 100%);`;
  }, [first, second, angle, kind, position]);
  async function copy() {
    if (!css) return;
    try { await navigator.clipboard.writeText(css); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { setCopied(false); }
  }
  function applyPreset(p: typeof presets[number]) { setFirst(p.a); setSecond(p.b); setAngle(p.angle); setKind("linear"); setPosition(50); }
  function randomize() { setFirst(randomHex()); setSecond(randomHex()); setAngle(Math.floor(Math.random() * 361)); setPosition(50); }
  function exportCss() {
    if (!css) return;
    const blob = new Blob([`.gradient-preview {\n  ${css}\n}\n`], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "gradient.css"; a.click();
    URL.revokeObjectURL(url);
  }
  function reset() { setFirst("#7C3AED"); setSecond("#06B6D4"); setAngle(135); setKind("linear"); setPosition(50); setCopied(false); }
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">First color (HEX)
          <div className="mt-2 flex gap-2"><input className={`${inputClass} font-mono uppercase`} value={first} onChange={(e) => setFirst(e.target.value)} aria-invalid={!validHex(first)} /><input type="color" value={validHex(first) ? normalizeHex(first) : "#7C3AED"} onChange={(e) => setFirst(e.target.value.toUpperCase())} aria-label="Choose first gradient color" className="h-12 w-14 rounded-lg border border-slate-200 p-1 dark:border-slate-700" /></div>
        </label>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Second color (HEX)
          <div className="mt-2 flex gap-2"><input className={`${inputClass} font-mono uppercase`} value={second} onChange={(e) => setSecond(e.target.value)} aria-invalid={!validHex(second)} /><input type="color" value={validHex(second) ? normalizeHex(second) : "#06B6D4"} onChange={(e) => setSecond(e.target.value.toUpperCase())} aria-label="Choose second gradient color" className="h-12 w-14 rounded-lg border border-slate-200 p-1 dark:border-slate-700" /></div>
        </label>
      </div>
      {!valid && <p role="alert" className="mt-2 text-sm text-rose-600">Use a valid 3- or 6-digit HEX color for both fields.</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Gradient type
          <select className={`${inputClass} mt-2`} value={kind} onChange={(e) => setKind(e.target.value)}><option value="linear">Linear</option><option value="radial">Radial</option></select>
        </label>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Linear angle: {angle}°
          <input className="mt-4 w-full accent-violet-600" type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(Number(e.target.value))} disabled={kind === "radial"} />
        </label>
      </div>
      {kind === "linear" && <label className="mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Second stop position: {position}%
        <input className="mt-3 w-full accent-violet-600" type="range" min="10" max="90" value={position} onChange={(e) => setPosition(Number(e.target.value))} />
      </label>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} disabled={!valid} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied CSS" : "Copy CSS"}</button>
        <button type="button" onClick={exportCss} disabled={!valid} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 disabled:opacity-50"><Download size={15} /> Export CSS</button>
        <button type="button" onClick={randomize} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Shuffle size={15} /> Randomize</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="h-64 sm:h-80" style={{ background: valid ? (kind === "radial" ? `radial-gradient(circle, ${normalizeHex(first)} 0%, ${normalizeHex(second)} 100%)` : `linear-gradient(${angle}deg, ${normalizeHex(first)} 0%, ${normalizeHex(second)} ${position}%, ${normalizeHex(first)} 100%)`) : "#e5e7eb" }} role="img" aria-label="Gradient preview" />
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-4 dark:bg-slate-900"><p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Live preview</p><code className="max-w-full break-all text-xs text-slate-600 dark:text-slate-400">{css || "Fix invalid colors to preview CSS."}</code></div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">Quick presets</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{presets.map((p) => <button type="button" key={p.name} onClick={() => applyPreset(p)} className="overflow-hidden rounded-xl border border-slate-200 text-left dark:border-slate-700"><span className="block h-16" style={{ background: `linear-gradient(${p.angle}deg, ${p.a}, ${p.b})` }} /><span className="block p-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{p.name}</span></button>)}</div>
    </section>
  </div>;
}
