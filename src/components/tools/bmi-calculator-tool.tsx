"use client";

import { useMemo, useState } from "react";
import { Activity, Clipboard, RotateCcw } from "lucide-react";

type Units = "metric" | "imperial";
function bmiCategory(bmi: number) {
  if (bmi < 18.5) return { label: "Underweight", detail: "Below 18.5", color: "text-sky-700 dark:text-sky-300", bg: "bg-sky-50 dark:bg-sky-950/40" };
  if (bmi < 25) return { label: "Healthy weight range", detail: "18.5–24.9", color: "text-emerald-700 dark:text-emerald-300", bg: "bg-emerald-50 dark:bg-emerald-950/40" };
  if (bmi < 30) return { label: "Overweight", detail: "25.0–29.9", color: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/40" };
  return { label: "Obesity range", detail: "30.0 and above", color: "text-rose-700 dark:text-rose-300", bg: "bg-rose-50 dark:bg-rose-950/40" };
}

export default function BmiCalculatorTool() {
  const [units, setUnits] = useState<Units>("metric");
  const [heightCm, setHeightCm] = useState("170");
  const [weightKg, setWeightKg] = useState("65");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("7");
  const [weightLb, setWeightLb] = useState("143.3");
  const [notice, setNotice] = useState("");
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const heightMeters = units === "metric" ? Number(heightCm) / 100 : (Number(heightFt) * 12 + Number(heightIn)) * 0.0254;
  const massKg = units === "metric" ? Number(weightKg) : Number(weightLb) * 0.45359237;
  const valid = Number.isFinite(heightMeters) && Number.isFinite(massKg) && heightMeters >= 0.5 && heightMeters <= 2.8 && massKg >= 2 && massKg <= 500 && (units === "metric" ? heightCm.trim() !== "" && weightKg.trim() !== "" : heightFt.trim() !== "" && heightIn.trim() !== "" && weightLb.trim() !== "") && (units !== "imperial" || (Number(heightFt) >= 0 && Number(heightIn) >= 0 && Number(heightIn) < 12));
  const result = useMemo(() => {
    if (!valid) return null;
    const bmi = massKg / (heightMeters * heightMeters);
    const category = bmiCategory(bmi);
    return { bmi, category, healthyMinKg: 18.5 * heightMeters * heightMeters, healthyMaxKg: 24.9 * heightMeters * heightMeters };
  }, [valid, heightMeters, massKg]);

  function clear() {
    setHeightCm(""); setWeightKg(""); setHeightFt(""); setHeightIn(""); setWeightLb(""); setNotice("");
  }
  function loadSample() {
    setUnits("metric"); setHeightCm("170"); setWeightKg("65"); setNotice("Sample values loaded.");
  }
  async function copySummary() {
    if (!result) return;
    const summary = `BMI: ${result.bmi.toFixed(1)}\nCategory: ${result.category.label}\nHeight: ${heightMeters.toFixed(2)} m\nWeight: ${massKg.toFixed(1)} kg\nAdult healthy BMI reference weight range for this height: ${result.healthyMinKg.toFixed(1)}–${result.healthyMaxKg.toFixed(1)} kg\nBMI is a screening measure, not a diagnosis.`;
    try { await navigator.clipboard.writeText(summary); setNotice("BMI summary copied to clipboard."); }
    catch { setNotice("Clipboard access was blocked. You can select and copy the result manually."); }
  }

  return <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Enter your measurements</h2><button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13} /> Clear</button></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Calculate body mass index (BMI) from height and weight. Your measurements stay in this browser.</p>
      <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800" role="group" aria-label="Measurement units"><button type="button" onClick={() => { setUnits("metric"); setNotice(""); }} aria-pressed={units === "metric"} className={`rounded-lg px-4 py-2 text-sm font-semibold ${units === "metric" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>Metric (cm, kg)</button><button type="button" onClick={() => { setUnits("imperial"); setNotice(""); }} aria-pressed={units === "imperial"} className={`rounded-lg px-4 py-2 text-sm font-semibold ${units === "imperial" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}>Imperial (ft, lb)</button></div>
      {units === "metric" ? <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Height (cm)<input aria-label="Height in centimeters" type="number" min="50" max="280" step="0.1" className={inputClass} value={heightCm} onChange={e => { setHeightCm(e.target.value); setNotice(""); }} placeholder="e.g. 170" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Weight (kg)<input aria-label="Weight in kilograms" type="number" min="2" max="500" step="0.1" className={inputClass} value={weightKg} onChange={e => { setWeightKg(e.target.value); setNotice(""); }} placeholder="e.g. 65" /></label></div> : <div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Height (feet)<input aria-label="Height in feet" type="number" min="0" max="9" step="1" className={inputClass} value={heightFt} onChange={e => { setHeightFt(e.target.value); setNotice(""); }} placeholder="5" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Height (inches)<input aria-label="Additional height inches" type="number" min="0" max="11.9" step="0.1" className={inputClass} value={heightIn} onChange={e => { setHeightIn(e.target.value); setNotice(""); }} placeholder="7" /></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Weight (lb)<input aria-label="Weight in pounds" type="number" min="4.4" max="1102" step="0.1" className={inputClass} value={weightLb} onChange={e => { setWeightLb(e.target.value); setNotice(""); }} placeholder="143" /></label></div>}
      {((units === "metric" && (heightCm !== "" || weightKg !== "") && !valid) || (units === "imperial" && (heightFt !== "" || heightIn !== "" || weightLb !== "") && !valid)) && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a valid height and weight within the supported ranges. Inches must be less than 12.</p>}
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={loadSample} className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Load sample</button><button type="button" onClick={copySummary} disabled={!result} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"><Clipboard size={15} /> Copy summary</button></div>
      {notice && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500">This calculator uses the standard adult BMI formula: weight (kg) ÷ height (m)². Adult BMI categories are not intended for children or teens, and may not suit every individual or athlete.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your BMI result</h2><Activity size={21} className="text-violet-600" /></div>
      {!result ? <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">Enter valid height and weight to calculate BMI.</div> : <>
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white"><p className="text-sm font-medium text-violet-100">Body Mass Index</p><p className="mt-2 text-5xl font-bold tabular-nums">{result.bmi.toFixed(1)}</p><p className="mt-3 text-sm text-violet-100">kg/m²</p></div>
        <div className={`mt-4 rounded-xl p-4 ${result.category.bg}`}><p className={`text-lg font-semibold ${result.category.color}`}>{result.category.label}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Adult reference category: {result.category.detail}</p></div>
        <div className="mt-5"><div className="flex justify-between text-xs text-slate-500"><span>Underweight</span><span>Healthy</span><span>Overweight</span><span>Obesity</span></div><div className="mt-2 flex h-3 overflow-hidden rounded-full"><div className="w-[20%] bg-sky-400"/><div className="w-[26%] bg-emerald-500"/><div className="w-[20%] bg-amber-400"/><div className="flex-1 bg-rose-500"/></div><p className="mt-2 text-xs text-slate-500">Category thresholds: 18.5, 25, and 30.</p></div>
        <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Adult reference weight range for this height</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{result.healthyMinKg.toFixed(1)}–{result.healthyMaxKg.toFixed(1)} kg</p><p className="mt-1 text-xs leading-5 text-slate-500">Based on BMI 18.5–24.9; this is a general screening reference, not an individual health target.</p></div>
      </>}
      <p className="mt-5 text-xs leading-5 text-slate-500">BMI is a screening measure, not a diagnosis. It does not directly measure body fat or account fully for muscle mass, age, pregnancy, or individual health context. Consult a qualified healthcare professional for personal interpretation.</p>
    </section>
  </div>;
}
