"use client";

import { useMemo, useState } from "react";
import { Download, Image as ImageIcon, RotateCcw, Shuffle } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const presets = [
  { label: "Video thumbnail", width: 1280, height: 720 },
  { label: "Social post", width: 1080, height: 1080 },
  { label: "Portrait post", width: 1080, height: 1350 },
  { label: "Presentation", width: 1600, height: 900 },
  { label: "Avatar", width: 512, height: 512 },
  { label: "Banner", width: 1500, height: 500 },
];

function safeDimension(value: string, fallback: number) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 4096 ? n : fallback;
}

export default function DummyImageGeneratorTool() {
  const [width, setWidth] = useState("640");
  const [height, setHeight] = useState("360");
  const [background, setBackground] = useState("#E2E8F0");
  const [foreground, setForeground] = useState("#334155");
  const [label, setLabel] = useState("Placeholder Image");
  const [showDimensions, setShowDimensions] = useState(true);
  const [showBorder, setShowBorder] = useState(true);
  const [error, setError] = useState("");
  const [downloadName, setDownloadName] = useState("placeholder-image.png");
  const w = safeDimension(width, 640);
  const h = safeDimension(height, 360);

  const svg = useMemo(() => {
    const esc = (s: string) => s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[ch] || ch));
    const title = esc(label.trim());
    const base = Math.max(12, Math.min(w, h) * 0.055);
    const titleSize = Math.max(12, Math.min(48, Math.min(w, h) * 0.055));
    const detailSize = Math.max(10, Math.min(24, Math.min(w, h) * 0.035));
    const centerY = h / 2;
    const dims = showDimensions ? `<text x="${w/2}" y="${centerY + titleSize + base/2}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" fill="${foreground}" text-anchor="middle" opacity=".8">${w} × ${h}</text>` : "";
    const titleY = showDimensions ? centerY - base/2 : centerY + titleSize/3;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${background}"/>${showBorder ? `<rect x="1" y="1" width="${Math.max(0,w-2)}" height="${Math.max(0,h-2)}" fill="none" stroke="${foreground}" stroke-opacity=".25" stroke-width="${Math.max(1,Math.min(4,Math.min(w,h)*.004))}"/>` : ""}<g font-family="Arial, Helvetica, sans-serif" fill="${foreground}"><text x="${w/2}" y="${titleY}" font-size="${titleSize}" font-weight="600" text-anchor="middle">${title || "Placeholder Image"}</text>${dims}</g></svg>`;
  }, [w, h, background, foreground, label, showDimensions, showBorder]);

  const previewUrl = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, [svg]);

  function download() {
    setError("");
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setError("Canvas is not available in this browser."); return; }
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (!blob) { setError("Could not generate the PNG. Try smaller dimensions."); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = (downloadName.trim() || "placeholder-image.png").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/\.png$/i, "") + ".png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    image.onerror = () => setError("Could not render the preview. Try another label or color.");
    image.src = previewUrl;
  }

  function reset() {
    setWidth("640"); setHeight("360"); setBackground("#E2E8F0"); setForeground("#334155");
    setLabel("Placeholder Image"); setShowDimensions(true); setShowBorder(true); setError(""); setDownloadName("placeholder-image.png");
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,.9fr)]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-violet-100 p-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><ImageIcon size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Configure placeholder</h2><p className="text-sm text-slate-500 dark:text-slate-400">Create a clean PNG mockup asset without uploading anything.</p></div></div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Quick presets</label>
          <div className="flex flex-wrap gap-2">{presets.map((p) => <button key={p.label} type="button" onClick={() => { setWidth(String(p.width)); setHeight(String(p.height)); setError(""); }} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-violet-400 hover:text-violet-700 dark:border-slate-700 dark:text-slate-200">{p.label} <span className="opacity-60">{p.width}×{p.height}</span></button>)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm font-medium">Width (px)</label><input className={inputClass} type="number" min="1" max="4096" value={width} onChange={(e) => setWidth(e.target.value)} /></div>
          <div><label className="mb-1 block text-sm font-medium">Height (px)</label><input className={inputClass} type="number" min="1" max="4096" value={height} onChange={(e) => setHeight(e.target.value)} /></div>
        </div>
        {(!Number.isInteger(Number(width)) || !Number.isInteger(Number(height)) || Number(width) < 1 || Number(height) < 1 || Number(width) > 4096 || Number(height) > 4096) && <p className="text-sm text-amber-700 dark:text-amber-300">Dimensions must be whole numbers from 1 to 4096 px. Preview uses the nearest safe fallback until corrected.</p>}
        <div><label className="mb-1 block text-sm font-medium">Label text</label><input className={inputClass} maxLength={100} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Product photo" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="mb-2 block text-sm font-medium">Background</label><div className="flex items-center gap-2"><input type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" /><input className={inputClass} value={background.toUpperCase()} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setBackground(e.target.value)} /></div></div>
          <div><label className="mb-2 block text-sm font-medium">Text / border</label><div className="flex items-center gap-2"><input type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" /><input className={inputClass} value={foreground.toUpperCase()} onChange={(e) => /^#[0-9a-fA-F]{6}$/.test(e.target.value) && setForeground(e.target.value)} /></div></div>
        </div>
        <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={showDimensions} onChange={(e) => setShowDimensions(e.target.checked)} /> Show dimensions</label><label className="flex items-center gap-2"><input type="checkbox" checked={showBorder} onChange={(e) => setShowBorder(e.target.checked)} /> Show border</label></div>
        <div><label className="mb-1 block text-sm font-medium">Download filename</label><input className={inputClass} value={downloadName} onChange={(e) => setDownloadName(e.target.value)} maxLength={100} /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Download size={17} /> Download PNG</button><button type="button" onClick={() => { setBackground("#" + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,"0").toUpperCase()); setError(""); }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Shuffle size={16} /> Random background</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">All preview rendering and PNG creation happen locally in your browser. Maximum dimensions: 4096 × 4096 px.</p>
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Live preview</h2><span className="text-xs text-slate-500">{w} × {h} px</span></div><div className="flex min-h-64 items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%,transparent_75%,#f1f5f9_75%),linear-gradient(45deg,#f1f5f9_25%,white_25%,white_75%,#f1f5f9_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px] p-4"><img src={previewUrl} alt={`Placeholder preview ${w} by ${h}`} className="max-h-[460px] max-w-full object-contain shadow-sm" /></div><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Preview scales to fit this panel; downloaded PNG uses the exact selected dimensions.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">Good for</h3><ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300"><li>Website wireframes and prototype cards</li><li>Image placeholders in design mockups</li><li>Quickly testing responsive layouts</li><li>Temporary thumbnails and social templates</li></ul></div>
      </div>
    </section>
  );
}
