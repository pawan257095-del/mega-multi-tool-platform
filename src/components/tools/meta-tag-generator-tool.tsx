"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, RotateCcw, Trash2 } from "lucide-react";

type FormState = {
  title: string; description: string; keywords: string; author: string; canonical: string;
  robots: string; siteName: string; ogType: "website" | "article"; image: string; twitterCard: "summary" | "summary_large_image";
};
const initial: FormState = {
  title: "Your Page Title", description: "A concise description of what this page is about.", keywords: "web tools, SEO, meta tags", author: "", canonical: "https://example.com/page", robots: "index, follow", siteName: "Your Website", ogType: "website", image: "https://example.com/preview.jpg", twitterCard: "summary_large_image",
};
const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default function MetaTagGeneratorTool() {
  const [form, setForm] = useState<FormState>(initial);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => { setForm((old) => ({ ...old, [key]: value })); setCopied(false); setError(""); };
  const html = useMemo(() => {
    const lines = [
      "<!-- Basic SEO -->", `<title>${escapeAttr(form.title)}</title>`, `<meta name="description" content="${escapeAttr(form.description)}">`,
      ...(form.keywords.trim() ? [`<meta name="keywords" content="${escapeAttr(form.keywords)}">`] : []),
      ...(form.author.trim() ? [`<meta name="author" content="${escapeAttr(form.author)}">`] : []),
      `<meta name="robots" content="${escapeAttr(form.robots)}">`,
      ...(form.canonical.trim() ? [`<link rel="canonical" href="${escapeAttr(form.canonical)}">`] : []),
      "", "<!-- Open Graph / social sharing -->", `<meta property="og:title" content="${escapeAttr(form.title)}">`,
      `<meta property="og:description" content="${escapeAttr(form.description)}">`, `<meta property="og:type" content="${form.ogType}">`,
      ...(form.canonical.trim() ? [`<meta property="og:url" content="${escapeAttr(form.canonical)}">`] : []),
      ...(form.siteName.trim() ? [`<meta property="og:site_name" content="${escapeAttr(form.siteName)}">`] : []),
      ...(form.image.trim() ? [`<meta property="og:image" content="${escapeAttr(form.image)}">`] : []),
      "", "<!-- Twitter / X card -->", `<meta name="twitter:card" content="${form.twitterCard}">`,
      `<meta name="twitter:title" content="${escapeAttr(form.title)}">`, `<meta name="twitter:description" content="${escapeAttr(form.description)}">`,
      ...(form.image.trim() ? [`<meta name="twitter:image" content="${escapeAttr(form.image)}">`] : []),
    ];
    return lines.join("\n");
  }, [form]);
  async function copy() { try { await navigator.clipboard.writeText(html); setCopied(true); setError(""); } catch { setError("Clipboard access was blocked. Select the generated HTML and copy it manually."); } }
  function download() { const url = URL.createObjectURL(new Blob([html + "\n"], { type: "text/html;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "meta-tags.html"; a.click(); URL.revokeObjectURL(url); }
  function reset() { setForm(initial); setCopied(false); setError(""); }
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";
  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Page details</h2><button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"><RotateCcw size={13}/> Reset</button></div>
      <div className="mt-5 grid gap-4">
        <label className={labelClass}>Page title <span className="font-normal text-slate-400">({form.title.length} characters)</span><input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Your page title" /></label>
        <label className={labelClass}>Meta description <span className="font-normal text-slate-400">({form.description.length} characters)</span><textarea className={`${inputClass} min-h-24 resize-y`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe this page clearly" /></label>
        <label className={labelClass}>Keywords (comma separated)<input className={inputClass} value={form.keywords} onChange={(e) => set("keywords", e.target.value)} placeholder="keyword one, keyword two" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Author<input className={inputClass} value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Author or organization" /></label><label className={labelClass}>Robots directive<select className={inputClass} value={form.robots} onChange={(e) => set("robots", e.target.value)}><option>index, follow</option><option>noindex, follow</option><option>index, nofollow</option><option>noindex, nofollow</option></select></label></div>
        <label className={labelClass}>Canonical URL<input className={inputClass} type="url" value={form.canonical} onChange={(e) => set("canonical", e.target.value)} placeholder="https://example.com/page" /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>Website / site name<input className={inputClass} value={form.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="Your website" /></label><label className={labelClass}>Open Graph type<select className={inputClass} value={form.ogType} onChange={(e) => set("ogType", e.target.value as FormState["ogType"])}><option value="website">Website</option><option value="article">Article</option></select></label></div>
        <label className={labelClass}>Social preview image URL<input className={inputClass} type="url" value={form.image} onChange={(e) => set("image", e.target.value)} placeholder="https://example.com/image.jpg" /></label>
        <label className={labelClass}>Twitter / X card<select className={inputClass} value={form.twitterCard} onChange={(e) => set("twitterCard", e.target.value as FormState["twitterCard"])}><option value="summary_large_image">Summary with large image</option><option value="summary">Summary</option></select></label>
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Generated tags are a starting point. Search engines may rewrite snippets, and meta keywords are ignored by major search engines. Verify canonical URLs and robots directives before publishing.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generated HTML</h2><span className="text-xs text-slate-500 dark:text-slate-400">{html.split("\n").length} lines</span></div>
      <textarea aria-label="Generated meta tag HTML" readOnly value={html} className="mt-4 min-h-[28rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied HTML" : "Copy HTML"}</button><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={15}/> Download HTML</button><button type="button" onClick={() => { setForm(initial); setCopied(false); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Trash2 size={15}/> Load sample</button></div>
      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Search snippet preview (approximate)</p><p className="mt-3 text-lg text-blue-700 dark:text-blue-400">{form.title || "Your Page Title"}</p><p className="mt-1 break-all text-xs text-emerald-700 dark:text-emerald-400">{form.canonical || "https://example.com/page"}</p><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{form.description || "Your page description will appear here."}</p></div>
    </section>
  </div>;
}
