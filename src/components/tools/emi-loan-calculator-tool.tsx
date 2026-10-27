"use client";

import { useMemo, useState } from "react";
import { Calculator, Clipboard, Download, RotateCcw } from "lucide-react";

type MonthRow = { month: number; payment: number; principal: number; interest: number; balance: number };
const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number.isFinite(value) ? value : 0);
const number = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);

function buildSchedule(principal: number, annualRate: number, months: number, emi: number): MonthRow[] {
  const monthlyRate = annualRate / 1200;
  let balance = principal;
  const rows: MonthRow[] = [];
  for (let month = 1; month <= months; month += 1) {
    const interest = balance * monthlyRate;
    const payment = month === months ? Math.min(balance + interest, emi + Math.max(0, balance + interest - emi)) : Math.min(emi, balance + interest);
    const paidPrincipal = Math.min(balance, Math.max(0, payment - interest));
    balance = Math.max(0, balance - paidPrincipal);
    rows.push({ month, payment, principal: paidPrincipal, interest, balance });
  }
  return rows;
}

export default function EmiLoanCalculatorTool() {
  const [principalText, setPrincipalText] = useState("1000000");
  const [rateText, setRateText] = useState("8.5");
  const [yearsText, setYearsText] = useState("20");
  const [feeText, setFeeText] = useState("0");
  const [notice, setNotice] = useState("");
  const principal = Number(principalText);
  const annualRate = Number(rateText);
  const years = Number(yearsText);
  const feePercent = Number(feeText);
  const valid = principalText.trim() !== "" && rateText.trim() !== "" && yearsText.trim() !== "" && feeText.trim() !== "" && Number.isFinite(principal) && principal > 0 && Number.isFinite(annualRate) && annualRate >= 0 && annualRate <= 100 && Number.isFinite(years) && years > 0 && years <= 100 && Number.isFinite(feePercent) && feePercent >= 0 && feePercent <= 100;
  const months = valid ? Math.round(years * 12) : 0;
  const monthlyRate = annualRate / 1200;
  const emi = valid ? (monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - Math.pow(1 + monthlyRate, -months))) : 0;
  const totalPayment = emi * months;
  const totalInterest = Math.max(0, totalPayment - principal);
  const processingFee = principal * feePercent / 100;
  const schedule = useMemo(() => valid ? buildSchedule(principal, annualRate, months, emi) : [], [valid, principal, annualRate, months, emi]);
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  function reset() { setPrincipalText("1000000"); setRateText("8.5"); setYearsText("20"); setFeeText("0"); setNotice(""); }
  async function copySummary() {
    if (!valid) return;
    const summary = `EMI / Loan Estimate\nLoan amount: ${money(principal)}\nAnnual interest rate: ${annualRate}%\nTenure: ${number(years)} years (${months} months)\nMonthly EMI: ${money(emi)}\nTotal interest: ${money(totalInterest)}\nTotal repayment: ${money(totalPayment)}\nProcessing fee estimate: ${money(processingFee)}`;
    try { await navigator.clipboard.writeText(summary); setNotice("Loan summary copied to clipboard."); }
    catch { setNotice("Clipboard access was blocked. Select the summary and copy it manually."); }
  }
  function downloadSchedule() {
    if (!valid) return;
    const rows: (string | number)[][] = [["Month", "Payment", "Principal", "Interest", "Remaining balance"], ...schedule.map((row) => [row.month, row.payment.toFixed(2), row.principal.toFixed(2), row.interest.toFixed(2), row.balance.toFixed(2)])];
    const csv = rows.map((row) => row.join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "emi-amortization-schedule.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  return <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Loan details</h2><button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13} /> Reset</button></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Estimate your monthly equated instalment (EMI), total interest, and repayment amount. Calculations run locally in your browser.</p>
      <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Loan amount (₹)<input aria-label="Loan amount in rupees" type="number" min="1" step="1000" className={inputClass} value={principalText} onChange={(e) => { setPrincipalText(e.target.value); setNotice(""); }} /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Annual interest rate (%)<input aria-label="Annual interest rate percentage" type="number" min="0" max="100" step="0.05" className={inputClass} value={rateText} onChange={(e) => { setRateText(e.target.value); setNotice(""); }} /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Loan tenure (years)<input aria-label="Loan tenure in years" type="number" min="0.0834" max="100" step="0.5" className={inputClass} value={yearsText} onChange={(e) => { setYearsText(e.target.value); setNotice(""); }} /></label>
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Optional processing fee (%)<input aria-label="Processing fee percentage" type="number" min="0" max="100" step="0.1" className={inputClass} value={feeText} onChange={(e) => { setFeeText(e.target.value); setNotice(""); }} /></label>
      {!valid && <p role="alert" className="mt-3 text-sm text-rose-600">Enter a positive loan amount and tenure, an interest rate from 0–100%, and a processing fee from 0–100%.</p>}
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" disabled={!valid} onClick={copySummary} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><Clipboard size={15} /> Copy summary</button><button type="button" disabled={!valid} onClick={downloadSchedule} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={15} /> Download schedule CSV</button></div>
      {notice && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500">This is an estimate using a fixed monthly rate and equal monthly payments. Actual lender calculations, fees, taxes, floating rates, and payment dates may differ.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your EMI estimate</h2><Calculator size={20} className="text-violet-600" /></div>
      {!valid ? <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">Enter valid loan details to calculate your EMI.</div> : <>
        <div className="mt-5 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 text-white"><p className="text-sm font-medium text-violet-100">Estimated monthly EMI</p><p className="mt-2 text-4xl font-bold tracking-tight tabular-nums">{money(emi)}</p><p className="mt-2 text-sm text-violet-100">For {months.toLocaleString("en-IN")} monthly payments</p></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Principal amount</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{money(principal)}</p></div><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Total interest</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{money(totalInterest)}</p></div><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Total repayment</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{money(totalPayment)}</p></div><div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs text-slate-500">Processing fee estimate</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{money(processingFee)}</p></div></div>
        <div className="mt-5"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Principal</span><span>Interest</span></div><div aria-label={`Repayment composition: principal ${Math.round(principal / Math.max(totalPayment, 1) * 100)} percent, interest ${Math.round(totalInterest / Math.max(totalPayment, 1) * 100)} percent`} className="flex h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="bg-violet-600" style={{ width: `${Math.min(100, principal / Math.max(totalPayment, 1) * 100)}%` }} /><div className="bg-amber-400" style={{ width: `${Math.min(100, totalInterest / Math.max(totalPayment, 1) * 100)}%` }} /></div><p className="mt-2 text-xs text-slate-500">Processing fee is shown separately and is not included in the EMI formula.</p></div>
        <div className="mt-6"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">First 12 months: repayment breakdown</h3><div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[500px] text-left text-xs"><thead className="bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><tr><th className="px-3 py-2.5">Month</th><th className="px-3 py-2.5">Principal</th><th className="px-3 py-2.5">Interest</th><th className="px-3 py-2.5">Balance</th></tr></thead><tbody>{schedule.slice(0, 12).map((row) => <tr key={row.month} className="border-t border-slate-100 dark:border-slate-800"><td className="px-3 py-2.5">{row.month}</td><td className="px-3 py-2.5 tabular-nums">{money(row.principal)}</td><td className="px-3 py-2.5 tabular-nums">{money(row.interest)}</td><td className="px-3 py-2.5 tabular-nums">{money(row.balance)}</td></tr>)}</tbody></table></div></div>
      </>}
    </section>
  </div>;
}
