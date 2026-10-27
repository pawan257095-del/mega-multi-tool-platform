"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy, ExternalLink, LoaderCircle, Network, Search, ShieldAlert } from "lucide-react";

const API_BASE = "https://api.macvendors.com/";
const MAC_REGEX = /^(?:[0-9a-f]{12}|[0-9a-f]{6})$/i;

type LookupResult = { input: string; normalized: string; vendor: string; queriedAt: string };

function normalizeMac(value: string) {
  return value.trim().replace(/[^0-9a-f]/gi, "").toUpperCase();
}

function formatMac(value: string) {
  const compact = value.replace(/[^0-9A-F]/g, "");
  if (compact.length === 12) return compact.match(/.{2}/g)?.join(":") ?? compact;
  if (compact.length === 6) return compact.match(/.{2}/g)?.join(":") ?? compact;
  return value;
}

export default function MacAddressVendorLookupTool() {
  const [mac, setMac] = useState("00:1A:2B:3C:4D:5E");
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function lookup() {
    const normalized = normalizeMac(mac);
    setError("");
    setResult(null);
    setCopied(false);
    if (!MAC_REGEX.test(normalized)) {
      setError("Enter a valid MAC address (12 hexadecimal characters) or a 6-character OUI prefix. Separators such as : or - are optional.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${encodeURIComponent(formatMac(normalized))}`, { cache: "no-store" });
      const body = (await response.text()).trim();
      if (!response.ok || !body || /not found|error|invalid mac/i.test(body)) {
        throw new Error(body || `Vendor service returned HTTP ${response.status}.`);
      }
      setResult({ input: mac.trim(), normalized: formatMac(normalized), vendor: body, queriedAt: new Date().toLocaleString() });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "The lookup request failed.";
      setError(`Vendor lookup failed: ${message}. The service may be unavailable, the prefix may not be registered, or your browser/network may block the request. Try again later.`);
    } finally {
      setLoading(false);
    }
  }

  const summary = result ? `MAC address: ${result.normalized}\nVendor: ${result.vendor}\nLookup time: ${result.queriedAt}\nSource: api.macvendors.com` : "";

  async function copyResult() {
    if (!result) return;
    try { await navigator.clipboard.writeText(summary); setCopied(true); }
    catch { setError("Clipboard access was blocked. You can select and copy the result manually."); }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Network size={22} /></span>
          <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Find a registered hardware vendor</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Enter a MAC address or its first 6 hexadecimal characters (the OUI prefix). The lookup uses a public third-party vendor service.</p></div>
        </div>
        <label htmlFor="mac-address" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">MAC address or OUI prefix</label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input id="mac-address" value={mac} onChange={(event) => setMac(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !loading) void lookup(); }} placeholder="AA:BB:CC:DD:EE:FF" autoComplete="off" spellCheck={false} className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950" />
          <button type="button" onClick={() => void lookup()} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}{loading ? "Looking up…" : "Look up vendor"}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setMac("00:1A:2B:3C:4D:5E"); setResult(null); setError(""); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Sample MAC</button>
          <button type="button" onClick={() => { setMac(""); setResult(null); setError(""); setCopied(false); }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Clear</button>
        </div>
        {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
      </div>

      {result && <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm text-slate-500 dark:text-slate-400">Registered vendor</p><h3 className="mt-1 break-words text-2xl font-bold text-slate-900 dark:text-white">{result.vendor}</h3><p className="mt-2 font-mono text-sm text-slate-600 dark:text-slate-300">{result.normalized}</p><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Looked up at {result.queriedAt}</p></div>
          <button type="button" onClick={() => void copyResult()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy result"}</button>
        </div>
        <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Vendor data identifies the organization assigned a MAC prefix. It does not reliably identify the device model, owner, current location, or the person using the device.</p>
        <a href={`https://api.macvendors.com/${encodeURIComponent(result.normalized)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">Open lookup source <ExternalLink size={14} /></a>
      </div>}

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="flex items-start gap-2"><ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-700 dark:text-amber-300" /><div><h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Privacy and limitations</h3><p className="mt-1 text-sm leading-6 text-amber-900/80 dark:text-amber-100/80">The entered address is sent to api.macvendors.com. Lookup coverage depends on the vendor database and network access. Browsers cannot inspect nearby devices or reveal their MAC addresses; use this tool only with an address you already know.</p></div></div>
      </div>
    </section>
  );
}
