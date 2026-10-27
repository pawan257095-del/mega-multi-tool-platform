"use client";

import { useMemo, useState } from "react";

type Mode = "difference" | "change";
function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
function formatNumber(value: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 8 }).format(value);
}
function formatPercent(value: number): string {
  return `${new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(value)}%`;
}

export default function PercentageDifferenceCalculatorTool() {
  const [valueA, setValueA] = useState("80");
  const [valueB, setValueB] = useState("100");
  const [mode, setMode] = useState<Mode>("difference");
  const [precision, setPrecision] = useState("2");

  const a = parseNumber(valueA);
  const b = parseNumber(valueB);
  const decimals = Math.min(8, Math.max(0, Number(precision) || 0));

  const result = useMemo(() => {
    if (a === null || b === null) return { error: "Enter two valid finite numbers." as string | null };
    if (mode === "difference") {
      const denominator = (Math.abs(a) + Math.abs(b)) / 2;
      if (denominator === 0) {
        return { error: "Percentage difference is undefined when both values are zero." as string | null };
      }
      return { error: null as string | null, difference: Math.abs(a - b), percent: (Math.abs(a - b) / denominator) * 100 };
    }
    if (a === 0) {
      return { error: "Percentage change from an initial value of zero is undefined." as string | null };
    }
    return { error: null as string | null, difference: b - a, percent: ((b - a) / Math.abs(a)) * 100 };
  }, [a, b, mode]);

  const fixed = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals });

  async function copyResult() {
    const text = result.error ?? (mode === "difference"
      ? `Percentage difference: ${fixed(result.percent ?? 0)}% (absolute difference ${fixed(result.difference ?? 0)})`
      : `Percentage change: ${fixed(result.percent ?? 0)}% (change ${fixed(result.difference ?? 0)})`);
    try { await navigator.clipboard.writeText(text); } catch { /* Results remain visible for manual copying. */ }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Enter values</h2>
        <p className="mt-1 text-sm text-slate-500">Choose whether to compare two values symmetrically or calculate change from an initial value.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="percentage-value-a" className="mb-1.5 block text-sm font-medium">{mode === "change" ? "Initial value" : "Value A"}</label>
            <input id="percentage-value-a" type="number" step="any" value={valueA} onChange={(e) => setValueA(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700" />
          </div>
          <div>
            <label htmlFor="percentage-value-b" className="mb-1.5 block text-sm font-medium">{mode === "change" ? "New value" : "Value B"}</label>
            <input id="percentage-value-b" type="number" step="any" value={valueB} onChange={(e) => setValueB(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-transparent px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700" />
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="percentage-mode" className="mb-1.5 block text-sm font-medium">Calculation</label>
            <select id="percentage-mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              <option value="difference">Percentage difference (symmetric)</option>
              <option value="change">Percentage change (directional)</option>
            </select>
          </div>
          <div>
            <label htmlFor="percentage-precision" className="mb-1.5 block text-sm font-medium">Decimal places</label>
            <select id="percentage-precision" value={precision} onChange={(e) => setPrecision(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm dark:border-slate-700">
              {["0","1","2","3","4","5","6","7","8"].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setValueA("80"); setValueB("100"); setMode("difference"); setPrecision("2"); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Reset</button>
          <button type="button" onClick={() => { setValueA("100"); setValueB("125"); setMode("change"); }} className="rounded-lg border border-slate-300 px-4 py-2 text-sm dark:border-slate-700">Try 100 → 125</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Result</h2>
            <p className="mt-1 text-sm text-slate-500">{mode === "difference" ? "|A − B| ÷ ((|A| + |B|) ÷ 2) × 100" : "(B − A) ÷ |A| × 100"}</p>
          </div>
          <button type="button" onClick={copyResult} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">Copy result</button>
        </div>
        {result.error ? (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">{result.error}</p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950/30">
              <p className="text-sm text-slate-600 dark:text-slate-300">{mode === "difference" ? "Percentage difference" : "Percentage change"}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{fixed(result.percent ?? 0)}%</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-sm text-slate-600 dark:text-slate-300">{mode === "difference" ? "Absolute difference" : "Numeric change"}</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{fixed(result.difference ?? 0)}</p>
            </div>
          </div>
        )}
        {!result.error && mode === "change" && (result.percent ?? 0) !== 0 && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">The value {b! > a! ? "increased" : "decreased"} by {formatPercent(Math.abs(result.percent ?? 0))} relative to the initial value.</p>}
      </section>
      <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
        <h2 className="font-semibold">Which formula should you use?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-400">
          <li><strong>Percentage difference</strong> compares two values equally and uses their average magnitude as the denominator.</li>
          <li><strong>Percentage change</strong> measures how much a value changed from a starting point to a new value.</li>
          <li>If the required denominator is zero, the percentage is undefined; this calculator shows an explanation instead of NaN or Infinity.</li>
        </ul>
      </section>
    </div>
  );
}
