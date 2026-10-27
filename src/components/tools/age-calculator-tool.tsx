"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Clipboard, RotateCcw } from "lucide-react";

const pad = (value: number) => String(value).padStart(2, "0");
function toDateInput(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`; }
function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}
function utcDay(date: Date) { return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()); }
function anniversary(year: number, birthMonth: number, birthDay: number) {
  const month = birthMonth;
  const maxDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(birthDay, maxDay));
}
function calculate(birth: Date, asOf: Date) {
  let years = asOf.getFullYear() - birth.getFullYear();
  let months = asOf.getMonth() - birth.getMonth();
  let days = asOf.getDate() - birth.getDate();
  if (days < 0) {
    months -= 1;
    const previousMonthLastDay = new Date(asOf.getFullYear(), asOf.getMonth(), 0).getDate();
    days += previousMonthLastDay;
  }
  if (months < 0) { years -= 1; months += 12; }
  const totalDays = Math.floor((utcDay(asOf) - utcDay(birth)) / 86_400_000);
  const totalMonths = years * 12 + months;
  const nextYear = asOf.getFullYear() + (utcDay(anniversary(asOf.getFullYear(), birth.getMonth(), birth.getDate())) < utcDay(asOf) ? 1 : 0);
  const nextBirthday = anniversary(nextYear, birth.getMonth(), birth.getDate());
  const daysUntilBirthday = Math.round((utcDay(nextBirthday) - utcDay(asOf)) / 86_400_000);
  return { years, months, days, totalDays, totalMonths, nextBirthday, daysUntilBirthday };
}

export default function AgeCalculatorTool() {
  const today = toDateInput(new Date());
  const [birthValue, setBirthValue] = useState("2000-01-01");
  const [asOfValue, setAsOfValue] = useState(today);
  const [notice, setNotice] = useState("");
  const birth = parseDate(birthValue);
  const asOf = parseDate(asOfValue);
  const result = useMemo(() => birth && asOf && utcDay(birth) <= utcDay(asOf) ? calculate(birth, asOf) : null, [birthValue, asOfValue]);
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  function clear() { setBirthValue(""); setAsOfValue(toDateInput(new Date())); setNotice(""); }
  async function copySummary() {
    if (!result || !birth || !asOf) return;
    const text = `Age: ${result.years} years, ${result.months} months, ${result.days} days\nTotal months: ${result.totalMonths}\nTotal days lived: ${result.totalDays.toLocaleString()}\nNext birthday: ${toDateInput(result.nextBirthday)} (${result.daysUntilBirthday} days away)\nCalculated as of: ${toDateInput(asOf)}`;
    try { await navigator.clipboard.writeText(text); setNotice("Age summary copied to clipboard."); }
    catch { setNotice("Clipboard access was blocked. Select the results and copy them manually."); }
  }

  return <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Enter dates</h2><button type="button" onClick={clear} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13} /> Clear</button></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Calculate your age on today’s date or on any date you choose. Date calculations run locally in your browser.</p>
      <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Date of birth<input aria-label="Date of birth" type="date" max={asOfValue || today} className={inputClass} value={birthValue} onChange={(event) => { setBirthValue(event.target.value); setNotice(""); }} /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Calculate age as of<input aria-label="Calculate age as of" type="date" min={birthValue || undefined} max="9999-12-31" className={inputClass} value={asOfValue} onChange={(event) => { setAsOfValue(event.target.value); setNotice(""); }} /></label>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setAsOfValue(toDateInput(new Date())); setNotice("Using today’s date."); }} className="rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Calculate as of today</button><button type="button" onClick={() => { setBirthValue("2000-01-01"); setAsOfValue(toDateInput(new Date())); setNotice("Sample date of birth loaded."); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Load sample</button></div>
      {birthValue && !birth && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a valid date of birth.</p>}
      {birth && asOf && utcDay(birth) > utcDay(asOf) && <p role="alert" className="mt-3 text-sm text-rose-600">Date of birth must be on or before the calculation date.</p>}
      {asOfValue && !asOf && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a valid calculation date.</p>}
      {notice && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500">For a February 29 birthday in a non-leap year, the next-birthday countdown uses February 28. Age is calculated by calendar years, months, and days.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your age</h2><CalendarDays size={20} className="text-violet-600" /></div>
      {!result ? <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">Choose a valid date of birth and calculation date to see your age.</div> : <>
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white"><p className="text-sm font-medium text-violet-100">Age on {asOfValue}</p><div className="mt-4 grid grid-cols-3 gap-3">{[[result.years,"Years"],[result.months,"Months"],[result.days,"Days"]].map(([value,label]) => <div key={String(label)} className="rounded-xl bg-white/10 p-3 text-center"><p className="text-3xl font-bold tabular-nums">{value}</p><p className="mt-1 text-xs text-violet-100">{label}</p></div>)}</div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Total months</p><p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{result.totalMonths.toLocaleString()}</p></div><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Total days lived</p><p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{result.totalDays.toLocaleString()}</p></div></div>
        <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Next birthday</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{result.nextBirthday.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"})}</p><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{result.daysUntilBirthday === 0 ? "Happy birthday!" : `${result.daysUntilBirthday} day${result.daysUntilBirthday === 1 ? "" : "s"} to go`}</p></div>
        <button type="button" onClick={copySummary} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Clipboard size={15} /> Copy age summary</button>
      </>}
    </section>
  </div>;
}
