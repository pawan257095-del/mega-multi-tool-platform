"use client";

import { Download, Image as ImageIcon, RefreshCw, Trash2, Type } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 80_000_000;
type Position = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
const positions: { value: Position; label: string }[] = [
  { value: "center", label: "Center" }, { value: "top-left", label: "Top left" }, { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" }, { value: "bottom-right", label: "Bottom right" },
];
function sizeLabel(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function baseName(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "watermarked-image"; }

export default function ImageWatermarkTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const markInputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<string | null>(null);
  const markRef = useRef<string | null>(null);
  const resultRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [markFile, setMarkFile] = useState<File | null>(null);
  const [markUrl, setMarkUrl] = useState("");
  const [mode, setMode] = useState<"text" | "image">("text");
  const [text, setText] = useState("© Your Brand");
  const [color, setColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(36);
  const [scale, setScale] = useState(24);
  const [opacity, setOpacity] = useState(65);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(null);

  function clearResult() { if (resultRef.current) URL.revokeObjectURL(resultRef.current); resultRef.current = null; setResult(null); }
  function clearAll() {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
    sourceRef.current = null; setSourceUrl(""); setFile(null); clearResult(); setError(""); setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }
  function clearMark() { if (markRef.current) URL.revokeObjectURL(markRef.current); markRef.current = null; setMarkUrl(""); setMarkFile(null); if (markInputRef.current) markInputRef.current.value = ""; }
  useEffect(() => () => { if (sourceRef.current) URL.revokeObjectURL(sourceRef.current); if (markRef.current) URL.revokeObjectURL(markRef.current); if (resultRef.current) URL.revokeObjectURL(resultRef.current); }, []);

  async function chooseImage(next?: File) {
    setError(""); setStatus(""); clearResult(); if (!next) return;
    if (!next.type.startsWith("image/")) { setError("Choose a valid image file."); return; }
    if (next.size > MAX_FILE_SIZE) { setError("The image exceeds the 20 MB limit."); return; }
    const url = URL.createObjectURL(next);
    try {
      const image = new Image(); image.src = url; await image.decode();
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw new Error("The image exceeds the 80-megapixel limit.");
      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current); sourceRef.current = url; setSourceUrl(url); setFile(next);
    } catch (cause) { URL.revokeObjectURL(url); setError(cause instanceof Error ? cause.message : "Could not open this image."); }
  }
  async function chooseMark(next?: File) {
    setError(""); clearResult(); if (!next) return;
    if (!next.type.startsWith("image/")) { setError("Choose a valid watermark image."); return; }
    if (next.size > 5 * 1024 * 1024) { setError("The watermark image must be 5 MB or smaller."); return; }
    const url = URL.createObjectURL(next);
    try { const image = new Image(); image.src = url; await image.decode(); if (markRef.current) URL.revokeObjectURL(markRef.current); markRef.current = url; setMarkUrl(url); setMarkFile(next); }
    catch { URL.revokeObjectURL(url); setError("Could not open the watermark image."); }
  }

  async function applyWatermark() {
    if (!file || !sourceUrl) { setError("Choose an image first."); return; }
    if (mode === "text" && !text.trim()) { setError("Enter watermark text."); return; }
    if (mode === "image" && !markUrl) { setError("Choose a watermark image."); return; }
    setBusy(true); setError(""); setStatus("Applying watermark locally in your browser…"); clearResult();
    try {
      const image = new Image(); image.src = sourceUrl; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Your browser could not create an image canvas.");
      ctx.drawImage(image, 0, 0); ctx.save(); ctx.globalAlpha = opacity / 100;
      let markWidth = 0; let markHeight = 0;
      let markImage: HTMLImageElement | null = null;
      if (mode === "text") {
        const size = Math.max(8, Math.round(fontSize * (canvas.width / 1000)));
        ctx.font = `700 ${size}px Arial, sans-serif`; ctx.textBaseline = "middle"; ctx.fillStyle = color;
        ctx.shadowColor = "rgba(0,0,0,0.35)"; ctx.shadowBlur = Math.max(1, size * 0.08); markWidth = ctx.measureText(text.trim()).width; markHeight = size * 1.25;
      } else {
        markImage = new Image(); markImage.src = markUrl; await markImage.decode();
        markWidth = canvas.width * (scale / 100); markHeight = markWidth * (markImage.naturalHeight / markImage.naturalWidth);
        if (markHeight > canvas.height * 0.8) { markHeight = canvas.height * 0.8; markWidth = markHeight * (markImage.naturalWidth / markImage.naturalHeight); }
      }
      const pad = Math.max(12, Math.round(Math.min(canvas.width, canvas.height) * 0.025));
      let x = pad; let y = pad;
      if (position === "top-right") { x = canvas.width - markWidth - pad; y = pad; }
      if (position === "bottom-left") { x = pad; y = canvas.height - markHeight - pad; }
      if (position === "bottom-right") { x = canvas.width - markWidth - pad; y = canvas.height - markHeight - pad; }
      if (position === "center") { x = (canvas.width - markWidth) / 2; y = (canvas.height - markHeight) / 2; }
      ctx.translate(x + markWidth / 2, y + markHeight / 2); ctx.rotate(rotation * Math.PI / 180);
      if (mode === "text") ctx.fillText(text.trim(), -markWidth / 2, 0);
      else if (markImage) ctx.drawImage(markImage, -markWidth / 2, -markHeight / 2, markWidth, markHeight);
      ctx.restore();
      const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, 0.94));
      if (!blob) throw new Error("The browser could not export the watermarked image.");
      const url = URL.createObjectURL(blob); resultRef.current = url;
      const ext = outputType === "image/jpeg" ? "jpg" : "png"; const name = `${baseName(file.name)}-watermarked.${ext}`;
      setResult({ url, name, size: blob.size }); setStatus("Watermark applied. Your original file remains unchanged.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not apply the watermark."); setStatus(""); }
    finally { setBusy(false); }
  }

  return <section aria-label="Add an image watermark" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => void chooseImage(event.target.files?.[0])} />
    <input ref={markInputRef} type="file" accept="image/*" className="sr-only" onChange={(event) => void chooseMark(event.target.files?.[0])} />
    {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseImage(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/70 px-5 py-10 text-center dark:border-indigo-900 dark:bg-indigo-950/20 sm:py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"><ImageIcon size={27} /></span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose an image to watermark</h2><p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Add a text or logo watermark. Your image stays in your browser.</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Select image</button>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Common image formats · up to 20 MB · max 80 megapixels · local processing</p>
    </div> : <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><ImageIcon size={21} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sizeLabel(file.size)} · {file.type}</p></div><button type="button" disabled={busy} onClick={clearAll} aria-label="Remove selected image" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={17} /></button></div>
      <div className="grid gap-5 lg:grid-cols-2"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Original preview</p><img src={sourceUrl} alt="Original image" className="mx-auto block max-h-[440px] max-w-full rounded-lg object-contain" /></div>
        <div className="space-y-4">
          <div><label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Watermark type</label><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => { setMode("text"); clearResult(); }} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === "text" ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><Type className="mr-2 inline" size={16} />Text</button><button type="button" onClick={() => { setMode("image"); clearResult(); }} className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${mode === "image" ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><ImageIcon className="mr-2 inline" size={16} />Image / logo</button></div></div>
          {mode === "text" ? <><div><label htmlFor="watermark-text" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Watermark text</label><input id="watermark-text" value={text} onChange={(event) => { setText(event.target.value); clearResult(); }} maxLength={120} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" placeholder="© Your Brand" /></div><div className="grid grid-cols-2 gap-3"><div><label htmlFor="watermark-color" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Text color</label><input id="watermark-color" type="color" value={color} onChange={(event) => { setColor(event.target.value); clearResult(); }} className="h-10 w-full rounded-lg border border-slate-300 p-1 dark:border-slate-700" /></div><div><label htmlFor="watermark-font-size" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Font size</label><input id="watermark-font-size" type="number" min={8} max={160} value={fontSize} onChange={(event) => { setFontSize(Math.min(160, Math.max(8, Number(event.target.value) || 8))); clearResult(); }} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900" /></div></div></> : <div className="rounded-xl border border-dashed border-slate-300 p-3 dark:border-slate-700"><p className="text-sm font-semibold text-slate-900 dark:text-white">Watermark logo</p>{markFile ? <div className="mt-2 flex items-center gap-3"><img src={markUrl} alt="Watermark logo" className="h-14 w-14 rounded-lg border object-contain" /><span className="min-w-0 flex-1 truncate text-xs text-slate-500">{markFile.name}</span><button type="button" onClick={clearMark} className="text-xs font-semibold text-rose-600">Remove</button></div> : <button type="button" onClick={() => markInputRef.current?.click()} className="mt-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Choose watermark image</button>}</div>}
          <div><div className="mb-2 flex justify-between"><label htmlFor="watermark-opacity" className="text-sm font-semibold text-slate-900 dark:text-white">Opacity</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{opacity}%</span></div><input id="watermark-opacity" type="range" min={5} max={100} value={opacity} onChange={(event) => { setOpacity(Number(event.target.value)); clearResult(); }} className="w-full accent-indigo-600" /></div>
          {mode === "image" && <div><div className="mb-2 flex justify-between"><label htmlFor="watermark-scale" className="text-sm font-semibold text-slate-900 dark:text-white">Logo width</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{scale}%</span></div><input id="watermark-scale" type="range" min={5} max={60} value={scale} onChange={(event) => { setScale(Number(event.target.value)); clearResult(); }} className="w-full accent-indigo-600" /></div>}
          <div><label htmlFor="watermark-position" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Position</label><select id="watermark-position" value={position} onChange={(event) => { setPosition(event.target.value as Position); clearResult(); }} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-900">{positions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
          <div><div className="mb-2 flex justify-between"><label htmlFor="watermark-rotation" className="text-sm font-semibold text-slate-900 dark:text-white">Rotation</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{rotation}°</span></div><input id="watermark-rotation" type="range" min={-180} max={180} value={rotation} onChange={(event) => { setRotation(Number(event.target.value)); clearResult(); }} className="w-full accent-indigo-600" /></div>
          <button type="button" disabled={busy} onClick={() => void applyWatermark()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Applying…" : <><RefreshCw size={16} /> Apply watermark</>}</button>
        </div></div>
      {result && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/25"><p className="font-semibold text-emerald-900 dark:text-emerald-200">Watermarked image</p><p className="mt-1 text-sm text-slate-700 dark:text-slate-300">Output size: {sizeLabel(result.size)}</p><img src={result.url} alt="Watermarked result preview" className="mx-auto mt-4 max-h-96 max-w-full rounded-lg object-contain" /><a href={result.url} download={result.name} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={16} /> Download watermarked image</a></div>}
    </div>}
    {status && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{status}</p>}{error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Processing is local. Output is PNG for transparency-friendly source images and JPG for JPEG source images; metadata is not preserved. The watermark is baked into the output and cannot be edited separately afterward.</p>
  </section>;
}
