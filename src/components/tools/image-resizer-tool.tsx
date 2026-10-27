"use client";

import { Download, Image as ImageIcon, LockKeyhole, RefreshCw, Trash2, Unlock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 80_000_000;
type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
const formatLabels: Record<OutputFormat, string> = { "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WebP" };
function sizeLabel(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function safeBaseName(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "resized-image"; }

export default function ImageResizerTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [original, setOriginal] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; size: number; width: number; height: number } | null>(null);

  function clearResult() { setResult((current) => { if (current) URL.revokeObjectURL(current.url); return null; }); }
  function clearAll() {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = null; setSourceUrl(""); setFile(null); setOriginal({ width: 0, height: 0 });
    setWidth(0); setHeight(0); setError(""); setProgress(""); clearResult();
    if (inputRef.current) inputRef.current.value = "";
  }
  useEffect(() => () => { if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current); }, []);

  async function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult();
    if (!nextFile) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(nextFile.type) && !/\.(jpe?g|png|webp)$/i.test(nextFile.name)) { setError("Choose a JPG, PNG, or WebP image."); return; }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) { setError("Choose a non-empty image no larger than 20 MB."); return; }
    const url = URL.createObjectURL(nextFile);
    try {
      const image = new Image(); image.decoding = "async"; image.src = url; await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("This image could not be decoded by your browser.");
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw new Error("This image exceeds the 80-megapixel safety limit.");
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = url; setSourceUrl(url); setFile(nextFile);
      setOriginal({ width: image.naturalWidth, height: image.naturalHeight });
      setWidth(image.naturalWidth); setHeight(image.naturalHeight);
      setFormat(nextFile.type === "image/png" ? "image/png" : "image/webp");
      setProgress(`Image loaded: ${image.naturalWidth} × ${image.naturalHeight} pixels.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      URL.revokeObjectURL(url);
      setError(cause instanceof Error ? cause.message : "Could not load this image.");
    }
  }

  function updateWidth(value: number) {
    const next = Math.max(1, Math.min(10000, Math.floor(value || 1)));
    setWidth(next);
    setHeight(keepRatio && original.width ? Math.max(1, Math.round(next * original.height / original.width)) : height);
    clearResult();
  }
  function updateHeight(value: number) {
    const next = Math.max(1, Math.min(10000, Math.floor(value || 1)));
    setHeight(next);
    setWidth(keepRatio && original.height ? Math.max(1, Math.round(next * original.width / original.height)) : width);
    clearResult();
  }

  async function resizeImage() {
    if (!file || !sourceUrl) { setError("Choose an image first."); return; }
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 10000 || height > 10000) { setError("Width and height must be whole numbers from 1 to 10,000 pixels."); return; }
    if (width * height > MAX_PIXELS) { setError("The output would exceed the 80-megapixel safety limit. Choose smaller dimensions."); return; }
    setBusy(true); setError(""); setProgress("Resizing image locally…"); clearResult();
    try {
      const image = new Image(); image.decoding = "async"; image.src = sourceUrl; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not create an image canvas.");
      context.imageSmoothingEnabled = true; context.imageSmoothingQuality = "high";
      if (format === "image/jpeg") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, width, height); }
      context.drawImage(image, 0, 0, width, height);
      setProgress(`Encoding ${formatLabels[format]} at ${quality}% quality…`);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality / 100));
      if (!blob) throw new Error("The browser couldn't encode this format. Try another output format.");
      const actualFormat = (blob.type || format) as OutputFormat;
      const ext = actualFormat === "image/jpeg" ? "jpg" : actualFormat === "image/png" ? "png" : "webp";
      const url = URL.createObjectURL(blob); const name = `${safeBaseName(file.name)}-${width}x${height}.${ext}`;
      setResult({ url, name, size: blob.size, width, height });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — resized to ${width} × ${height} pixels.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not resize this image."); setProgress(""); }
    finally { setBusy(false); }
  }

  return (
    <section aria-label="Resize an image" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/70 px-5 py-10 text-center dark:border-pink-900 dark:bg-pink-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-600 shadow-sm dark:bg-slate-900 dark:text-pink-300"><ImageIcon size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose an image to resize</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop an image here or select it from your device. Files remain in your browser.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700">Select image</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WebP · up to 20 MB · max 80 megapixels · local processing</p>
      </div> : <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300"><ImageIcon size={21} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Original: {original.width} × {original.height} px · {sizeLabel(file.size)}</p></div><button type="button" disabled={busy} onClick={clearAll} aria-label="Remove selected image" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Original preview</p><img src={sourceUrl} alt="Original image preview" className="mx-auto max-h-80 max-w-full rounded-lg object-contain" /></div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3"><div><label htmlFor="resize-width" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Width (px)</label><input id="resize-width" type="number" min={1} max={10000} value={width} onChange={(event) => updateWidth(Number(event.target.value))} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div><div><label htmlFor="resize-height" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Height (px)</label><input id="resize-height" type="number" min={1} max={10000} value={height} onChange={(event) => updateHeight(Number(event.target.value))} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div></div>
            <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={keepRatio} onChange={(event) => setKeepRatio(event.target.checked)} disabled={busy} className="h-4 w-4 accent-pink-600" />{keepRatio ? <LockKeyhole size={16} aria-hidden="true" /> : <Unlock size={16} aria-hidden="true" />} Keep aspect ratio</label>
            <div><label htmlFor="resize-format" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Output format</label><select id="resize-format" value={format} onChange={(event) => { setFormat(event.target.value as OutputFormat); clearResult(); }} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="image/webp">WebP — usually smaller</option><option value="image/jpeg">JPEG — broad compatibility</option><option value="image/png">PNG — lossless</option></select></div>
            <div><div className="mb-2 flex items-center justify-between"><label htmlFor="resize-quality" className="text-sm font-semibold text-slate-900 dark:text-white">Quality</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{quality}%</span></div><input id="resize-quality" type="range" min="10" max="100" step="5" value={quality} onChange={(event) => { setQuality(Number(event.target.value)); clearResult(); }} disabled={busy || format === "image/png"} className="w-full accent-pink-600" /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applies to JPEG and WebP. PNG uses lossless encoding.</p></div>
            <button type="button" disabled={busy} onClick={() => void resizeImage()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Resizing…" : <><RefreshCw size={16} /> Resize image</>}</button>
          </div>
        </div>
        {result && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/25"><p className="font-semibold text-emerald-900 dark:text-emerald-200">Resize result</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{result.width} × {result.height} px · {sizeLabel(result.size)}</p><img src={result.url} alt="Resized image preview" className="mx-auto mt-4 max-h-72 max-w-full rounded-lg object-contain" /><a href={result.url} download={result.name} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={16} /> Download resized image</a></div>}
      </div>}
      {progress && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{progress}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Note: JPEG output replaces transparent areas with white. Resizing can reduce sharpness, especially when enlarging small images. Output quality depends on the source image and browser encoder.</p>
    </section>
  );
}
