"use client";

import { useMemo, useState } from "react";

type Mode = "impressions" | "spend" | "cpm";
type Currency = "USD" | "INR" | "EUR" | "GBP";
const currencySymbols: Record<Currency, string> = { USD: "$", INR: "₹", EUR: "€", GBP: "£" };
function numberFrom(value: string): number | null {
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}
function money(value: number, currency: Currency): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
}
export default function CpmCalculatorTool() {
  const [mode, setMode] = useState<Mode>("impressions");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [budget, setBudget] = useState("1000");
  const [cpm, setCpm] = useState("5");
  const [impressions, setImpressions] = useState("200000");
  const result = useMemo(() => {
    const b = numberFrom(budget), c = numberFrom(cpm), i = numberFrom(impressions);
    if (mode === "impressions") {
      if (b === null || c === null) return { error: "Enter a valid budget and CPM." };
      if (c === 0) return { error: "CPM must be greater than zero to estimate impressions." };
      return { label: "Estimated impressions", value: (b / c) * 1000, detail: `Budget: ${money(b, currency)} · CPM: ${money(c, currency)}` };
    }
    if (mode === "spend") {
      if (i === null || c === null) return { error: "Enter valid impressions and CPM." };
      return { label: "Estimated ad spend", value: (i / 1000) * c, detail: `${i.toLocaleString("en-US")} impressions at ${money(c, currency)} CPM` };
    }
    if (b === null || i === null) return { error: "Enter valid spend and impressions." };
    if (i === 0) return { error: "Impressions must be greater than zero to calculate CPM." };
    return { label: "Calculated CPM", value: (b / i) * 1000, detail: `Spend: ${money(b, currency)} · Impressions: ${i.toLocaleString("en-US")}` };
  }, [mode, budget, cpm, impressions, currency]);
  return <div className="space-y-6">
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold">CPM Calculator</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">CPM means cost per mille (per 1,000 ad impressions). Choose what you want to calculate.</p>
      <div className="mt-5"><label htmlFor="cpm-mode" className="mb-1 block text-sm font-medium">Calculate</label><select id="cpm-mode" value={mode} onChange={e => setMode(e.target.value as Mode)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"><option value="impressions">Impressions from budget + CPM</option><option value="spend">Spend from impressions + CPM</option><option value="cpm">CPM from spend + impressions</option></select></div>
      <div className="mt-4"><label htmlFor="cpm-currency" className="mb-1 block text-sm font-medium">Currency (display only)</label><select id="cpm-currency" value={currency} onChange={e => setCurrency(e.target.value as Currency)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"><option value="USD">USD — US Dollar</option><option value="INR">INR — Indian Rupee</option><option value="EUR">EUR — Euro</option><option value="GBP">GBP — British Pound</option></select></div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {mode !== "cpm" && mode !== "spend" && <div><label htmlFor="cpm-budget" className="mb-1 block text-sm font-medium">Ad budget / spend ({currencySymbols[currency]})</label><input id="cpm-budget" type="number" min="0" step="any" value={budget} onChange={e => setBudget(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>}
        {mode !== "cpm" && <div><label htmlFor="cpm-rate" className="mb-1 block text-sm font-medium">CPM ({currencySymbols[currency]} per 1,000)</label><input id="cpm-rate" type="number" min="0" step="any" value={cpm} onChange={e => setCpm(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>}
        {mode !== "impressions" && <div><label htmlFor="cpm-impressions" className="mb-1 block text-sm font-medium">Impressions</label><input id="cpm-impressions" type="number" min="0" step="1" value={impressions} onChange={e => setImpressions(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>}
        {mode === "cpm" && <div><label htmlFor="cpm-spend" className="mb-1 block text-sm font-medium">Actual ad spend ({currencySymbols[currency]})</label><input id="cpm-spend" type="number" min="0" step="any" value={budget} onChange={e => setBudget(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>}
      </div>
    </section>
    <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60" aria-live="polite"><p className="text-sm font-medium text-slate-600 dark:text-slate-300">{"label" in result ? result.label : "Result"}</p>{"error" in result ? <p className="mt-2 font-semibold text-rose-600">{result.error}</p> : <><p className="mt-2 break-words text-3xl font-bold tracking-tight">{mode === "impressions" ? Math.round(result.value).toLocaleString("en-US") : money(result.value, currency)}</p><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{result.detail}</p></>}<p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Estimate only. Actual ad-platform billing can include minimums, taxes, invalid-traffic adjustments, and other charges. Currency selection changes formatting only; it does not convert currencies.</p></section>
    <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700"><h3 className="font-semibold">Formula</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300"><li>CPM = (Ad spend ÷ impressions) × 1,000</li><li>Ad spend = (Impressions ÷ 1,000) × CPM</li><li>Impressions = (Ad budget ÷ CPM) × 1,000</li></ul></section>
  </div>;
}
