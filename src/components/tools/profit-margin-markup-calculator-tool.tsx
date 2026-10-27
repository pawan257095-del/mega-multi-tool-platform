"use client";

import { useMemo, useState } from "react";

function fmt(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export default function ProfitMarginMarkupCalculatorTool() {
  const [cost, setCost] = useState("50");
  const [sellingPrice, setSellingPrice] = useState("80");
  const [targetMargin, setTargetMargin] = useState("30");
  const [mode, setMode] = useState<"analyze" | "target">("analyze");
  const [currency, setCurrency] = useState("USD");

  const result = useMemo(() => {
    const c = Number(cost);
    const s = Number(sellingPrice);
    const m = Number(targetMargin);
    if (cost.trim() === "" || !Number.isFinite(c) || c < 0 || c > 1_000_000_000) return null;
    if (sellingPrice.trim() === "" || !Number.isFinite(s) || s < 0 || s > 1_000_000_000) return null;
    if (targetMargin.trim() === "" || !Number.isFinite(m) || m < 0 || m >= 100) return null;
    const profit = s - c;
    const margin = s > 0 ? (profit / s) * 100 : null;
    const markup = c > 0 ? (profit / c) * 100 : (profit > 0 ? null : 0);
    const targetPrice = c / (1 - m / 100);
    return { profit, margin, markup, targetPrice };
  }, [cost, sellingPrice, targetMargin]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Cost per item
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Selling price per item
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Target profit margin (%)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" max="99.99" step="0.1" value={targetMargin} onChange={(e) => setTargetMargin(e.target.value)} />
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
        <label className="block text-sm font-medium md:col-span-2">View
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as "analyze" | "target")}>
            <option value="analyze">Analyze current selling price</option>
            <option value="target">Focus on target selling price</option>
          </select>
        </label>
      </section>

      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter valid non-negative cost and selling price values, and a target margin from 0% to under 100%.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">{mode === "target" ? "Suggested selling price for target margin" : "Profit / loss per item"}</p>
            <p className="mt-2 text-3xl font-semibold">{mode === "target" ? fmt(result.targetPrice, currency) : fmt(result.profit, currency)}</p>
            <p className="mt-2 text-sm text-muted-foreground">{mode === "target" ? `Target margin: ${Number(targetMargin).toFixed(1)}%` : result.profit < 0 ? "Current selling price is below cost." : "Before tax, platform fees, shipping, returns, and other overheads."}</p>
          </section>
          <section className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Profit margin</p><p className="mt-2 text-xl font-semibold">{result.margin === null ? "Not defined at zero selling price" : `${result.margin.toFixed(2)}%`}</p><p className="mt-1 text-xs text-muted-foreground">Profit ÷ selling price × 100</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Markup</p><p className="mt-2 text-xl font-semibold">{result.markup === null ? "Not defined for zero cost with positive profit" : `${result.markup.toFixed(2)}%`}</p><p className="mt-1 text-xs text-muted-foreground">Profit ÷ cost × 100</p></div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2"><p className="text-sm text-muted-foreground">Target selling price</p><p className="mt-2 text-xl font-semibold">{fmt(result.targetPrice, currency)}</p><p className="mt-1 text-xs text-muted-foreground">Cost ÷ (1 − target margin ÷ 100)</p></div>
          </section>
        </>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Business note:</strong> This calculator treats the entered cost as the complete cost per item. For realistic pricing, include product acquisition, shipping, packaging, marketplace/payment fees, advertising, returns, taxes, and overhead. Currency selection changes formatting only and does not convert currencies.
      </aside>
    </div>
  );
}
