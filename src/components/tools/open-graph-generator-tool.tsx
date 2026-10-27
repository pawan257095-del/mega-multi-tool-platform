"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, RotateCcw } from "lucide-react";

type Fields = {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
  type: "website" | "article" | "profile" | "video.other";
  locale: string;
};

const initialFields: Fields = {
  title: "A helpful page title for sharing",
  description: "Write a concise description that helps people understand what they will find on this page.",
  url: "https://example.com/guides/page",
  image: "https://example.com/images/share-preview.jpg",
  siteName: "Example Website",
  type: "website",
  locale: "en_US",
};

function escapeAttribute(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function isHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function OpenGraphGeneratorTool() {
  const [fields, setFields] = useState<Fields>(initialFields);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const update = <K extends keyof Fields>(key: K, value: Fields[K]) => {
    setFields((current) => ({ ...current, [key]: value }));
    setCopied(false);
    setNotice("");
  };

  const output = useMemo(() => {
    const tags: Array<[string, string]> = [
      ["og:title", fields.title],
      ["og:description", fields.description],
      ["og:type", fields.type],
      ["og:url", fields.url],
      ["og:image", fields.image],
      ["og:site_name", fields.siteName],
      ["og:locale", fields.locale],
    ];
    return tags.map(([property, content]) => `  <meta property="${property}" content="${escapeAttribute(content.trim())}" />`).join("\n");
  }, [fields]);

  const urlWarning = fields.url.trim() && !isHttpUrl(fields.url.trim()) ? "Page URL must be an absolute HTTP or HTTPS URL." : "";
  const imageWarning = fields.image.trim() && !isHttpUrl(fields.image.trim()) ? "Image URL must be an absolute HTTP or HTTPS URL." : "";
  const valid = Boolean(fields.title.trim() && fields.description.trim() && isHttpUrl(fields.url.trim()) && isHttpUrl(fields.image.trim()));

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setNotice("Open Graph tags copied to clipboard.");
    } catch {
      setNotice("Clipboard access was blocked. Download the HTML snippet instead.");
    }
  }

  function downloadOutput() {
    const content = `<!-- Open Graph metadata: place inside the document <head> -->\n${output}\n`;
    const objectUrl = URL.createObjectURL(new Blob([content], { type: "text/html;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "open-graph-meta-tags.html";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    setNotice("HTML snippet download started.");
  }

  function reset() {
    setFields({ title: "", description: "", url: "", image: "", siteName: "", type: "website", locale: "en_US" });
    setCopied(false);
    setNotice("Fields cleared. Add your page details to generate tags.");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Page details</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setFields(initialFields); setNotice("Sample data loaded."); setCopied(false); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700">Load sample</button>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13} /> Clear</button>
          </div>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Enter the public page information and a crawlable preview image URL. These values are processed locally.</p>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Open Graph title<input className={inputClass} maxLength={200} value={fields.title} onChange={(e) => update("title", e.target.value)} placeholder="Page title" /></label>
        <p className="mt-1 text-xs text-slate-500">{fields.title.length}/200 characters</p>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Description<textarea className={`${inputClass} min-h-24 resize-y`} maxLength={500} value={fields.description} onChange={(e) => update("description", e.target.value)} placeholder="Briefly describe this page" /></label>
        <p className="mt-1 text-xs text-slate-500">{fields.description.length}/500 characters</p>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Canonical page URL<input className={inputClass} type="url" value={fields.url} onChange={(e) => update("url", e.target.value)} placeholder="https://example.com/page" /></label>
        {urlWarning && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{urlWarning}</p>}
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Preview image URL<input className={inputClass} type="url" value={fields.image} onChange={(e) => update("image", e.target.value)} placeholder="https://example.com/share-image.jpg" /></label>
        {imageWarning && <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">{imageWarning}</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Site name<input className={inputClass} value={fields.siteName} onChange={(e) => update("siteName", e.target.value)} placeholder="Your website" /></label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Content type<select className={inputClass} value={fields.type} onChange={(e) => update("type", e.target.value as Fields["type"])}><option value="website">Website</option><option value="article">Article</option><option value="profile">Profile</option><option value="video.other">Video</option></select></label>
        </div>
        <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Locale<input className={inputClass} value={fields.locale} onChange={(e) => update("locale", e.target.value)} placeholder="en_US" /></label>
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">Use absolute HTTP/HTTPS URLs for the page and image. The image must be publicly reachable for social crawlers. Open Graph tags do not guarantee that every platform will display an identical preview.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Social preview &amp; HTML</h2><span className="text-xs text-slate-500">Open Graph protocol</span></div>
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
          {isHttpUrl(fields.image.trim()) ? <div className="aspect-[1.91/1] bg-slate-100 dark:bg-slate-800"><img src={fields.image.trim()} alt="Open Graph preview" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div> : <div className="flex aspect-[1.91/1] items-center justify-center bg-slate-100 text-sm text-slate-500 dark:bg-slate-800">Add a valid image URL to preview it</div>}
          <div className="p-4"><p className="text-xs uppercase tracking-wide text-slate-500">{(() => { try { return new URL(fields.url).hostname; } catch { return "your-domain.example"; } })()}</p><h3 className="mt-1 break-words font-semibold text-slate-900 dark:text-white">{fields.title || "Your page title"}</h3><p className="mt-1 line-clamp-3 break-words text-sm text-slate-600 dark:text-slate-300">{fields.description || "Your page description will appear here."}</p></div>
        </div>
        {!valid && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Add a title, description, and valid HTTP/HTTPS page and image URLs for a complete preview.</p>}
        <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Generated meta tags<textarea aria-label="Generated Open Graph tags" readOnly value={output} className={`${inputClass} min-h-64 resize-y font-mono text-xs leading-5`} /></label>
        {notice && <p role="status" className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
        <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? "Copied" : "Copy tags"}</button><button type="button" onClick={downloadOutput} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><Download size={15} /> Download HTML</button></div>
        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"><strong>How to use:</strong> place these tags inside the document&apos;s <code>&lt;head&gt;</code>. Add them to the actual page source or server-rendered HTML so social crawlers can read them; client-side changes alone may not be seen by all crawlers.</div>
      </section>
    </div>
  );
}
