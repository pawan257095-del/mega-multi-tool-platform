"use client";

import { useMemo, useState } from "react";
import { Activity, AlertCircle, Check, Copy, ExternalLink, LoaderCircle, Play, RotateCcw } from "lucide-react";

type Probe = { id: number; ms: number | null; status: "ok" | "error"; message?: string };
const PROBE_URL = "https://www.google.com/generate_204";

async function runHttpProbe(): Promise<number> {
  const started = performance.now();
  // no-cors returns an opaque response, but its promise still resolves/rejects based on
  // browser-level network reachability. This is not an ICMP echo request.
  await fetch(`${PROBE_URL}?_=${Date.now()}-${Math.random()}`, { mode: "no-cors", cache: "no-store" });
  return Math.max(0, performance.now() - started);
}

export default function PingTracerouteTool() {
  const [count, setCount] = useState("5");
  const [probes, setProbes] = useState<Probe[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const successful = probes.filter((probe) => probe.status === "ok" && probe.ms !== null);
  const stats = useMemo(() => {
    const values = successful.map((probe) => probe.ms as number);
    if (!values.length) return null;
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, value) => sum + value, 0) / values.length,
      loss: probes.length ? ((probes.length - values.length) / probes.length) * 100 : 0,
    };
  }, [probes]);

  async function start() {
    const requested = Number(count);
    if (!Number.isInteger(requested) || requested < 1 || requested > 10) {
      setError("Choose between 1 and 10 attempts.");
      return;
    }
    setRunning(true);
    setError("");
    setCopied(false);
    setProbes([]);
    const next: Probe[] = [];
    for (let index = 0; index < requested; index += 1) {
      try {
        const ms = await runHttpProbe();
        next.push({ id: index + 1, ms, status: "ok" });
      } catch {
        next.push({ id: index + 1, ms: null, status: "error", message: "Request failed or was blocked by the network/browser." });
      }
      setProbes([...next]);
      if (index < requested - 1) await new Promise((resolve) => window.setTimeout(resolve, 250));
    }
    if (next.every((probe) => probe.status === "error")) setError("All requests failed. Check your internet connection or browser/network restrictions and try again.");
    setRunning(false);
  }

  const report = [
    "Browser HTTP reachability timing (not ICMP ping)",
    `Endpoint: ${PROBE_URL}`,
    ...probes.map((probe) => `Attempt ${probe.id}: ${probe.status === "ok" ? `${(probe.ms as number).toFixed(1)} ms` : `FAILED — ${probe.message || "request failed"}`}`),
    ...(stats ? [`Min: ${stats.min.toFixed(1)} ms`, `Average: ${stats.avg.toFixed(1)} ms`, `Max: ${stats.max.toFixed(1)} ms`, `Failed requests: ${stats.loss.toFixed(0)}%`] : []),
  ].join("\n");

  async function copyReport() {
    try { await navigator.clipboard.writeText(report); setCopied(true); }
    catch { setError("Clipboard access was blocked. Select the results and copy them manually."); }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-5 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Activity size={22} /></span>
          <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">HTTP reachability timing</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Measures how long the browser takes to reach a public HTTPS endpoint. Results include browser, network, DNS, TLS and endpoint overhead.</p></div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-slate-700 dark:text-slate-200">Number of attempts
            <select value={count} onChange={(event) => setCount(event.target.value)} disabled={running} className="mt-2 block min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="1">1 attempt</option><option value="3">3 attempts</option><option value="5">5 attempts</option><option value="10">10 attempts</option></select>
          </label>
          <button type="button" onClick={() => void start()} disabled={running} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{running ? <LoaderCircle size={17} className="animate-spin" /> : <Play size={17} />}{running ? "Testing…" : "Start test"}</button>
          <button type="button" onClick={() => { setProbes([]); setError(""); setCopied(false); }} disabled={running} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={16} />Reset</button>
        </div>
        {error && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        {probes.length > 0 && <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Results ({probes.length} / {count})</h3><button type="button" onClick={() => void copyReport()} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copied" : "Copy report"}</button></div>
          {stats && <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{ label: "Minimum", value: `${stats.min.toFixed(1)} ms` }, { label: "Average", value: `${stats.avg.toFixed(1)} ms` }, { label: "Maximum", value: `${stats.max.toFixed(1)} ms` }, { label: "Failed requests", value: `${stats.loss.toFixed(0)}%` }].map((item) => <div key={item.label} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{item.value}</p></div>)}</div>}
          <ol className="space-y-2">{probes.map((probe) => <li key={probe.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-800"><span className="text-sm text-slate-700 dark:text-slate-200">Attempt {probe.id}</span><span className={`text-sm font-semibold ${probe.status === "ok" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>{probe.status === "ok" ? `${(probe.ms as number).toFixed(1)} ms` : "Failed"}</span></li>)}</ol>
        </div>}
        {!probes.length && !running && <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center dark:border-slate-700"><Activity className="mx-auto text-slate-400" size={28} /><p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Results will appear here</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Run a short test to estimate browser-to-endpoint response timing.</p></div>}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><p className="font-semibold">Browser limitation: this is not a true ping or traceroute</p><p className="mt-1">Browsers cannot send arbitrary ICMP echo requests or inspect network hops directly. This tool measures HTTPS fetch timing to a fixed public endpoint; it cannot test an arbitrary host, show packet loss in the ICMP sense, or discover the route. For genuine ping/traceroute, use your operating system terminal (Windows: <code>ping example.com</code> and <code>tracert example.com</code>; macOS/Linux: <code>ping example.com</code> and <code>traceroute example.com</code>).</p><a href="https://www.google.com/generate_204" target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 font-medium underline">Probe endpoint <ExternalLink size={14} /></a></div>
    </section>
  );
}
