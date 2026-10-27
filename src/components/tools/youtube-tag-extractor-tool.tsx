"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Tags, Youtube } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function escapeHtml(value: string) {
  return value.replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}
function parseVideoId(value: string) {
  const input = value.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const url = new URL(input);
    if (url.hostname === "youtu.be" || url.hostname.endsWith(".youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }
    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v") || url.pathname.match(/\/(?:shorts|embed|live)\/([a-zA-Z0-9_-]{11})/)?.[1] || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
    }
  } catch {}
  return "";
}
function decodeTag(value: string) {
  return escapeHtml(value).replace(/\\u0026/gi, "&").trim();
}
function uniqueTags(values: string[]) {
  const seen = new Set<string>();
  return values.map((s) => decodeTag(s).replace(/^["']|["']$/g, "").trim())
    .filter((s) => s && s.length <= 120 && !seen.has(s.toLocaleLowerCase()) && !!seen.add(s.toLocaleLowerCase()));
}
function extractTags(source: string) {
  const found: string[] = [];
  const addCsv = (value: string) => {
    // Split common CSV-like tag lists while respecting quoted values.
    const re = /"([^"]+)"|'([^']+)'|([^,;\n]+)/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(value)) !== null) {
      const tag = (match[1] || match[2] || match[3] || "").trim();
      if (tag) found.push(tag);
    }
  };
  const metaRegex = /<meta\b[^>]*(?:name|property)\s*=\s*["'](?:keywords|og:video:tag|video:tag)["'][^>]*>/gi;
  for (const match of source.matchAll(metaRegex)) {
    const content = match[0].match(/\bcontent\s*=\s*(["'])(.*?)\1/i);
    if (content?.[2]) addCsv(content[2]);
  }
  // Common embedded YouTube player/page metadata representations.
  const patterns = [
    /"keywords"\s*:\s*\[((?:\\.|[^\\\]])*)\]/gi,
    /"tags"\s*:\s*\[((?:\\.|[^\\\]])*)\]/gi,
    /"videoTags"\s*:\s*\[((?:\\.|[^\\\]])*)\]/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(source)) !== null) {
      const block = match[1];
      for (const item of block.matchAll(/"((?:\\.|[^"\\])*)"/g)) {
        try { found.push(JSON.parse(`"${item[1]}"`)); } catch { found.push(item[1]); }
      }
    }
  }
  const plainMatch = source.match(/(?:video tags|youtube tags|tags)\s*[:=]\s*([\s\S]{0,1200})/i);
  if (plainMatch?.[1]) addCsv(plainMatch[1].split(/\r?\n|<\/|<br/i)[0]);
  return uniqueTags(found);
}

export default function YouTubeTagExtractorTool() {
  const [videoUrl, setVideoUrl] = useState("");
  const [source, setSource] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const videoId = useMemo(() => parseVideoId(videoUrl), [videoUrl]);
  const extracted = useMemo(() => extractTags(source), [source]);
  const tags = useMemo(() => uniqueTags([...extracted, ...manualTags.split(/[,;\n]+/)]), [extracted, manualTags]);
  const thumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

  async function copy(text: string, label: string) {
    setError(""); setCopied("");
    if (!text.trim()) { setError("There is nothing to copy yet."); return; }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
    } catch {
      setError("Clipboard access failed. Select the result text and copy it manually.");
    }
  }
  function reset() {
    setVideoUrl(""); setSource(""); setManualTags(""); setError(""); setCopied("");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.85fr)]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-red-100 p-2 text-red-700 dark:bg-red-950 dark:text-red-300"><Tags size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Extract video tags</h2><p className="text-sm text-slate-500 dark:text-slate-400">Parse available page metadata or pasted tag text.</p></div></div>
        <div><label htmlFor="yt-url" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">YouTube video URL or video ID</label><input id="yt-url" className={inputClass} value={videoUrl} onChange={(e) => { setVideoUrl(e.target.value); setError(""); }} placeholder="https://www.youtube.com/watch?v=..." /><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Recognizes standard watch, Shorts, embed, live and youtu.be links. The URL is used for video identification and thumbnail preview; this browser-only tool cannot fetch YouTube’s private or cross-origin page metadata directly.</p></div>
        {thumbnail && <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><img src={thumbnail} alt="YouTube thumbnail preview" className="h-20 w-36 rounded-lg bg-slate-100 object-cover" /><div className="min-w-0"><p className="text-sm font-semibold text-slate-900 dark:text-white">Video ID detected</p><p className="break-all text-xs text-slate-500 dark:text-slate-400">{videoId}</p><a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-red-600 hover:underline dark:text-red-400">Open video</a></div></div>}
        <div><label htmlFor="yt-source" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Paste page source or metadata (optional)</label><textarea id="yt-source" className={`${inputClass} min-h-48 resize-y font-mono text-xs`} value={source} onChange={(e) => { setSource(e.target.value); setError(""); }} placeholder={'Paste HTML/source containing keywords or embedded metadata, for example:\n<meta name="keywords" content="coding, JavaScript, tutorial">\n"keywords":["coding","JavaScript","tutorial"]'} /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Extracts common meta keywords and embedded keywords/tags arrays when they are present in the supplied text.</p></div>
        <div><label htmlFor="yt-manual" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Or paste a tag list manually</label><textarea id="yt-manual" className={`${inputClass} min-h-20 resize-y`} value={manualTags} onChange={(e) => { setManualTags(e.target.value); setError(""); }} placeholder="coding, JavaScript tutorial, learn programming" /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={() => copy(tags.join(", "), "Comma-separated tags copied")} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700"><Copy size={16} /> Copy comma-separated</button><button type="button" onClick={() => copy(tags.join("\n"), "One tag per line copied")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Copy size={16} /> Copy as lines</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        {copied && <p role="status" className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={15} /> {copied}</p>}
      </div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Extracted tags</h2><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tags.length} tags</span></div>{tags.length ? <><div className="flex flex-wrap gap-2">{tags.map((tag, i) => <span key={`${tag.toLowerCase()}-${i}`} className="rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">{tag}</span>)}</div><textarea readOnly className={`${inputClass} mt-4 min-h-32 resize-y`} value={tags.join(", ")} aria-label="Extracted tags as text" /></> : <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><Youtube className="mx-auto text-slate-400" size={30} /><p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Your tags will appear here</p><p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Paste source containing tag metadata or enter a comma-separated list to clean and deduplicate tags.</p></div>}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">Important limitation</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">YouTube does not expose tags consistently on every public page, and browser cross-origin rules prevent this client-only tool from reliably downloading raw page source. This tool extracts tags from source text you provide; it does not claim to retrieve hidden tags directly from a URL.</p></div>
      </div>
    </section>
  );
}
