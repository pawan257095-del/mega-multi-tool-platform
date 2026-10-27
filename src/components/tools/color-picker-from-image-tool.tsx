"use client";

import { Check, Copy, Image as ImageIcon, RotateCcw, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PickedColor = { r: number; g: number; b: number; hex: string; rgb: string; hsl: string };
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;

function toHex(n: number) { return n.toString(16).padStart(2, "0").toUpperCase(); }
function makeColor(r: number, g: number, b: number): PickedColor {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return { r, g, b, hex: `#${toHex(r)}${toHex(g)}${toHex(b)}`, rgb: `rgb(${r}, ${g}, ${b})`, hsl: `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)` };
}

export default function ColorPickerFromImageTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [picked, setPicked] = useState<PickedColor | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  async function loadFile(file?: File) {
    setError(""); setCopied(""); setPicked(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Choose an image file."); return; }
    if (file.size > MAX_BYTES) { setError("Image exceeds the 20 MB file limit."); return; }
    setBusy(true);
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error("The image could not be opened.")); img.src = url; });
      if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth * img.naturalHeight > MAX_PIXELS) throw new Error("Image dimensions exceed the 40-megapixel safety limit.");
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d", { willReadFrequently: true });
      if (!canvas || !ctx) throw new Error("Your browser could not create an image canvas.");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      imageRef.current = img;
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setFileName(file.name);
      setPreviewUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
    } catch (reason) {
      URL.revokeObjectURL(url);
      setError(reason instanceof Error ? reason.message : "Could not load this image.");
    } finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  function pickAt(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { willReadFrequently: true });
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(canvas.width - 1, Math.max(0, Math.floor((event.clientX - rect.left) / rect.width * canvas.width)));
    const y = Math.min(canvas.height - 1, Math.max(0, Math.floor((event.clientY - rect.top) / rect.height * canvas.height)));
    try { const data = ctx.getImageData(x, y, 1, 1).data; setPicked(makeColor(data[0], data[1], data[2])); setCopied(""); }
    catch { setError("This image cannot be sampled by the browser canvas."); }
  }

  async function copy(value: string, label: string) {
    try { await navigator.clipboard.writeText(value); setCopied(label); setError(""); }
    catch { setError("Clipboard access was blocked. Copy the value manually."); }
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    imageRef.current = null; setPreviewUrl(""); setFileName(""); setDimensions({ width: 0, height: 0 }); setPicked(null); setError(""); setCopied("");
    if (inputRef.current) inputRef.current.value = "";
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d"); if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Upload an image</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Click any point in the image to sample its color.</p></div>{previewUrl && <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"><RotateCcw size={15}/> Reset</button>}</div>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => void loadFile(e.target.files?.[0])} className="mt-5 block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:font-semibold file:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Image files only · max 20 MB and 40 megapixels · stays in this browser.</p>
      {busy && <p className="mt-4 text-sm text-violet-600">Loading image…</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
    </section>
    {previewUrl && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{fileName}</h2><p className="text-sm text-slate-500 dark:text-slate-400">{dimensions.width} × {dimensions.height} px</p></div><span className="inline-flex items-center gap-2 text-xs text-slate-500"><Upload size={14}/> Click to sample</span></div>
      <div className="overflow-auto rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-2 dark:border-slate-700"><canvas ref={canvasRef} onClick={pickAt} aria-label="Image color sampling canvas" className="mx-auto block h-auto max-h-[650px] max-w-full cursor-crosshair object-contain" style={{ width: "auto" }} /></div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Tip: zoom in using your browser if you need to sample a tiny detail. Transparent pixels are reported by their RGB color without an alpha value.</p>
    </section>}
    {picked && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Selected color</h2><div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]"><div className="min-h-32 rounded-xl border border-slate-200 shadow-inner dark:border-slate-700" style={{ backgroundColor: picked.hex }} /><div className="space-y-3">{([{ label: "HEX", value: picked.hex }, { label: "RGB", value: picked.rgb }, { label: "HSL", value: picked.hsl }] as const).map((item) => <div key={item.label} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.label}</p><p className="mt-1 font-mono text-sm text-slate-900 dark:text-white">{item.value}</p></div><button type="button" onClick={() => void copy(item.value, item.label)} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-700">{copied === item.label ? <Check size={15}/> : <Copy size={15}/>} {copied === item.label ? "Copied" : "Copy"}</button></div>)}<button type="button" onClick={() => void copy(`${picked.hex}\n${picked.rgb}\n${picked.hsl}`, "all")} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200">{copied === "all" ? <Check size={15}/> : <Copy size={15}/>} Copy all formats</button></div></div></section>}
    {!previewUrl && <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700"><ImageIcon className="mx-auto text-slate-400" size={34}/><p className="mt-3 font-medium text-slate-700 dark:text-slate-200">Your image preview will appear here</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Upload an image, then click a pixel to see its color values.</p></div>}
  </div>;
}
