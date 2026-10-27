"use client";

import { ArrowRightLeft, Download, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 80_000_000;
type OutputFormat = "image/jpeg" | "image/png" | "image/webp";
const formats: { value: OutputFormat; label: string; ext: string }[] = [
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];
function sizeLabel(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function safeBaseName(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "converted-image"; }

export default function ImageConverterTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; size: number; type: string } | null>(null);

  function clearResult() { setResult((current) => { if (current) URL.revokeObjectURL(current.url); return null; }); }
  function clearAll() {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
    sourceRef.current = null; setSourceUrl(""); setFile(null); setDimensions({ width: 0, height: 0 });
    setProgress(""); setError(""); clearResult();
    if (inputRef.current) inputRef.current.value = "";
  }
  useEffect(() => () => { if (sourceRef.current) URL.revokeObjectURL(sourceRef.current); }, []);

  async function chooseFile(next?: File) {
    setError(""); setProgress(""); clearResult();
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) { setError("Choose a JPG, PNG, or WebP image."); return; }
    if (next.size > MAX_FILE_SIZE) { setError("This image exceeds the 20 MB limit."); return; }
    const url = URL.createObjectURL(next);
    try {
      const image = new Image(); image.decoding = "async"; image.src = url; await image.decode();
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) { URL.revokeObjectURL(url); setError("This image exceeds the 80-megapixel limit."); return; }
      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
      sourceRef.current = url; setSourceUrl(url); setFile(next); setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setFormat(next.type === "image/png" ? "image/webp" : "image/png");
    } catch { URL.revokeObjectURL(url); setError("The image could not be opened. Try another file."); }
  }

  async function convertImage() {
    if (!file || !sourceUrl) { setError("Choose an image first."); return; }
    if (dimensions.width * dimensions.height > MAX_PIXELS) { setError("The image exceeds the processing limit."); return; }
    setBusy(true); setError(""); setProgress("Converting image locally in your browser…"); clearResult();
    try {
      const image = new Image(); image.decoding = "async"; image.src = sourceUrl; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = dimensions.width; canvas.height = dimensions.height;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Your browser could not create an image canvas.");
      if (format === "image/jpeg") { context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, format === "image/png" ? undefined : quality / 100));
      if (!blob) throw new Error("The browser could not encode this format. Try another output format.");
      // Some browsers may silently fall back to PNG when an encoder is unavailable.
      if (blob.type !== format) throw new Error(`Your browser did not support ${formats.find((item) => item.value === format)?.label} encoding. Choose another format.`);
      const extension = formats.find((item) => item.value === format)?.ext ?? "webp";
      const url = URL.createObjectURL(blob); const name = `${safeBaseName(file.name)}-converted.${extension}`;
      setResult({ url, name, size: blob.size, type: blob.type });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      const difference = file.size ? Math.round((1 - blob.size / file.size) * 100) : 0;
      setProgress(`Done — converted to ${extension.toUpperCase()}. ${difference >= 0 ? `${difference}% smaller` : `${Math.abs(difference)}% larger`} than the original.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not convert this image."); setProgress(""); }
    finally { setBusy(false); }
  }

  const formatLabel = formats.find((item) => item.value === format)?.label ?? "WebP";
  return <section aria-label="Convert an image" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
    {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/70 px-5 py-10 text-center dark:border-indigo-900 dark:bg-indigo-950/20 sm:py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"><ArrowRightLeft size={27} /></span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose an image to convert</h2><p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop an image here or select it from your device. Your file stays in your browser.</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700">Select image</button>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WebP · up to 20 MB · max 80 megapixels · local processing</p>
    </div> : <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><ImageIcon size={21} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dimensions.width} × {dimensions.height} px · {sizeLabel(file.size)} · {file.type.replace("image/", "").toUpperCase()}</p></div><button type="button" disabled={busy} onClick={clearAll} aria-label="Remove selected image" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={17} /></button></div>
      <div className="grid gap-5 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Original preview</p><img src={sourceUrl} alt="Original image" className="mx-auto block max-h-96 max-w-full rounded-lg object-contain" /></div>
        <div className="space-y-4"><div><label htmlFor="image-converter-format" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Output format</label><select id="image-converter-format" value={format} onChange={(event) => { setFormat(event.target.value as OutputFormat); clearResult(); }} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white">{formats.map((item) => <option key={item.value} value={item.value}>{item.label}{item.value === file.type ? " (same as original)" : ""}</option>)}</select></div>
          <div><div className="mb-2 flex items-center justify-between"><label htmlFor="image-converter-quality" className="text-sm font-semibold text-slate-900 dark:text-white">Output quality</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{quality}%</span></div><input id="image-converter-quality" type="range" min={10} max={100} step={5} value={quality} onChange={(event) => { setQuality(Number(event.target.value)); clearResult(); }} disabled={busy || format === "image/png"} className="w-full accent-indigo-600" /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Applies to JPG and WebP. PNG uses lossless encoding.</p></div>
          {format === "image/jpeg" && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">JPG does not support transparency. Transparent areas will be filled with white.</p>}
          <button type="button" disabled={busy} onClick={() => void convertImage()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Converting…" : <><ArrowRightLeft size={16} /> Convert to {formatLabel}</>}</button>
        </div></div>
      {result && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/25"><p className="font-semibold text-emerald-900 dark:text-emerald-200">Converted image</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{sizeLabel(file.size)} → {sizeLabel(result.size)} · {result.type.replace("image/", "").toUpperCase()}</p><img src={result.url} alt="Converted image preview" className="mx-auto mt-4 max-h-72 max-w-full rounded-lg object-contain" /><a href={result.url} download={result.name} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={16} /> Download converted image</a></div>}
    </div>}
    {progress && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{progress}</p>}{error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Image metadata is not copied. Browser encoder support may vary; if a selected output format is unavailable, choose another format. PNG output can be larger than the original.</p>
  </section>;
}
