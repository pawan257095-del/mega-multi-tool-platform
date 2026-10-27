"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Copy, Check, RotateCcw } from "lucide-react";

type Unit = { id: string; label: string; symbol: string };
const units: Unit[] = [
  { id: "c", label: "Celsius", symbol: "°C" },
  { id: "f", label: "Fahrenheit", symbol: "°F" },
  { id: "k", label: "Kelvin", symbol: "K" },
  { id: "r", label: "Rankine", symbol: "°R" },
];
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function toKelvin(value: number, unit: string): number {
  if (unit === "c") return value + 273.15;
  if (unit === "f") return (value - 32) * 5 / 9 + 273.15;
  if (unit === "r") return value * 5 / 9;
  return value;
}
function fromKelvin(value: number, unit: string): number {
  if (unit === "c") return value - 273.15;
  if (unit === "f") return (value - 273.15) * 9 / 5 + 32;
  if (unit === "r") return value * 9 / 5;
  return value;
}
const format = (n: number) => new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 }).format(n);

export default function TemperatureConverterTool() {
  const [amount, setAmount] = useState("0");
  const [from, setFrom] = useState("c");
  const [to, setTo] = useState("f");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => {
    if (amount.trim() === "") return null;
    const n = Number(amount);
    if (!Number.isFinite(n)) return null;
    const kelvin = toKelvin(n, from);
    if (kelvin < 0) return null;
    return fromKelvin(kelvin, to);
  }, [amount, from, to]);
  const source = units.find((u) => u.id === from);
  const target = units.find((u) => u.id === to);
  async function copy() {
    if (result === null || !source || !target) return;
    try {
      await navigator.clipboard.writeText(`${amount} ${source.symbol} = ${format(result)} ${target.symbol}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { setCopied(false); }
  }
  function reset() { setAmount("0"); setFrom("c"); setTo("f"); setCopied(false); }
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Temperature value
        <input className={`${inputClass} mt-2 text-lg`} type="number" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter a temperature" />
      </label>
      <div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">From
          <select className={`${inputClass} mt-2`} value={from} onChange={(e) => setFrom(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>)}</select>
        </label>
        <button type="button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap temperature units" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><ArrowDownUp size={18} /></button>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">To
          <select className={`${inputClass} mt-2`} value={to} onChange={(e) => setTo(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.label} ({u.symbol})</option>)}</select>
        </label>
      </div>
      {result === null && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a valid temperature. Values below absolute zero (0 K) are not physically valid.</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} disabled={result === null} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy result"}</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6">
      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Converted result</p>
      <p className="mt-2 break-words text-3xl font-bold text-emerald-950 dark:text-emerald-100">{result === null ? "Enter a valid temperature" : `${format(result)} ${target?.symbol ?? ""}`}</p>
      {result !== null && source && target && <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">{format(Number(amount))} {source.symbol} = {format(result)} {target.symbol}</p>}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">Reference points</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[["Water freezes", "0 °C = 32 °F = 273.15 K"], ["Water boils at 1 atm", "100 °C = 212 °F = 373.15 K"], ["Room temperature (approx.)", "20 °C = 68 °F = 293.15 K"], ["Absolute zero", "−273.15 °C = −459.67 °F = 0 K"]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"><p className="font-medium text-slate-800 dark:text-slate-200">{label}</p><p className="mt-1 text-slate-600 dark:text-slate-400">{value}</p></div>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Water’s freezing and boiling points depend on pressure; the values shown use approximately standard atmospheric pressure.</p>
    </section>
  </div>;
}
