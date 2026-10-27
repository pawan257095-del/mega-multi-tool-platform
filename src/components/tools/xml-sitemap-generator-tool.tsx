"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, Plus, RotateCcw, Trash2 } from "lucide-react";

type Frequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
type SitemapUrl = { url: string; lastmod: string; changefreq: Frequency | ""; priority: string };
const blankUrl = (): SitemapUrl => ({ url: "", lastmod: "", changefreq: "", priority: "" });
const initialRows: SitemapUrl[] = [
  { url: "https://example.com/", lastmod: "", changefreq: "weekly", priority: "1.0" },
  { url: "https://example.com/about", lastmod: "", changefreq: "monthly", priority: "0.7" },
];
const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&apos;");

export default function XmlSitemapGeneratorTool() {
  const [rows, setRows] = useState<SitemapUrl[]>(initialRows);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const validRows = useMemo(() => rows.filter((row) => row.url.trim()), [rows]);
  const output = useMemo(() => {
    const entries = validRows.map((row) => {
      const parts = [`    <loc>${escapeXml(row.url.trim())}</loc>`];
      if (row.lastmod) parts.push(`    <lastmod>${escapeXml(row.lastmod)}</lastmod>`);
      if (row.changefreq) parts.push(`    <changefreq>${row.changefreq}</changefreq>`);
      if (row.priority) parts.push(`    <priority>${row.priority}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.length ? `\n${entries.join("\n")}\n` : "\n"}</urlset>\n`;
  }, [validRows]);
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const labelClass = "block text-xs font-medium text-slate-600 dark:text-slate-300";

  function updateRow(index: number, patch: Partial<SitemapUrl>) {
    setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
    setCopied(false); setError(""); setNotice("");
  }
  function validate() {
    if (!validRows.length) return "Add at least one page URL before generating a sitemap.";
    for (const row of validRows) {
      let parsed: URL;
      try { parsed = new URL(row.url.trim()); } catch { return `Invalid URL: ${row.url}`; }
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return `Use an http:// or https:// URL: ${row.url}`;
      if (row.lastmod && !/^\d{4}-\d{2}-\d{2}$/.test(row.lastmod)) return `Use YYYY-MM-DD for last modified date: ${row.url}`;
      if (row.priority && (!/^\d(?:\.\d)?$/.test(row.priority) || Number(row.priority) < 0 || Number(row.priority) > 1)) return `Priority must be between 0.0 and 1.0: ${row.url}`;
    }
    return "";
  }
  async function copyOutput() {
    const problem = validate(); if (problem) { setError(problem); return; }
    try { await navigator.clipboard.writeText(output); setCopied(true); setError(""); }
    catch { setError("Clipboard access was blocked. Select the XML output and copy it manually."); }
  }
  function download() {
    const problem = validate(); if (problem) { setError(problem); return; }
    const blobUrl = URL.createObjectURL(new Blob([output], { type: "application/xml;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = blobUrl; anchor.download = "sitemap.xml"; anchor.click(); URL.revokeObjectURL(blobUrl); setError("");
  }
  function addRow() { setRows((current) => [...current, blankUrl()]); setCopied(false); setError(""); }
  function reset() { setRows([blankUrl()]); setCopied(false); setError(""); setNotice("Form reset. Add your canonical page URLs to generate a sitemap."); }
  function loadSample() { setRows(initialRows); setCopied(false); setError(""); setNotice("Example URLs loaded. Replace example.com with your own canonical URLs."); }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Page URLs</h2><div className="flex gap-2"><button type="button" onClick={loadSample} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700">Load sample</button><button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13}/> Reset</button></div></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Add public, canonical URLs that you want search engines to discover. Optional fields can be left blank.</p>
      <div className="mt-5 grid gap-4">{rows.map((row, index) => <div key={index} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">Page {index + 1}</span><button type="button" disabled={rows.length === 1} onClick={() => { setRows((current) => current.filter((_, i) => i !== index)); setCopied(false); }} aria-label={`Remove page ${index + 1}`} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30 dark:hover:bg-slate-800"><Trash2 size={15}/></button></div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Absolute URL<input className={inputClass} type="url" value={row.url} onChange={(e) => updateRow(index, { url: e.target.value })} placeholder="https://example.com/page" /></label>
        <div className="mt-3 grid gap-3 sm:grid-cols-3"><label className={labelClass}>Last modified<input className={inputClass} type="date" value={row.lastmod} onChange={(e) => updateRow(index, { lastmod: e.target.value })}/></label><label className={labelClass}>Change frequency<select className={inputClass} value={row.changefreq} onChange={(e) => updateRow(index, { changefreq: e.target.value as SitemapUrl["changefreq"] })}><option value="">Omit</option>{(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"] as Frequency[]).map((freq) => <option key={freq} value={freq}>{freq}</option>)}</select></label><label className={labelClass}>Priority<select className={inputClass} value={row.priority} onChange={(e) => updateRow(index, { priority: e.target.value })}><option value="">Omit</option>{["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select></label></div>
      </div>)}</div>
      <button type="button" onClick={addRow} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><Plus size={16}/> Add page URL</button>
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Only include canonical URLs you control and want indexed. Dates are optional; priority and change frequency are hints and may be ignored by search engines.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generated sitemap.xml</h2><span className="text-xs text-slate-500">{validRows.length} URL{validRows.length === 1 ? "" : "s"}</span></div>
      <textarea aria-label="Generated XML sitemap" readOnly value={output} className="mt-4 min-h-[30rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      {notice && <p className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy XML"}</button><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><Download size={15}/> Download sitemap.xml</button></div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"><strong>Publishing tip:</strong> upload the downloaded file to your website root, commonly <code>/sitemap.xml</code>, and reference it in your robots.txt. A sitemap helps discovery but does not guarantee indexing.</div>
    </section>
  </div>;
}
