"use client";

import { FileImage, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";

type Metadata = {
  name: string; type: string; size: number; width: number; height: number;
  modified: string; exif: Record<string, string>;
};
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_PIXELS = 80_000_000;
const EXIF_TAGS: Record<number, string> = { 0x010f: "Camera make", 0x0110: "Camera model", 0x0112: "Orientation", 0x0132: "Date/time", 0x9003: "Date taken", 0x9286: "User comment" };

function readJpegExif(buffer: ArrayBuffer): Record<string, string> {
  const view = new DataView(buffer);
  const result: Record<string, string> = {};
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return result;
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);
    if (length < 2 || offset + 2 + length > view.byteLength) break;
    if (marker === 0xe1 && length >= 10) {
      const start = offset + 4;
      if (view.getUint32(start) !== 0x45786966 || view.getUint16(start + 4) !== 0) return result;
      const tiff = start + 6;
      const endian = view.getUint16(tiff);
      const little = endian === 0x4949;
      if (!little && endian !== 0x4d4d) return result;
      const u16 = (p: number) => view.getUint16(p, little);
      const u32 = (p: number) => view.getUint32(p, little);
      if (u16(tiff + 2) !== 42) return result;
      const ifd = tiff + u32(tiff + 4);
      if (ifd + 2 > view.byteLength) return result;
      const count = Math.min(u16(ifd), 256);
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > view.byteLength) break;
        const tag = u16(entry); const format = u16(entry + 2); const n = u32(entry + 4);
        const label = EXIF_TAGS[tag];
        if (!label || n < 1) continue;
        let value = "";
        if (format === 3 && n === 1) value = String(u16(entry + 8));
        else if (format === 4 && n === 1) value = String(u32(entry + 8));
        else if (format === 2 && n <= 1024) {
          const pos = n <= 4 ? entry + 8 : tiff + u32(entry + 8);
          if (pos >= 0 && pos + n <= view.byteLength) {
            const bytes = new Uint8Array(buffer, pos, n);
            value = new TextDecoder().decode(bytes).replace(/\0+$/, "").trim();
          }
        }
        if (value) result[label] = tag === 0x0112 ? ({ "1": "Normal", "3": "Rotated 180°", "6": "Rotated 90° clockwise", "8": "Rotated 90° counter-clockwise" }[value] ?? value) : value;
      }
      return result;
    }
    offset += 2 + length;
  }
  return result;
}
function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageMetadataViewerTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setMetadata(null); setPreviewUrl(""); setError(""); setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function inspect(file?: File) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose a supported image file."); return; }
    if (file.size > MAX_BYTES) { setError("Image exceeds the 20 MB safety limit."); return; }
    setBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      if (!width || !height || width * height > MAX_PIXELS) throw new Error("Image dimensions exceed the 80-megapixel safety limit.");
      const exif = file.type === "image/jpeg" ? readJpegExif(await file.arrayBuffer()) : {};
      const url = URL.createObjectURL(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(url);
      setMetadata({ name: file.name, type: file.type || "Unknown", size: file.size, width, height, modified: file.lastModified ? new Date(file.lastModified).toLocaleString() : "Not available", exif });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not read this image. It may be corrupted or unsupported.");
    } finally { setBusy(false); }
  }

  const rows = metadata ? [
    ["File name", metadata.name], ["MIME type", metadata.type], ["File size", formatBytes(metadata.size)],
    ["Dimensions", `${metadata.width.toLocaleString()} × ${metadata.height.toLocaleString()} px`],
    ["Aspect ratio", `${(metadata.width / metadata.height).toFixed(3)}:1`], ["Last modified", metadata.modified],
    ...Object.entries(metadata.exif),
  ] : [];

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Inspect an image</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">View dimensions, file details, and common EXIF fields when available. Everything is read locally.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => inspect(e.target.files?.[0])} className="sr-only" id="image-metadata-file" />
      <label htmlFor="image-metadata-file" className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center hover:border-violet-400 dark:border-slate-700 dark:bg-slate-950"><Upload size={26} className="text-violet-600"/><span className="mt-3 font-semibold text-slate-800 dark:text-slate-200">Choose an image</span><span className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPEG, PNG, WebP, GIF, BMP and other browser-supported formats · max 20 MB</span></label>
      {busy && <p className="mt-4 text-sm text-violet-600">Reading metadata…</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
    </section>
    {metadata && <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><FileImage size={18} className="text-violet-600"/><h2 className="font-semibold text-slate-900 dark:text-white">Preview</h2></div><div className="mt-4 flex min-h-56 items-center justify-center rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><img src={previewUrl} alt="Selected image preview" className="max-h-[26rem] max-w-full object-contain" /></div></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold text-slate-900 dark:text-white">Metadata details</h2><dl className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-3 py-3 text-sm"><dt className="text-slate-500 dark:text-slate-400">{label}</dt><dd className="break-words font-medium text-slate-800 dark:text-slate-200">{value}</dd></div>)}</dl>{Object.keys(metadata.exif).length === 0 && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-950 dark:text-slate-400">No supported EXIF fields were found. The file may not contain EXIF data, or its metadata format may not be supported by this lightweight viewer.</p>}</div>
    </section>}
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy note: image bytes are read in your browser and are not uploaded. Some image formats do not store EXIF metadata. This tool reads common EXIF tags from JPEG files only; it does not modify or strip metadata.</p>
  </div>;
}
