"use client";

import { Crop, Download, Image as ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 80_000_000;
type Ratio = "free" | "1:1" | "4:3" | "3:2" | "16:9";
const ratios: Record<Ratio, number | null> = { free: null, "1:1": 1, "4:3": 4 / 3, "3:2": 3 / 2, "16:9": 16 / 9 };
function sizeLabel(bytes: number) { return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`; }
function safeBaseName(name: string) { return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "cropped-image"; }

export default function ImageCropperTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceRef = useRef<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [x, setX] = useState(0); const [y, setY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0); const [cropHeight, setCropHeight] = useState(0);
  const [ratio, setRatio] = useState<Ratio>("free");
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false); const [progress, setProgress] = useState(""); const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string; size: number; width: number; height: number } | null>(null);

  function clearResult() { setResult((current) => { if (current) URL.revokeObjectURL(current.url); return null; }); }
  function clearAll() {
    if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
    sourceRef.current = null; setSourceUrl(""); setFile(null); setDimensions({ width: 0, height: 0 });
    setX(0); setY(0); setCropWidth(0); setCropHeight(0); setRatio("free"); setProgress(""); setError(""); clearResult();
    if (inputRef.current) inputRef.current.value = "";
  }
  useEffect(() => () => { if (sourceRef.current) URL.revokeObjectURL(sourceRef.current); }, []);

  async function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult(); if (!nextFile) return;
    if (!/^image\/(jpeg|png|webp)$/i.test(nextFile.type) && !/\.(jpe?g|png|webp)$/i.test(nextFile.name)) { setError("Choose a JPG, PNG, or WebP image."); return; }
    if (!nextFile.size || nextFile.size > MAX_FILE_SIZE) { setError("Choose a non-empty image no larger than 20 MB."); return; }
    const url = URL.createObjectURL(nextFile);
    try {
      const image = new Image(); image.decoding = "async"; image.src = url; await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error("This image could not be decoded by your browser.");
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) throw new Error("This image exceeds the 80-megapixel safety limit.");
      if (sourceRef.current) URL.revokeObjectURL(sourceRef.current);
      sourceRef.current = url; setSourceUrl(url); setFile(nextFile); setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setX(0); setY(0); setCropWidth(image.naturalWidth); setCropHeight(image.naturalHeight); setRatio("free");
      setProgress(`Image loaded: ${image.naturalWidth} × ${image.naturalHeight} pixels.`); if (inputRef.current) inputRef.current.value = "";
    } catch (cause) { URL.revokeObjectURL(url); setError(cause instanceof Error ? cause.message : "Could not load this image."); }
  }
  function boundedX(value: number) { return Math.max(0, Math.min(dimensions.width - cropWidth, Math.floor(value || 0))); }
  function boundedY(value: number) { return Math.max(0, Math.min(dimensions.height - cropHeight, Math.floor(value || 0))); }
  function changeRatio(next: Ratio) {
    setRatio(next); clearResult(); const target = ratios[next];
    if (!target || !dimensions.width || !dimensions.height) return;
    let w = Math.min(cropWidth || dimensions.width, dimensions.width); let h = Math.round(w / target);
    if (h > dimensions.height) { h = dimensions.height; w = Math.round(h * target); }
    w = Math.max(1, Math.min(dimensions.width, w)); h = Math.max(1, Math.min(dimensions.height, h));
    setCropWidth(w); setCropHeight(h); setX(Math.min(x, dimensions.width - w)); setY(Math.min(y, dimensions.height - h));
  }
  function changeCropWidth(value: number) {
    const w = Math.max(1, Math.min(dimensions.width, Math.floor(value || 1))); const target = ratios[ratio];
    if (target) { const h = Math.max(1, Math.min(dimensions.height, Math.round(w / target))); setCropHeight(h); setX(Math.min(x, dimensions.width - w)); setY(Math.min(y, dimensions.height - h)); }
    setCropWidth(w); clearResult();
  }
  function changeCropHeight(value: number) {
    const h = Math.max(1, Math.min(dimensions.height, Math.floor(value || 1))); const target = ratios[ratio];
    if (target) { const w = Math.max(1, Math.min(dimensions.width, Math.round(h * target))); setCropWidth(w); setX(Math.min(x, dimensions.width - w)); setY(Math.min(y, dimensions.height - h)); }
    setCropHeight(h); clearResult();
  }
  async function cropImage() {
    if (!file || !sourceUrl) { setError("Choose an image first."); return; }
    if (![x, y, cropWidth, cropHeight].every(Number.isInteger) || x < 0 || y < 0 || cropWidth < 1 || cropHeight < 1 || x + cropWidth > dimensions.width || y + cropHeight > dimensions.height) { setError("Crop coordinates must fit inside the original image."); return; }
    setBusy(true); setError(""); setProgress("Cropping image locally…"); clearResult();
    try {
      const image = new Image(); image.decoding = "async"; image.src = sourceUrl; await image.decode();
      const canvas = document.createElement("canvas"); canvas.width = cropWidth; canvas.height = cropHeight;
      const context = canvas.getContext("2d"); if (!context) throw new Error("Your browser could not create an image canvas.");
      context.drawImage(image, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      const outputType = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, outputType === "image/png" ? undefined : quality / 100));
      if (!blob) throw new Error("The browser could not encode the cropped image.");
      const ext = outputType === "image/png" ? "png" : outputType === "image/webp" ? "webp" : "jpg";
      const url = URL.createObjectURL(blob); const name = `${safeBaseName(file.name)}-cropped.${ext}`;
      setResult({ url, name, size: blob.size, width: cropWidth, height: cropHeight });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — cropped to ${cropWidth} × ${cropHeight} pixels.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not crop this image."); setProgress(""); }
    finally { setBusy(false); }
  }

  return <section aria-label="Crop an image" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
    {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-pink-200 bg-pink-50/70 px-5 py-10 text-center dark:border-pink-900 dark:bg-pink-950/20 sm:py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-pink-600 shadow-sm dark:bg-slate-900 dark:text-pink-300"><Crop size={27} /></span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose an image to crop</h2><p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop an image here or select it from your device. Files remain in your browser.</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700">Select image</button>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WebP · up to 20 MB · max 80 megapixels · local processing</p>
    </div> : <div className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-300"><ImageIcon size={21} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Original: {dimensions.width} × {dimensions.height} px · {sizeLabel(file.size)}</p></div><button type="button" disabled={busy} onClick={clearAll} aria-label="Remove selected image" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={17} /></button></div>
      <div className="grid gap-5 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Original preview</p><div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-lg"><img src={sourceUrl} alt="Original image" className="block max-h-96 max-w-full object-contain" /><div aria-hidden="true" className="pointer-events-none absolute border-2 border-pink-500 bg-pink-500/10" style={{ left: `${(x / dimensions.width) * 100}%`, top: `${(y / dimensions.height) * 100}%`, width: `${(cropWidth / dimensions.width) * 100}%`, height: `${(cropHeight / dimensions.height) * 100}%` }} /></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Pink outline indicates the crop area. Use the pixel controls to adjust its position and size.</p></div>
        <div className="space-y-4"><div><label htmlFor="crop-ratio" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Aspect-ratio preset</label><select id="crop-ratio" value={ratio} onChange={(event) => changeRatio(event.target.value as Ratio)} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="free">Free crop</option><option value="1:1">Square (1:1)</option><option value="4:3">Landscape (4:3)</option><option value="3:2">Photo (3:2)</option><option value="16:9">Widescreen (16:9)</option></select></div>
          <div className="grid grid-cols-2 gap-3">{[["crop-x","Left (X)",x,setX,dimensions.width-cropWidth],["crop-y","Top (Y)",y,setY,dimensions.height-cropHeight]].map(([id,label,value,setter,max]) => <div key={String(id)}><label htmlFor={String(id)} className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">{String(label)} (px)</label><input id={String(id)} type="number" min={0} max={Number(max)} value={Number(value)} onChange={(event) => { (setter as (v:number)=>void)(Math.max(0,Math.min(Number(max),Math.floor(Number(event.target.value)||0)))); clearResult(); }} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div>)}</div>
          <div className="grid grid-cols-2 gap-3"><div><label htmlFor="crop-width" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Crop width (px)</label><input id="crop-width" type="number" min={1} max={dimensions.width} value={cropWidth} onChange={(event) => changeCropWidth(Number(event.target.value))} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div><div><label htmlFor="crop-height" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Crop height (px)</label><input id="crop-height" type="number" min={1} max={dimensions.height} value={cropHeight} onChange={(event) => changeCropHeight(Number(event.target.value))} disabled={busy} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" /></div></div>
          <div><div className="mb-2 flex items-center justify-between"><label htmlFor="crop-quality" className="text-sm font-semibold text-slate-900 dark:text-white">JPEG/WebP quality</label><span className="text-sm tabular-nums text-slate-600 dark:text-slate-300">{quality}%</span></div><input id="crop-quality" type="range" min={10} max={100} step={5} value={quality} onChange={(event) => { setQuality(Number(event.target.value)); clearResult(); }} disabled={busy || file.type === "image/png"} className="w-full accent-pink-600" /><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Only applies to JPEG/WebP. PNG remains lossless.</p></div>
          <button type="button" disabled={busy} onClick={() => void cropImage()} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Cropping…" : <><Crop size={16} /> Crop image</>}</button>
        </div></div>
      {result && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/25"><p className="font-semibold text-emerald-900 dark:text-emerald-200">Crop result</p><p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{result.width} × {result.height} px · {sizeLabel(result.size)}</p><img src={result.url} alt="Cropped image preview" className="mx-auto mt-4 max-h-72 max-w-full rounded-lg object-contain" /><a href={result.url} download={result.name} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={16} /> Download cropped image</a></div>}
    </div>}
    {progress && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{progress}</p>}{error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">The crop is defined with pixel coordinates rather than drag handles. JPEG output may not retain transparency; source metadata is not copied to the output.</p>
  </section>;
}
