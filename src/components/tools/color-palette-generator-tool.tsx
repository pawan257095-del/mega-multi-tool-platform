"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Shuffle } from "lucide-react";

type PaletteColor = { hex: string; rgb: string; hsl: string };
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function normalizeHex(value: string): string | null {
  const clean = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) return "#" + clean.split("").map((c) => c + c).join("").toUpperCase();
  if (/^[0-9a-fA-F]{6}$/.test(clean)) return "#" + clean.toUpperCase();
  return null;
}
function toRgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function toHsl(hex: string) {
  const { r: rr, g: gg, b: bb } = toRgb(hex);
  const r = rr / 255, g = gg / 255, b = bb / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function colorData(hex: string): PaletteColor {
  const { r, g, b } = toRgb(hex);
  const { h, s, l } = toHsl(hex);
  return { hex, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${h}, ${s}%, ${l}%)` };
}
function randomHex() {
  const bytes = new Uint8Array(3);
  crypto.getRandomValues(bytes);
  return "#" + Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}
function formatHex(n: number) {
  return "#" + Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0").toUpperCase();
}
function mix(hexA: string, hexB: string, t: number) {
  const a = toRgb(hexA), b = toRgb(hexB);
  return formatHex(a.r + (b.r - a.r) * t) + formatHex(a.g + (b.g - a.g) * t) + formatHex(a.b + (b.b - a.b) * t);
}

export default function ColorPaletteGeneratorTool() {
  const [base, setBase] = useState("#6D28D9");
  const [mode, setMode] = useState("complementary");
  const [copied, setCopied] = useState("");
  const colors = useMemo(() => {
    const hex = normalizeHex(base);
    if (!hex) return [];
    const { h, s, l } = toHsl(hex);
    const hslHex = (hh: number, ss = s, ll = l) => {
      const sat = ss / 100, light = ll / 100;
      const c = (1 - Math.abs(2 * light - 1)) * sat;
      const x = c * (1 - Math.abs(((hh / 60) % 2) - 1));
      const m = light - c / 2;
      let r = 0, g = 0, b = 0;
      if (hh < 60) [r, g, b] = [c, x, 0];
      else if (hh < 120) [r, g, b] = [x, c, 0];
      else if (hh < 180) [r, g, b] = [0, c, x];
      else if (hh < 240) [r, g, b] = [0, x, c];
      else if (hh < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      return formatHex((r + m) * 255) + formatHex((g + m) * 255) + formatHex((b + m) * 255);
    };
    if (mode === "monochromatic") {
      return [hslHex(h, s, Math.max(8, l - 36)), hslHex(h, s, Math.max(12, l - 18)), hex, hslHex(h, s, Math.min(88, l + 18)), hslHex(h, s, Math.min(96, l + 34))];
    }
    if (mode === "analogous") return [hslHex((h + 288) % 360), hslHex((h + 324) % 360), hex, hslHex((h + 36) % 360), hslHex((h + 72) % 360)];
    if (mode === "triadic") return [hex, hslHex((h + 120) % 360), hslHex((h + 240) % 360), hslHex((h + 120) % 360, Math.max(20, s - 12), Math.min(90, l + 12)), hslHex((h + 240) % 360, Math.max(20, s - 12), Math.max(10, l - 12))];
    return [hex, hslHex((h + 180) % 360), hslHex(h, s, Math.max(10, l - 20)), hslHex((h + 180) % 360, s, Math.min(90, l + 20)), hslHex(h, Math.max(20, s - 20), Math.min(95, l + 32))];
  }, [base, mode]);
  const valid = normalizeHex(base) !== null;
  const entries = colors.map((hex) => colorData(hex));
  async function copy(value: string, key: string) {
    try { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied(""), 1400); }
    catch { setCopied(""); }
  }
  function exportCss() {
    const css = `:root {\n${entries.map((c, i) => `  --palette-${i + 1}: ${c.hex};`).join("\n")}\n}\n`;
    const blob = new Blob([css], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "color-palette.css"; a.click();
    URL.revokeObjectURL(url);
  }
  function reset() { setBase("#6D28D9"); setMode("complementary"); setCopied(""); }
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Base HEX color
          <input className={`${inputClass} mt-2 font-mono text-lg uppercase`} value={base} onChange={(e) => setBase(e.target.value)} placeholder="#6D28D9" aria-invalid={!valid} />
        </label>
        <div className="flex gap-2">
          <input type="color" value={normalizeHex(base) ?? "#6D28D9"} onChange={(e) => setBase(e.target.value.toUpperCase())} aria-label="Choose base color" className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" />
          <button type="button" onClick={() => setBase(randomHex())} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Shuffle size={15} /> Random</button>
        </div>
      </div>
      {!valid && <p role="alert" className="mt-2 text-sm text-rose-600">Enter a 3- or 6-digit HEX color, with or without #.</p>}
      <label className="mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Palette harmony
        <select className={`${inputClass} mt-2`} value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="complementary">Complementary</option><option value="analogous">Analogous</option><option value="triadic">Triadic</option><option value="monochromatic">Monochromatic</option>
        </select>
      </label>
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={exportCss} disabled={!valid} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"><Download size={15} /> Export CSS</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    {valid && <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="grid grid-cols-1 sm:grid-cols-5">{entries.map((c, i) => <div key={`${c.hex}-${i}`} className="min-w-0">
        <div className="h-28 sm:h-40" style={{ backgroundColor: c.hex }} />
        <div className="space-y-2 bg-white p-3 dark:bg-slate-900">
          <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">{c.hex}</p>
          <p className="break-words text-xs text-slate-500 dark:text-slate-400">{c.rgb}</p>
          <p className="break-words text-xs text-slate-500 dark:text-slate-400">{c.hsl}</p>
          <button type="button" onClick={() => void copy(c.hex, `${c.hex}-${i}`)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">{copied === `${c.hex}-${i}` ? <Check size={12} /> : <Copy size={12} />} {copied === `${c.hex}-${i}` ? "Copied" : "Copy HEX"}</button>
        </div>
      </div>)}</div>
      <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950"><button type="button" onClick={() => void copy(entries.map((c) => c.hex).join("\n"), "all")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{copied === "all" ? <Check size={15} /> : <Copy size={15} />} {copied === "all" ? "Copied all HEX" : "Copy all HEX"}</button></div>
    </section>}
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Palette suggestions are generated from standard HSL color-harmony rules. Always check contrast and accessibility in the context of your actual interface.</p>
  </div>;
}
