"use client";

import { useMemo, useState } from "react";

function fmt(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export default function RoiCalculatorTool() {
  const [investment, setInvestment] = useState("1000");
  const [finalValue, setFinalValue] = useState("1300");
  const [currency, setCurrency] = useState("USD");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-01-01");
  const [includeCosts, setIncludeCosts] = useState(false);
  const [extraCosts, setExtraCosts] = useState("0");

  const result = useMemo(() => {
    const initial = Number(investment);
    const ending = Number(finalValue);
    const costs = Number(extraCosts);
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    if (investment.trim() === "" || finalValue.trim() === "" || extraCosts.trim() === "" ||
      !Number.isFinite(initial) || !Number.isFinite(ending) || !Number.isFinite(costs) ||
      initial <= 0 || initial > 1_000_000_000_000 || ending < 0 || ending > 1_000_000_000_000 ||
      costs < 0 || costs > 1_000_000_000_000 || !start || !end || end.getTime() <= start.getTime()) return null;
    const totalCost = initial + (includeCosts ? costs : 0);
    const profit = ending - totalCost;
    const roi = (profit / totalCost) * 100;
    const days = Math.round((end.getTime() - start.getTime()) / 86400000);
    const annualized = roi <= -100 ? null : (Math.pow(ending / totalCost, 365 / days) - 1) * 100;
    return { totalCost, profit, roi, days, annualized };
  }, [investment, finalValue, extraCosts, startDate, endDate, includeCosts]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Initial investment
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0.01" step="0.01" value={investment} onChange={(e) => setInvestment(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Final value / proceeds
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={finalValue} onChange={(e) => setFinalValue(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Currency
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD — US dollar</option>
            <option value="INR">INR — Indian rupee</option>
            <option value="EUR">EUR — euro</option>
            <option value="GBP">GBP — pound sterling</option>
            <option value="CAD">CAD — Canadian dollar</option>
            <option value="AUD">AUD — Australian dollar</option>
          </select>
        </label>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <input id="roi-cost-toggle" type="checkbox" checked={includeCosts} onChange={(e) => setIncludeCosts(e.target.checked)} />
          <label htmlFor="roi-cost-toggle" className="text-sm font-medium">Include additional costs</label>
        </div>
        {includeCosts && <label className="block text-sm font-medium md:col-span-2">Additional costs / fees
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={extraCosts} onChange={(e) => setExtraCosts(e.target.value)} />
        </label>}
        <label className="block text-sm font-medium">Investment start date
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Investment end date
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </section>
      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter a positive initial investment, non-negative final value and costs, and valid dates where the end date is after the start date.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Return on investment (ROI)</p>
            <p className="mt-2 text-3xl font-semibold">{result.roi.toFixed(2)}%</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.profit >= 0 ? "Net gain" : "Net loss"}: {fmt(result.profit, currency)}</p>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Total investment cost</p><p className="mt-2 text-xl font-semibold">{fmt(result.totalCost, currency)}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Holding period</p><p className="mt-2 text-xl font-semibold">{result.days} days</p></div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2"><p className="text-sm text-muted-foreground">Annualized return (approx.)</p><p className="mt-2 text-xl font-semibold">{result.annualized === null || !Number.isFinite(result.annualized) ? "Not defined for this result" : `${result.annualized.toFixed(2)}%`}</p><p className="mt-1 text-xs text-muted-foreground">Assumes the same compounded rate over the period; not suitable for every cash-flow pattern.</p></div>
          </section>
        </>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Important:</strong> ROI is a historical arithmetic measure, not a forecast. It does not account for inflation, tax, liquidity, risk, or timing of multiple cash flows. Annualized return is a simplified estimate and may be misleading for investments with deposits or withdrawals. Currency selection changes formatting only; no currency conversion occurs.
      </aside>
    </div>
  );
}
