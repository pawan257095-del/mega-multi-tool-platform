"use client";

import { ArrowLeftRight, Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

type Mode = "hex-to-rgb" | "rgb-to-hex";

function normalizeHex(value: string): string | null {
  let hex = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(hex)) hex = hex.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toUpperCase()}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;
  const clean = normalized.slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string | null {
  if (![r, g, b].every((v) => Number.isInteger(v) && v >= 0 && v <= 255)) return null;
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

export default function HexRgbConverterTool() {
  const [mode, setMode] = useState<Mode>("hex-to-rgb");
  const [hex, setHex] = useState("#7C3AED");
  const [r, setR] = useState("124");
  const [g, setG] = useState("58");
  const [b, setB] = useState("237");
  const [copied, setCopied] = useState(false);

  const normalizedHex = useMemo(() => normalizeHex(hex), [hex]);
  const rgb = useMemo(() => hexToRgb(hex), [hex]);
  const rgbValues = [r, g, b].map((v) => v.trim() === "" ? NaN : Number(v));
  const rgbValid = rgbValues.every((v) => Number.isInteger(v) && v >= 0 && v <= 255);
  const convertedHex = rgbValid ? rgbToHex(rgbValues[0], rgbValues[1], rgbValues[2]) : null;
  const result = mode === "hex-to-rgb"
    ? (rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "")
    : (convertedHex ?? "");
  const previewColor = mode === "hex-to-rgb" ? normalizedHex : convertedHex;

  function reset() {
    setMode("hex-to-rgb");
    setHex("#7C3AED");
    setR("124"); setG("58"); setB("237");
    setCopied(false);
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function updateRgbFromHex(value: string) {
    setHex(value);
    setCopied(false);
    const converted = hexToRgb(value);
    if (converted) {
      setR(String(converted.r));
      setG(String(converted.g));
      setB(String(converted.b));
    }
  }

  function updateRgb(setter: (value: string) => void, value: string) {
    setter(value);
    setCopied(false);
  }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Color format converter</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Convert HEX colors to RGB or RGB values to HEX. Everything runs locally in your browser.</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button>
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => { setMode("hex-to-rgb"); setCopied(false); }} aria-pressed={mode === "hex-to-rgb"} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${mode === "hex-to-rgb" ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}>HEX <ArrowLeftRight className="mx-2 inline" size={15}/> RGB</button>
        <button type="button" onClick={() => { setMode("rgb-to-hex"); setCopied(false); }} aria-pressed={mode === "rgb-to-hex"} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${mode === "rgb-to-hex" ? "border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200" : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"}`}>RGB <ArrowLeftRight className="mx-2 inline" size={15}/> HEX</button>
      </div>

      {mode === "hex-to-rgb" ? <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <label htmlFor="hex-color-input" className={labelClass}>HEX color</label>
          <div className="flex gap-3">
            <input aria-label="Choose color" type="color" value={normalizedHex ?? "#7C3AED"} onChange={(e) => updateRgbFromHex(e.target.value.toUpperCase())} className="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/>
            <input id="hex-color-input" value={hex} onChange={(e) => updateRgbFromHex(e.target.value)} placeholder="#7C3AED or 7C3AED" className={inputClass} maxLength={7} aria-invalid={!rgb}/>
          </div>
          {!rgb && <p className="mt-2 text-sm text-rose-600">Enter a valid 3- or 6-digit HEX color.</p>}
          <label className={`${labelClass} mt-5`}>RGB result</label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-lg text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{result || "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="h-32 rounded-xl border border-black/10 dark:border-white/10" style={{ backgroundColor: normalizedHex ?? "transparent" }} />
          <p className="mt-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{normalizedHex ?? "Invalid HEX"}</p>
        </div>
      </div> : <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_220px]">
        <div>
          <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">Each channel must be a whole number from 0 to 255.</p>
          <div className="grid grid-cols-3 gap-3">
            {[{ label: "Red", value: r, setter: setR }, { label: "Green", value: g, setter: setG }, { label: "Blue", value: b, setter: setB }].map((channel) => <div key={channel.label}>
              <label htmlFor={`rgb-${channel.label.toLowerCase()}`} className={labelClass}>{channel.label}</label>
              <input id={`rgb-${channel.label.toLowerCase()}`} type="number" min="0" max="255" step="1" value={channel.value} onChange={(e) => updateRgb(channel.setter, e.target.value)} className={inputClass} />
            </div>)}
          </div>
          {!rgbValid && <p className="mt-2 text-sm text-rose-600">Enter whole numbers between 0 and 255.</p>}
          <label className={`${labelClass} mt-5`}>HEX result</label>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 font-mono text-lg text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{result || "—"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-3 dark:border-slate-700">
          <div className="h-32 rounded-xl border border-black/10 dark:border-white/10" style={{ backgroundColor: convertedHex ?? "transparent" }} />
          <p className="mt-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">{convertedHex ?? "Invalid RGB"}</p>
        </div>
      </div>}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyResult} disabled={!result} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied!" : "Copy result"}</button>
        <p className="text-xs text-slate-500 dark:text-slate-400">Supports short HEX (#RGB) and full HEX (#RRGGBB) notation.</p>
      </div>
    </section>
  </div>;
}
