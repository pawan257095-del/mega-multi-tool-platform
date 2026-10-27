"use client";

import { PDFDocument } from "pdf-lib";
import { Download, FileArchive, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_PAGES = 30;

type CompressionPreset = "small" | "balanced" | "quality";
const presets: Record<CompressionPreset, { label: string; scale: number; quality: number; description: string }> = {
  small: { label: "Smallest file", scale: 0.8, quality: 0.48, description: "Lower resolution and stronger JPEG compression" },
  balanced: { label: "Balanced", scale: 1.15, quality: 0.68, description: "A balance of file size and readability" },
  quality: { label: "Higher quality", scale: 1.5, quality: 0.84, description: "Sharper text and images, usually a larger file" },
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser could not encode a page image.")), "image/jpeg", quality);
  });
}

export default function CompressPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [preset, setPreset] = useState<CompressionPreset>("balanced");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; size: number; name: string } | null>(null);

  function clearResult() {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  async function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult();
    if (!nextFile) return;
    if (!(nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf"))) {
      setFile(null); setPageCount(0); setError("Please choose a PDF file."); return;
    }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) {
      setFile(null); setPageCount(0); setError("Choose a non-empty PDF file no larger than 40 MB."); return;
    }
    let pdf: PDFDocumentProxy | undefined;
    try {
      setProgress("Checking PDF locally…");
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      pdf = await pdfjs.getDocument({ data: await nextFile.arrayBuffer() }).promise;
      if (pdf.numPages < 1) throw new Error("This PDF does not contain any pages.");
      if (pdf.numPages > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages per PDF. Your file has ${pdf.numPages} pages.`);
      setFile(nextFile); setPageCount(pdf.numPages); setProgress("");
    } catch (cause) {
      setFile(null); setPageCount(0);
      setError(cause instanceof Error ? cause.message : "Could not read this PDF. It may be damaged or password-protected.");
      setProgress("");
    } finally {
      if (pdf) await pdf.destroy();
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function compressPdf() {
    if (!file) { setError("Choose a PDF first."); return; }
    setBusy(true); setError(""); clearResult();
    let source: PDFDocumentProxy | undefined;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      source = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      if (source.numPages > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages per PDF.`);
      const output = await PDFDocument.create();
      const settings = presets[preset];
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(`Optimizing page ${pageNumber} of ${source.numPages}…`);
        const page = await source.getPage(pageNumber);
        const baseViewport = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: settings.scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Could not initialize the page renderer in this browser.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
        const jpeg = await canvasToJpeg(canvas, settings.quality);
        const image = await output.embedJpg(await jpeg.arrayBuffer());
        const outputPage = output.addPage([baseViewport.width, baseViewport.height]);
        outputPage.drawImage(image, { x: 0, y: 0, width: baseViewport.width, height: baseViewport.height });
        canvas.width = 0; canvas.height = 0;
      }
      setProgress("Writing optimized PDF…");
      const bytes = await output.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}-compressed.pdf`;
      setResult({ url, size: blob.size, name });
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      const difference = file.size - blob.size;
      if (difference > 0) setProgress(`Done — ${formatBytes(difference)} saved (${Math.round((difference / file.size) * 100)}% smaller).`);
      else setProgress(`Done — output is ${formatBytes(Math.abs(difference))} larger than the original. Try “Smallest file” for stronger compression.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not compress this PDF. It may be damaged, encrypted, or use unsupported features.");
      setProgress("");
    } finally {
      if (source) await source.destroy();
      setBusy(false);
    }
  }

  return (
    <section aria-label="Compress PDF file" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><FileArchive size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to compress</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop a PDF here or browse your device. Choose a compression preset before generating a smaller PDF.</p>
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 40 MB · maximum 30 pages · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"><FileArchive size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pageCount} pages · Original size: {formatBytes(file.size)}</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setPageCount(0); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <fieldset className="grid gap-3 sm:grid-cols-3"><legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Choose compression level</legend>
            {(Object.keys(presets) as CompressionPreset[]).map((key) => <label key={key} className={`cursor-pointer rounded-xl border p-4 ${preset === key ? "border-violet-400 bg-violet-50/70 dark:border-violet-700 dark:bg-violet-950/20" : "border-slate-200 dark:border-slate-800"}`}><span className="flex items-center gap-2"><input type="radio" name="compress-preset" checked={preset === key} onChange={() => setPreset(key)} disabled={busy} className="accent-violet-600"/><span className="text-sm font-semibold text-slate-900 dark:text-white">{presets[key].label}</span></span><span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">{presets[key].description}</span></label>)}
          </fieldset>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Important:</strong> To reduce size, pages are converted to JPEG images. The output will not retain selectable/searchable text, links, forms, or accessibility structure. Keep the original if those features matter.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void compressPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <Download size={17} />}{busy ? "Compressing PDF…" : "Compress and download"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setPageCount(0); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"><div><p className="font-semibold text-slate-900 dark:text-white">{result.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">Output size: {formatBytes(result.size)}</p></div><a href={result.url} download={result.name} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-violet-700 hover:bg-violet-50 dark:border-slate-700 dark:text-violet-300 dark:hover:bg-slate-800"><Download size={15}/> Download again</a></div>}
        </div>
      )}
      {busy && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"><LoaderCircle size={16} className="animate-spin"/>{progress || "Preparing compression…"}</p>}
      {!busy && progress && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{progress}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Compression runs in your browser; the source file is not uploaded. Some PDFs may not become smaller, especially if they already contain optimized images. Password-protected or damaged PDFs may fail.</p>
    </section>
  );
}
