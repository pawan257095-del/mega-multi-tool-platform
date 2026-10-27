"use client";

import { useMemo, useState } from "react";

function money(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

export default function PaymentFeeCalculatorTool() {
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("USD");
  const [provider, setProvider] = useState<"paypal" | "stripe" | "custom">("custom");
  const [rate, setRate] = useState("2.9");
  const [fixedFee, setFixedFee] = useState("0.30");
  const [mode, setMode] = useState<"deduct" | "gross-up">("deduct");

  const result = useMemo(() => {
    const a = Number(amount);
    const r = Number(rate);
    const f = Number(fixedFee);
    if (amount.trim() === "" || rate.trim() === "" || fixedFee.trim() === "" ||
      !Number.isFinite(a) || !Number.isFinite(r) || !Number.isFinite(f) ||
      a <= 0 || a > 1_000_000_000 || r < 0 || r >= 100 || f < 0 || f > 1_000_000) return null;
    const gross = mode === "gross-up" ? (a + f) / (1 - r / 100) : a;
    const fee = gross * (r / 100) + f;
    const net = gross - fee;
    return { inputAmount: a, gross, fee, net, rate: r, fixed: f };
  }, [amount, rate, fixedFee, mode]);

  function chooseProvider(value: "paypal" | "stripe" | "custom") {
    setProvider(value);
    // Illustrative presets only; rates differ by country, product, currency, and contract.
    if (value === "paypal") { setRate("3.49"); setFixedFee("0.49"); }
    else if (value === "stripe") { setRate("2.9"); setFixedFee("0.30"); }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Transaction amount
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Currency
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="USD">USD — US dollar</option>
            <option value="EUR">EUR — euro</option>
            <option value="GBP">GBP — pound sterling</option>
            <option value="INR">INR — Indian rupee</option>
            <option value="CAD">CAD — Canadian dollar</option>
            <option value="AUD">AUD — Australian dollar</option>
          </select>
        </label>
        <label className="block text-sm font-medium md:col-span-2">Fee preset
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={provider} onChange={(e) => chooseProvider(e.target.value as "paypal" | "stripe" | "custom")}>
            <option value="custom">Custom rate</option>
            <option value="paypal">PayPal illustrative preset (3.49% + 0.49)</option>
            <option value="stripe">Stripe illustrative preset (2.9% + 0.30)</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Percentage fee (%)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" max="99.99" step="0.01" value={rate} onChange={(e) => { setRate(e.target.value); setProvider("custom"); }} />
        </label>
        <label className="block text-sm font-medium">Fixed fee (same currency)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="0" step="0.01" value={fixedFee} onChange={(e) => { setFixedFee(e.target.value); setProvider("custom"); }} />
        </label>
        <label className="block text-sm font-medium md:col-span-2">Calculation mode
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={mode} onChange={(e) => setMode(e.target.value as "deduct" | "gross-up")}>
            <option value="deduct">Calculate fee deducted from this charge</option>
            <option value="gross-up">Calculate charge needed to receive the entered amount net</option>
          </select>
        </label>
      </section>

      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter a positive transaction amount, a fee rate from 0% to under 100%, and a non-negative fixed fee.</p>
      ) : (
        <section className="space-y-3">
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">{mode === "deduct" ? "Estimated net payout" : "Suggested gross charge"}</p>
            <p className="mt-2 text-3xl font-semibold">{money(mode === "deduct" ? result.net : result.gross, currency)}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Gross transaction</p><p className="mt-2 text-xl font-semibold">{money(result.gross, currency)}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated processing fee</p><p className="mt-2 text-xl font-semibold">{money(result.fee, currency)}</p></div>
            <div className="rounded-2xl border border-border bg-card p-5 sm:col-span-2"><p className="text-sm text-muted-foreground">Net after fee</p><p className="mt-2 text-xl font-semibold">{money(result.net, currency)}</p></div>
          </div>
        </section>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground space-y-2">
        <p><strong className="text-foreground">Rate disclaimer:</strong> Provider presets are illustrative, not live or guaranteed current rates. Actual PayPal and Stripe fees depend on merchant country, customer country, card/payment method, currency conversion, product, and account agreement. Confirm your provider’s current pricing before charging customers.</p>
        <p>The calculator assumes the fixed fee is denominated in the selected currency and ignores tax on fees, refunds, disputes, and rounding rules. Currency selection changes formatting only; it does not convert currencies.</p>
      </aside>
    </div>
  );
}
