"use client";

import { useState } from "react";
import { Check, Copy, Globe2, LoaderCircle, RefreshCw } from "lucide-react";

type IpDetails = {
  ip: string;
  version?: string;
  city?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  org?: string;
  asn?: string;
  timezone?: string;
};

export default function WhatIsMyIpTool() {
  const [details, setDetails] = useState<IpDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function detectIp() {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
      if (!response.ok) throw new Error("The IP lookup service is unavailable. Please try again.");
      const data = (await response.json()) as IpDetails & { error?: boolean; reason?: string };
      if (data.error || !data.ip) throw new Error(data.reason || "The lookup service did not return an IP address.");
      setDetails(data);
    } catch (primaryError) {
      // Fallback provides the public IP only if the richer lookup endpoint is blocked.
      try {
        const fallback = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
        if (!fallback.ok) throw new Error("Fallback lookup failed.");
        const result = (await fallback.json()) as { ip?: string };
        if (!result.ip) throw new Error("No IP address was returned.");
        setDetails({ ip: result.ip });
      } catch {
        setError(primaryError instanceof Error ? `${primaryError.message} Check your connection or try again later.` : "Could not detect your public IP address. Please try again.");
        setDetails(null);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyIp() {
    if (!details?.ip) return;
    try {
      await navigator.clipboard.writeText(details.ip);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Clipboard access was blocked by your browser. You can select and copy the IP address manually.");
    }
  }

  const location = [details?.city, details?.region, details?.country_name].filter(Boolean).join(", ");

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Public IP lookup</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click to query an external IP information provider.</p>
          </div>
          <button type="button" onClick={detectIp} disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <LoaderCircle size={17} className="animate-spin" /> : details ? <RefreshCw size={17} /> : <Globe2 size={17} />}
            {loading ? "Checking…" : details ? "Refresh IP" : "Detect my public IP"}
          </button>
        </div>

        {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}

        {details ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-5 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Your public IP address</p>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all font-mono text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">{details.ip}</p>
                <button type="button" onClick={copyIp} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                  {copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy IP"}
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info label="IP version" value={details.version || (details.ip.includes(":") ? "IPv6" : "IPv4")} />
              <Info label="Approximate location" value={location || "Not provided by lookup service"} />
              <Info label="Internet provider / network" value={details.org || details.asn || "Not provided by lookup service"} />
              <Info label="Time zone" value={details.timezone || "Not provided by lookup service"} />
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-10 text-center dark:border-slate-700">
            <Globe2 className="mx-auto text-slate-400" size={32} />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Your public IP will appear here</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Nothing is checked until you press the button.</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-semibold">Privacy and accuracy</p>
        <p className="mt-1">This tool contacts a third-party IP lookup service, which can see your request and public IP address. Approximate location and provider information can be inaccurate, especially when using a VPN, proxy, mobile network, or corporate gateway. Browsers generally cannot reliably reveal your device&apos;s private LAN IP address.</p>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p></div>;
}
