"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Copy, Check, RotateCcw } from "lucide-react";

type Unit = { id: string; label: string; seconds: number };
const units: Unit[] = [
  { id: "ns", label: "Nanosecond (ns)", seconds: 1e-9 },
  { id: "us", label: "Microsecond (µs)", seconds: 1e-6 },
  { id: "ms", label: "Millisecond (ms)", seconds: 1e-3 },
  { id: "s", label: "Second (s)", seconds: 1 },
  { id: "min", label: "Minute (min)", seconds: 60 },
  { id: "h", label: "Hour (h)", seconds: 3600 },
  { id: "day", label: "Day (d, 24 hours)", seconds: 86400 },
  { id: "week", label: "Week (7 days)", seconds: 604800 },
  { id: "fortnight", label: "Fortnight (14 days)", seconds: 1209600 },
  { id: "year365", label: "Year (365 days)", seconds: 31536000 },
];
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const format = (n: number) => new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 }).format(n);

export default function TimeConverterTool() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("h");
  const [to, setTo] = useState("min");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => {
    if (amount.trim() === "") return null;
    const n = Number(amount);
    const a = units.find((u) => u.id === from);
    const b = units.find((u) => u.id === to);
    if (!Number.isFinite(n) || n < 0 || !a || !b) return null;
    return n * a.seconds / b.seconds;
  }, [amount, from, to]);
  const source = units.find((u) => u.id === from);
  const target = units.find((u) => u.id === to);
  async function copy() {
    if (result === null || !source || !target) return;
    try {
      await navigator.clipboard.writeText(`${amount} ${source.label} = ${format(result)} ${target.label}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { setCopied(false); }
  }
  function reset() { setAmount("1"); setFrom("h"); setTo("min"); setCopied(false); }
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Time value
        <input className={`${inputClass} mt-2 text-lg`} type="number" min="0" step="any" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter a duration" />
      </label>
      <div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">From
          <select className={`${inputClass} mt-2`} value={from} onChange={(e) => setFrom(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
        </label>
        <button type="button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Swap time units" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><ArrowDownUp size={18} /></button>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">To
          <select className={`${inputClass} mt-2`} value={to} onChange={(e) => setTo(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.label}</option>)}</select>
        </label>
      </div>
      {result === null && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a valid, non-negative number.</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void copy()} disabled={result === null} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? "Copied" : "Copy result"}</button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6">
      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Converted result</p>
      <p className="mt-2 break-words text-3xl font-bold text-emerald-950 dark:text-emerald-100">{result === null ? "Enter a valid value" : `${format(result)} ${target?.id ?? ""}`}</p>
      {result !== null && source && target && <p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">{format(Number(amount))} {source.label} = {format(result)} {target.label}</p>}
    </section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="font-semibold text-slate-900 dark:text-white">Time unit guide</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[["Minute", "60 seconds"], ["Hour", "60 minutes = 3,600 seconds"], ["Day", "Fixed at 24 hours"], ["Year", "This converter uses a fixed 365-day year, not a calendar year."]].map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950"><p className="font-medium text-slate-800 dark:text-slate-200">{label}</p><p className="mt-1 text-slate-600 dark:text-slate-400">{value}</p></div>)}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Conversions use fixed durations. Calendar months, leap years, daylight-saving changes and leap seconds are not represented.</p>
    </section>
  </div>;
}
