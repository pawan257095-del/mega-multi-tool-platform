"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Link as LinkIcon, RotateCcw } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function normalizeBaseUrl(raw: string) {
  const value = raw.trim();
  if (!value) return { url: "", error: "Enter the destination URL." };
  let candidate = value;
  if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(candidate)) candidate = `https://${candidate}`;
  try {
    const parsed = new URL(candidate);
    if (!["http:", "https:"].includes(parsed.protocol)) return { url: "", error: "Only HTTP and HTTPS destination URLs are supported." };
    if (!parsed.hostname.includes(".") && parsed.hostname !== "localhost") return { url: "", error: "Enter a valid domain, such as https://example.com/landing-page." };
    return { url: parsed.toString(), error: "" };
  } catch {
    return { url: "", error: "Enter a valid destination URL." };
  }
}
function safeValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export default function UTMBuilderTool() {
  const [baseUrl, setBaseUrl] = useState("https://example.com/landing-page");
  const [source, setSource] = useState("newsletter");
  const [medium, setMedium] = useState("email");
  const [campaign, setCampaign] = useState("autumn_launch");
  const [term, setTerm] = useState("");
  const [content, setContent] = useState("hero_cta");
  const [customParams, setCustomParams] = useState("");
  const [lowercase, setLowercase] = useState(true);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const normalized = useMemo(() => normalizeBaseUrl(baseUrl), [baseUrl]);
  const result = useMemo(() => {
    if (!normalized.url) return "";
    try {
      const url = new URL(normalized.url);
      if (removeExisting) {
        ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach((key) => url.searchParams.delete(key));
      }
      const transform = (value: string) => {
        const clean = safeValue(value);
        return lowercase ? clean.toLowerCase() : clean;
      };
      const entries: [string, string][] = [
        ["utm_source", source], ["utm_medium", medium], ["utm_campaign", campaign], ["utm_term", term], ["utm_content", content],
      ];
      for (const [key, raw] of entries) {
        const value = transform(raw);
        if (value) url.searchParams.set(key, value);
      }
      for (const line of customParams.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const split = trimmed.indexOf("=");
        if (split < 1) continue;
        const key = trimmed.slice(0, split).trim();
        const value = trimmed.slice(split + 1).trim();
        if (/^[a-zA-Z][a-zA-Z0-9_.~-]*$/.test(key) && value) url.searchParams.set(key, value);
      }
      return url.toString();
    } catch { return ""; }
  }, [normalized.url, source, medium, campaign, term, content, customParams, lowercase, removeExisting]);

  async function copy() {
    setError(""); setCopied(false);
    if (!result) { setError(normalized.error || "Enter a valid destination URL."); return; }
    try { await navigator.clipboard.writeText(result); setCopied(true); }
    catch { setError("Clipboard access failed. Select the generated URL and copy it manually."); }
  }
  function reset() {
    setBaseUrl("https://example.com/landing-page"); setSource("newsletter"); setMedium("email");
    setCampaign("autumn_launch"); setTerm(""); setContent("hero_cta"); setCustomParams("");
    setLowercase(true); setRemoveExisting(false); setError(""); setCopied(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.85fr)]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><LinkIcon size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Campaign details</h2><p className="text-sm text-slate-500 dark:text-slate-400">Create a UTM-tagged URL for analytics attribution.</p></div></div>
        <div><label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Destination URL *</label><input className={inputClass} value={baseUrl} onChange={(e) => { setBaseUrl(e.target.value); setError(""); setCopied(false); }} placeholder="https://example.com/landing-page" inputMode="url" /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use the final landing page URL. If no scheme is entered, https:// is added automatically.</p></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-medium">Campaign source *</label><input className={inputClass} value={source} onChange={(e) => { setSource(e.target.value); setCopied(false); }} placeholder="newsletter" /><p className="mt-1 text-xs text-slate-500">Who sends the traffic? e.g. google, newsletter</p></div><div><label className="mb-1 block text-sm font-medium">Campaign medium *</label><input className={inputClass} value={medium} onChange={(e) => { setMedium(e.target.value); setCopied(false); }} placeholder="email" /><p className="mt-1 text-xs text-slate-500">Channel type, e.g. cpc, email, social</p></div><div><label className="mb-1 block text-sm font-medium">Campaign name *</label><input className={inputClass} value={campaign} onChange={(e) => { setCampaign(e.target.value); setCopied(false); }} placeholder="autumn_launch" /><p className="mt-1 text-xs text-slate-500">The promotion or campaign identifier.</p></div><div><label className="mb-1 block text-sm font-medium">Campaign content</label><input className={inputClass} value={content} onChange={(e) => { setContent(e.target.value); setCopied(false); }} placeholder="hero_cta" /><p className="mt-1 text-xs text-slate-500">Differentiate ads or links in the same campaign.</p></div></div>
        <div><label className="mb-1 block text-sm font-medium">Campaign term</label><input className={inputClass} value={term} onChange={(e) => { setTerm(e.target.value); setCopied(false); }} placeholder="running_shoes" /><p className="mt-1 text-xs text-slate-500">Often used for paid search keywords.</p></div>
        <div><label className="mb-1 block text-sm font-medium">Additional query parameters (optional)</label><textarea className={`${inputClass} min-h-20 resize-y font-mono text-xs`} value={customParams} onChange={(e) => { setCustomParams(e.target.value); setCopied(false); }} placeholder={"ref=partner42\ncreative=variant_b"} /><p className="mt-1 text-xs text-slate-500">One key=value pair per line. Invalid lines are ignored.</p></div>
        <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={lowercase} onChange={(e) => { setLowercase(e.target.checked); setCopied(false); }} /> Lowercase UTM values</label><label className="flex items-center gap-2"><input type="checkbox" checked={removeExisting} onChange={(e) => { setRemoveExisting(e.target.checked); setCopied(false); }} /> Replace existing UTM parameters</label></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Copy size={16} /> Copy URL</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        {copied && <p role="status" className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={15} /> Campaign URL copied.</p>}
      </div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Generated URL</h2><span className={`rounded-full px-2 py-1 text-xs font-semibold ${result ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"}`}>{result ? "Ready" : "Check URL"}</span></div><div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">{result || normalized.error || "Enter a valid destination URL to generate a campaign link."}</div>{result && <a href={result} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400"><ExternalLink size={15} /> Open destination URL</a>}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">UTM parameter guide</h3><dl className="mt-3 space-y-3 text-sm"><div><dt className="font-mono font-semibold text-violet-600 dark:text-violet-400">utm_source</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">The traffic source, such as google or newsletter.</dd></div><div><dt className="font-mono font-semibold text-violet-600 dark:text-violet-400">utm_medium</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">The marketing medium, such as cpc, email, or social.</dd></div><div><dt className="font-mono font-semibold text-violet-600 dark:text-violet-400">utm_campaign</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">The campaign name or promotion.</dd></div><div><dt className="font-mono font-semibold text-violet-600 dark:text-violet-400">utm_term / utm_content</dt><dd className="mt-1 text-slate-600 dark:text-slate-300">Optional keyword and creative/link variation labels.</dd></div></dl></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><p className="text-sm leading-5 text-amber-900 dark:text-amber-200">Use consistent naming across campaigns. UTM parameters are visible in the URL and should never contain personal or confidential information.</p></div>
      </div>
    </section>
  );
}
