"use client";

import { useState } from "react";

type LookupResult = {
  status?: string;
  message?: string;
  breachCount?: number;
  checkedAddress?: string;
  provider?: string;
  caveat?: string;
  breaches?: Array<{ name: string; domain?: string; breachDate?: string; dataClasses?: string[] }>;
};

function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

export default function DataBreachCheckerTool() {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState("");

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normaliseEmail(email));

  async function checkEmail() {
    const address = normaliseEmail(email);
    setError("");
    setResult(null);
    if (!validEmail) {
      setError("Enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Please confirm that you understand the email will be sent to the breach-check service.");
      return;
    }

    setLoading(true);
    try {
      // Have I Been Pwned's public breach API requires an API key. This UI deliberately
      // does not claim to query it without a configured, secure server-side integration.
      const response = await fetch("/api/data-breach-checker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: address }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "The breach-check service is not configured. No result was returned.");
      }
      setResult(payload as LookupResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete the lookup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label htmlFor="dbc-email" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Email address</label>
        <input id="dbc-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setResult(null); setError(""); }} placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        <label className="mt-4 flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300" />
          <span>I understand that the email address will be sent to the configured breach-check service for lookup.</span>
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={checkEmail} disabled={loading || !email.trim()} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Checking…" : "Check email"}
          </button>
          <button type="button" onClick={() => { setEmail(""); setConsent(false); setResult(null); setError(""); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Clear</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{error}</p>}
        {result && <div role="status" className="mt-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">{result.message ?? "Lookup complete"}</h2>
          {typeof result.breachCount === "number" && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Reported breach count: {result.breachCount}</p>}
          {result.checkedAddress && <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">Checked address: {result.checkedAddress}</p>}
          {result.provider && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Provider: {result.provider}</p>}
          {result.breaches && result.breaches.length > 0 && <div className="mt-4 space-y-3">
            {result.breaches.map((breach, index) => <article key={`${breach.name}-${index}`} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <h3 className="font-medium text-slate-900 dark:text-white">{breach.name}</h3>
              {breach.domain && <p className="text-sm text-slate-600 dark:text-slate-300">{breach.domain}</p>}
              {breach.breachDate && <p className="text-xs text-slate-500 dark:text-slate-400">Breach date: {breach.breachDate}</p>}
              {breach.dataClasses && breach.dataClasses.length > 0 && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Data types: {breach.dataClasses.join(", ")}</p>}
            </article>)}
          </div>}
          {result.caveat && <p className="mt-3 text-sm leading-6 text-amber-700 dark:text-amber-300">{result.caveat}</p>}
        </div>}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Privacy and setup notes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <li>This tool checks an email address only; it never asks for or checks your account password.</li>
          <li>This tool uses the XposedOrNot email-breach API, which documents a free no-key endpoint for low-volume use.</li>
          <li>The provider applies per-IP request limits. If you hit a limit, wait before retrying; higher-volume use may require a different plan.</li>
          <li>No result does not prove an account was never exposed; datasets may be incomplete or outdated.</li>
        </ul>
      </section>
    </div>
  );
}
