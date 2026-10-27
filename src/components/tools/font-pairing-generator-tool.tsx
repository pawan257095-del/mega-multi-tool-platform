"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Shuffle, Type } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

type Pair = {
  name: string;
  heading: string;
  body: string;
  category: string;
  description: string;
};

const pairs: Pair[] = [
  { name: "Modern Editorial", heading: "Playfair Display", body: "Inter", category: "Editorial", description: "Expressive serif headlines with clean, highly readable body text." },
  { name: "Product & SaaS", heading: "Space Grotesk", body: "DM Sans", category: "Modern", description: "A confident geometric headline paired with a versatile interface font." },
  { name: "Friendly Startup", heading: "Manrope", body: "Inter", category: "Modern", description: "Soft geometric headings and neutral body copy for product pages." },
  { name: "Luxury & Boutique", heading: "Cormorant Garamond", body: "Montserrat", category: "Elegant", description: "Refined, high-contrast serif headlines balanced by spaced sans-serif text." },
  { name: "Creative Portfolio", heading: "Syne", body: "DM Sans", category: "Creative", description: "Distinctive display typography paired with understated supporting text." },
  { name: "Classic Publishing", heading: "Merriweather", body: "Source Sans 3", category: "Editorial", description: "A sturdy reading serif with a clear, screen-friendly sans-serif." },
  { name: "Minimal & Neutral", heading: "DM Sans", body: "DM Sans", category: "Minimal", description: "One cohesive family used at different weights for a restrained design system." },
  { name: "Tech & Developer", heading: "IBM Plex Sans", body: "IBM Plex Mono", category: "Tech", description: "A technical sans-serif with a monospaced accent for code-heavy interfaces." },
  { name: "Warm & Approachable", heading: "Nunito Sans", body: "Lato", category: "Friendly", description: "Rounded, welcoming headings and familiar, legible paragraph text." },
  { name: "Bold Campaign", heading: "Oswald", body: "Roboto", category: "Bold", description: "Condensed, high-impact headlines with a practical workhorse body font." },
  { name: "Academic & Trustworthy", heading: "Libre Baskerville", body: "Source Sans 3", category: "Editorial", description: "Traditional, credible headings and an accessible modern reading face." },
  { name: "Playful Brand", heading: "Fredoka", body: "Nunito Sans", category: "Friendly", description: "Rounded display lettering for lively brands, supported by readable body text." },
  { name: "Premium Minimal", heading: "Bodoni Moda", body: "Manrope", category: "Elegant", description: "Fashion-inspired serif display typography with understated UI text." },
  { name: "Contemporary Blog", heading: "Lora", body: "Nunito Sans", category: "Editorial", description: "A warm literary headline style paired with comfortable digital body copy." },
  { name: "Brutalist / Graphic", heading: "Archivo Black", body: "Archivo", category: "Bold", description: "Dense, graphic headlines with a matching family for supporting text." },
  { name: "Accessible Interface", heading: "Atkinson Hyperlegible", body: "Atkinson Hyperlegible", category: "Accessible", description: "A legibility-focused family used consistently across headings and paragraphs." },
];

const filters = ["All", "Modern", "Editorial", "Elegant", "Creative", "Minimal", "Tech", "Friendly", "Bold", "Accessible"];

function googleFontUrl(names: string[]) {
  return "https://fonts.googleapis.com/css2?" + names.map((name) => "family=" + encodeURIComponent(name).replace(/%20/g, "+") + ":wght@400;500;600;700").join("&") + "&display=swap";
}

export default function FontPairingGeneratorTool() {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("All");
  const [headingSize, setHeadingSize] = useState("42");
  const [bodySize, setBodySize] = useState("16");
  const [sampleHeading, setSampleHeading] = useState("Design that feels right.");
  const [sampleBody, setSampleBody] = useState("Good typography makes information easier to understand. Pair a distinctive heading face with a body font that stays comfortable to read across screens.");
  const [copied, setCopied] = useState("");
  const visiblePairs = useMemo(() => pairs.map((pair, index) => ({ ...pair, index })).filter((pair) => filter === "All" || pair.category === filter), [filter]);
  const current = pairs[selected];
  const fontUrl = googleFontUrl([current.heading, current.body]);
  const css = `@import url('${fontUrl}');\n\n:root {\n  --font-heading: '${current.heading}', sans-serif;\n  --font-body: '${current.body}', sans-serif;\n}\n\nbody {\n  font-family: var(--font-body);\n  font-size: ${bodySize}px;\n}\n\nh1, h2, h3, .heading {\n  font-family: var(--font-heading);\n}\n\nh1 { font-size: ${headingSize}px; }`;
  function copy(text: string, what: string) {
    if (!navigator.clipboard?.writeText) { setCopied("Clipboard unavailable"); return; }
    navigator.clipboard.writeText(text).then(() => setCopied(what)).catch(() => setCopied("Copy failed"));
  }
  function randomPair() {
    const pool = visiblePairs.length ? visiblePairs : pairs.map((pair, index) => ({ ...pair, index }));
    const choice = pool[Math.floor(Math.random() * pool.length)];
    setSelected(choice.index);
  }
  function reset() {
    setSelected(0); setFilter("All"); setHeadingSize("42"); setBodySize("16");
    setSampleHeading("Design that feels right.");
    setSampleBody("Good typography makes information easier to understand. Pair a distinctive heading face with a body font that stays comfortable to read across screens.");
    setCopied("");
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.85fr)]">
        <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Type size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Find a font pairing</h2><p className="text-sm text-slate-500 dark:text-slate-400">Browse curated combinations and preview them with your own copy.</p></div></div>
          <div><label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Style</label><div className="flex flex-wrap gap-2">{filters.map((f) => <button key={f} type="button" onClick={() => setFilter(f)} className={`rounded-full border px-3 py-2 text-xs font-medium ${filter === f ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 text-slate-700 hover:border-violet-400 dark:border-slate-700 dark:text-slate-200"}`}>{f}</button>)}</div></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {visiblePairs.map((pair) => <button key={pair.name} type="button" onClick={() => setSelected(pair.index)} className={`rounded-xl border p-4 text-left transition ${selected === pair.index ? "border-violet-500 bg-violet-50 ring-1 ring-violet-200 dark:bg-violet-950/30" : "border-slate-200 hover:border-violet-300 dark:border-slate-700"}`}><span className="block text-sm font-semibold text-slate-900 dark:text-white">{pair.name}</span><span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">Heading: {pair.heading}</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Body: {pair.body}</span><span className="mt-2 inline-block rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">{pair.category}</span></button>)}
          </div>
          <div className="flex flex-wrap gap-3"><button type="button" onClick={randomPair} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Shuffle size={16} /> Random pairing</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">Selected pairing</p><h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{current.name}</h2></div><button type="button" onClick={() => copy(css, "CSS copied")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Copy size={14} /> Copy CSS</button></div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{current.description}</p>
            <div className="grid grid-cols-2 gap-3"><div><label className="mb-1 block text-xs font-medium">Heading size (px)</label><input className={inputClass} type="number" min="12" max="96" value={headingSize} onChange={(e) => setHeadingSize(e.target.value)} /></div><div><label className="mb-1 block text-xs font-medium">Body size (px)</label><input className={inputClass} type="number" min="10" max="32" value={bodySize} onChange={(e) => setBodySize(e.target.value)} /></div></div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-3 dark:border-slate-800"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Live typography preview</h3></div>
            <div className="space-y-4 p-5">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Heading sample<input className={`${inputClass} mt-1`} value={sampleHeading} onChange={(e) => setSampleHeading(e.target.value)} maxLength={140} /></label>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">Body sample<textarea className={`${inputClass} mt-1 min-h-24 resize-y`} value={sampleBody} onChange={(e) => setSampleBody(e.target.value)} maxLength={1000} /></label>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-950"><p style={{ fontFamily: `'${current.heading}', sans-serif`, fontSize: `${Math.min(96, Math.max(12, Number(headingSize) || 42))}px`, lineHeight: 1.12, fontWeight: 700 }} className="break-words text-slate-900 dark:text-white">{sampleHeading}</p><p style={{ fontFamily: `'${current.body}', sans-serif`, fontSize: `${Math.min(32, Math.max(10, Number(bodySize) || 16))}px`, lineHeight: 1.65 }} className="mt-4 break-words text-slate-700 dark:text-slate-300">{sampleBody}</p><p className="mt-5 text-xs text-slate-400">Heading: {current.heading} · Body: {current.body}</p></div>
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Google Fonts are loaded for the preview when internet access is available. The CSS snippet includes the font import and family declarations.</p>
              {copied && <p role="status" className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={15} /> {copied}</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">Implementation note</h3><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Pairings are curated suggestions, not a claim that one combination is universally best. Test typography at your actual sizes and check contrast, language coverage, loading performance, and readability before shipping.</p></div>
      <link rel="stylesheet" href={fontUrl} />
    </section>
  );
}
