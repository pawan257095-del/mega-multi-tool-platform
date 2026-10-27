"use client";

import { PDFDocument, degrees } from "pdf-lib";
import { FileImage, FilePlus2, LoaderCircle, Trash2, Download, RotateCw, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

type ImageItem = { id: string; file: File; preview: string; rotation: number };
const MAX_FILES = 30;
const MAX_FILE_SIZE = 15 * 1024 * 1024;

function isSupportedImage(file: File) {
  return file.type === "image/jpeg" || file.type === "image/png" || /\.(jpe?g|png)$/i.test(file.name);
}

export default function JpgToPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function addFiles(fileList: FileList | File[]) {
    setError(""); setStatus("");
    const incoming = Array.from(fileList);
    const accepted: ImageItem[] = [];
    for (const file of incoming) {
      if (!isSupportedImage(file)) { setError(`${file.name}: only JPG and PNG images are supported.`); continue; }
      if (file.size > MAX_FILE_SIZE) { setError(`${file.name}: file exceeds the 15 MB per-image limit.`); continue; }
      accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, file, preview: URL.createObjectURL(file), rotation: 0 });
    }
    setImages((current) => {
      const remaining = Math.max(0, MAX_FILES - current.length);
      const next = [...current, ...accepted.slice(0, remaining)];
      if (accepted.length > remaining) setError(`You can add up to ${MAX_FILES} images per PDF.`);
      return next;
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function removeImage(id: string) {
    setImages((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((item) => item.id !== id);
    });
  }

  function moveImage(index: number, offset: number) {
    setImages((current) => {
      const nextIndex = index + offset;
      if (nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function rotateImage(id: string, degrees: number) {
    setImages((current) => current.map((item) => item.id === id
      ? { ...item, rotation: (item.rotation + degrees + 360) % 360 }
      : item));
  }

  async function createPdf() {
    if (!images.length) { setError("Add at least one JPG or PNG image first."); return; }
    setBusy(true); setError(""); setStatus("Creating your PDF locally…");
    try {
      const pdf = await PDFDocument.create();
      for (const item of images) {
        const bytes = await item.file.arrayBuffer();
        const embedded = item.file.type === "image/png" || /\.png$/i.test(item.file.name)
          ? await pdf.embedPng(bytes)
          : await pdf.embedJpg(bytes);
        const pageWidth = 595.28;
        const pageHeight = 841.89;
        const margin = 24;
        const rotated = item.rotation % 180 !== 0;
        const fitWidth = rotated ? embedded.height : embedded.width;
        const fitHeight = rotated ? embedded.width : embedded.height;
        const scale = Math.min((pageWidth - margin * 2) / fitWidth, (pageHeight - margin * 2) / fitHeight);
        const width = embedded.width * scale;
        const height = embedded.height * scale;
        const page = pdf.addPage([pageWidth, pageHeight]);
        page.drawImage(embedded, {
          x: pageWidth / 2 - width / 2,
          y: pageHeight / 2 - height / 2,
          width,
          height,
          rotate: degrees(item.rotation),
        });
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "images.pdf"; anchor.click();
      URL.revokeObjectURL(url);
      setStatus(`Done — created a ${images.length}-page PDF.`);
    } catch (e) {
      setError(e instanceof Error ? `Could not create the PDF: ${e.message}` : "Could not create the PDF. Please check the selected images and try again.");
      setStatus("");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="JPG to PDF converter">
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,.jpg,.jpeg,.png" multiple className="sr-only" onChange={(event) => event.target.files && addFiles(event.target.files)} />
      <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><FilePlus2 size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose images to convert</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Drop JPG or PNG files here, or browse your device.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">Select images</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Up to {MAX_FILES} images · 15 MB per image · files stay on your device</p>
      </div>

      {images.length > 0 && <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">Selected images ({images.length})</h3><p className="text-xs text-slate-500 dark:text-slate-400">Use arrows to change PDF page order.</p></div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">{images.map((item, index) => <li key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="flex h-56 items-center justify-center bg-slate-50 p-3 dark:bg-slate-950/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt={`Preview of page ${index + 1}: ${item.file.name}`} className="max-h-full max-w-full object-contain transition-transform duration-200" style={{ transform: `rotate(${item.rotation}deg)` }} />
          </div>
          <div className="p-3">
            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{index + 1}. {item.file.name}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB · Rotation {item.rotation}°</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" aria-label={`Rotate ${item.file.name} anticlockwise`} onClick={() => rotateImage(item.id, -90)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><RotateCcw size={16} /> Rotate left</button>
              <button type="button" aria-label={`Rotate ${item.file.name} clockwise`} onClick={() => rotateImage(item.id, 90)} className="inline-flex min-h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"><RotateCw size={16} /> Rotate right</button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button type="button" aria-label={`Move ${item.file.name} up`} disabled={index === 0} onClick={() => moveImage(index, -1)} className="min-h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-30 dark:border-slate-700">↑ Up</button>
                <button type="button" aria-label={`Move ${item.file.name} down`} disabled={index === images.length - 1} onClick={() => moveImage(index, 1)} className="min-h-10 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-30 dark:border-slate-700">↓ Down</button>
              </div>
              <button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => removeImage(item.id)} className="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={16} /> Remove</button>
            </div>
          </div>
        </li>)}</ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={createPdf} disabled={busy || images.length === 0} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />} {busy ? "Creating PDF…" : "Convert and download PDF"}</button><button type="button" onClick={() => { images.forEach((item) => URL.revokeObjectURL(item.preview)); setImages([]); setError(""); setStatus(""); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Clear all</button></div>
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400"><FileImage size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Each image becomes one page in an A4-sized PDF, scaled to fit while preserving aspect ratio. This tool currently supports JPG and PNG only.</p>
    </section>
  );
}
