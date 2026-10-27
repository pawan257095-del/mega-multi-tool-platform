"use client";

import { useMemo, useState } from "react";
import { Clipboard, Percent, RotateCcw, ShoppingBag } from "lucide-react";

type Mode = "of" | "what-percent" | "change" | "discount";
const fieldClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const numberText = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 6 });

export default function PercentageDiscountCalculatorTool() {
  const [mode, setMode] = useState<Mode>("discount");
  const [value, setValue] = useState("2500");
  const [percent, setPercent] = useState("20");
  const [part, setPart] = useState("30");
  const [whole, setWhole] = useState("120");
  const [oldValue, setOldValue] = useState("80");
  const [newValue, setNewValue] = useState("100");
  const [currency, setCurrency] = useState("₹");
  const [notice, setNotice] = useState("");

  const result = useMemo(() => {
    const n = (s: string) => Number(s);
    if (mode === "of") {
      if (!value.trim() || !percent.trim() || !Number.isFinite(n(value)) || !Number.isFinite(n(percent))) return null;
      return { heading: `${percent}% of ${value}`, primary: numberText(n(value) * n(percent) / 100), lines: [`${percent}% × ${value} = ${numberText(n(value) * n(percent) / 100)}`] };
    }
    if (mode === "what-percent") {
      if (!part.trim() || !whole.trim() || !Number.isFinite(n(part)) || !Number.isFinite(n(whole)) || n(whole) === 0) return null;
      const pct = n(part) / n(whole) * 100;
      return { heading: `${part} as a percentage of ${whole}`, primary: `${numberText(pct)}%`, lines: [`(${part} ÷ ${whole}) × 100 = ${numberText(pct)}%`] };
    }
    if (mode === "change") {
      if (!oldValue.trim() || !newValue.trim() || !Number.isFinite(n(oldValue)) || !Number.isFinite(n(newValue)) || n(oldValue) === 0) return null;
      const delta = n(newValue) - n(oldValue);
      const pct = delta / Math.abs(n(oldValue)) * 100;
      const direction = delta > 0 ? "increase" : delta < 0 ? "decrease" : "no change";
      return { heading: "Percentage change", primary: `${pct > 0 ? "+" : ""}${numberText(pct)}%`, lines: [`Difference: ${numberText(delta)}`, `This is a ${direction} from ${oldValue} to ${newValue}.`] };
    }
    if (!value.trim() || !percent.trim() || !Number.isFinite(n(value)) || !Number.isFinite(n(percent)) || n(value) < 0 || n(percent) < 0 || n(percent) > 100) return null;
    const original = n(value);
    const savings = original * n(percent) / 100;
    const finalPrice = original - savings;
    return { heading: "Discounted price", primary: `${currency}${money(finalPrice)}`, lines: [`Original price: ${currency}${money(original)}`, `Discount: ${numberText(n(percent))}% (save ${currency}${money(savings)})`, `Final price: ${currency}${money(finalPrice)}`] };
  }, [mode, value, percent, part, whole, oldValue, newValue, currency]);

  function clear() {
    setValue(""); setPercent(""); setPart(""); setWhole(""); setOldValue(""); setNewValue(""); setNotice("");
  }
  function sample() {
    setMode("discount"); setValue("2500"); setPercent("20"); setPart("30"); setWhole("120"); setOldValue("80"); setNewValue("100"); setCurrency("₹"); setNotice("Sample values loaded.");
  }
  async function copyResult() {
    if (!result) return;
    const text = [result.heading, result.primary, ...result.lines].join("\n");
    try { await navigator.clipboard.writeText(text); setNotice("Result copied to clipboard."); }
    catch { setNotice("Clipboard access was blocked. Select and copy the result manually."); }
  }
  function downloadResult() {
    if (!result) return;
    const content = [result.heading, result.primary, ...result.lines].join("\n") + "\n";
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "percentage-calculation.txt"; a.click(); URL.revokeObjectURL(url);
  }

  const modes: { id: Mode; label: string; description: string }[] = [
    { id: "discount", label: "Discount", description: "Find savings and sale price." },
    { id: "of", label: "Percent of a value", description: "Calculate X% of a number." },
    { id: "what-percent", label: "What percent?", description: "Find what percent one number is of another." },
    { id: "change", label: "Percentage change", description: "Compare an old value with a new value." },
  ];

  return <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Choose a calculation</h2><button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13} /> Clear</button></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Pick a calculation type, enter your values, and see the result instantly. Everything runs locally in your browser.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">{modes.map(item => <button key={item.id} type="button" onClick={() => { setMode(item.id); setNotice(""); }} aria-pressed={mode === item.id} className={`rounded-xl border p-3 text-left transition ${mode === item.id ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-500 dark:bg-violet-950/40 dark:ring-violet-950" : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"}`}><span className="block text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span></button>)}</div>
      <div className="mt-5 space-y-4">
        {mode === "discount" && <>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Original price<input aria-label="Original price" type="number" min="0" step="any" value={value} onChange={e => { setValue(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 2500" /></label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Discount (%)<input aria-label="Discount percentage" type="number" min="0" max="100" step="any" value={percent} onChange={e => { setPercent(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 20" /></label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Currency symbol<input aria-label="Currency symbol" type="text" maxLength={5} value={currency} onChange={e => { setCurrency(e.target.value); setNotice(""); }} className={fieldClass} placeholder="₹, $, €" /></label>
          {value.trim() && percent.trim() && (!Number.isFinite(Number(value)) || !Number.isFinite(Number(percent)) || Number(value) < 0 || Number(percent) < 0 || Number(percent) > 100) && <p role="alert" className="text-sm text-rose-600">Enter a non-negative price and a discount from 0% to 100%.</p>}
        </>}
        {mode === "of" && <><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Percentage (%)<input aria-label="Percentage to calculate" type="number" step="any" value={percent} onChange={e => { setPercent(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 15" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Value<input aria-label="Value for percentage calculation" type="number" step="any" value={value} onChange={e => { setValue(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 200" /></label></>}
        {mode === "what-percent" && <><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Part / amount<input aria-label="Part amount" type="number" step="any" value={part} onChange={e => { setPart(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 30" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Whole / total<input aria-label="Whole total" type="number" step="any" value={whole} onChange={e => { setWhole(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 120" /></label>{whole.trim() && Number(whole) === 0 && <p role="alert" className="text-sm text-rose-600">The total cannot be zero.</p>}</>}
        {mode === "change" && <><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Old value<input aria-label="Old value" type="number" step="any" value={oldValue} onChange={e => { setOldValue(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 80" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">New value<input aria-label="New value" type="number" step="any" value={newValue} onChange={e => { setNewValue(e.target.value); setNotice(""); }} className={fieldClass} placeholder="e.g. 100" /></label>{oldValue.trim() && Number(oldValue) === 0 && <p role="alert" className="text-sm text-rose-600">The old value cannot be zero for percentage change.</p>}</>}
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={sample} className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Load sample</button><button type="button" onClick={copyResult} disabled={!result} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"><Clipboard size={15} /> Copy result</button><button type="button" onClick={downloadResult} disabled={!result} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">Download TXT</button></div>
      {notice && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your result</h2>{mode === "discount" ? <ShoppingBag size={21} className="text-violet-600" /> : <Percent size={21} className="text-violet-600" />}</div>
      {!result ? <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">Enter valid values to calculate your result.</div> : <>
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white"><p className="text-sm font-medium text-violet-100">{result.heading}</p><p className="mt-2 break-words text-4xl font-bold tabular-nums">{result.primary}</p></div>
        <div className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Calculation details</h3><ul className="mt-2 space-y-2">{result.lines.map((line, index) => <li key={index} className="text-sm leading-6 text-slate-600 dark:text-slate-300">{line}</li>)}</ul></div>
        {mode === "discount" && <div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/30"><p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">You save</p><p className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">{currency}{money(Number(value) * Number(percent) / 100)}</p></div><div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">Discount rate</p><p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{numberText(Number(percent))}%</p></div></div>}
      </>}
      <p className="mt-5 text-xs leading-5 text-slate-500">Results use standard arithmetic and do not include taxes, shipping, or store-specific rules unless you include them in the input values.</p>
    </section>
  </div>;
}
