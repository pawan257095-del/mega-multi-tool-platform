"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileImage, FileUp, LoaderCircle, RotateCcw, Trash2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";

type RenderedPage = { pageNumber: number; url: string; blob: Blob; width: number; height: number };
const MAX_PDF_SIZE = 50 * 1024 * 1024;
const MAX_PAGES = 50;

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser could not export this page as a JPG.")), "image/jpeg", quality);
  });
}

export default function PdfToImageTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<RenderedPage[]>([]);
  const [quality, setQuality] = useState(0.9);
  const [scale, setScale] = useState(1.5);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => () => pages.forEach((page) => URL.revokeObjectURL(page.url)), [pages]);

  function clearPages() {
    setPages((current) => { current.forEach((page) => URL.revokeObjectURL(page.url)); return []; });
  }

  async function convertPdf(selected: File) {
    setError(""); setProgress(""); clearPages(); setFile(selected);
    if (selected.type !== "application/pdf" && !selected.name.toLowerCase().endsWith(".pdf")) {
      setFile(null); setError("Please choose a PDF file."); return;
    }
    if (selected.size > MAX_PDF_SIZE) {
      setFile(null); setError("This PDF is larger than the 50 MB limit."); return;
    }
    setBusy(true);
    let pdf: PDFDocumentProxy | undefined;
    const generated: RenderedPage[] = [];
    try {
      setProgress("Loading PDF locally…");
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const bytes = await selected.arrayBuffer();
      pdf = await pdfjs.getDocument({ data: bytes }).promise;
      if (pdf.numPages > MAX_PAGES) throw new Error(`This tool currently supports up to ${MAX_PAGES} pages per PDF. Your file has ${pdf.numPages} pages.`);
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        setProgress(`Rendering page ${pageNumber} of ${pdf.numPages}…`);
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not initialize the canvas renderer in this browser.");
        await page.render({ canvasContext: context, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
        const blob = await canvasToJpeg(canvas, quality);
        generated.push({ pageNumber, url: URL.createObjectURL(blob), blob, width: canvas.width, height: canvas.height });
        canvas.width = 0; canvas.height = 0;
      }
      setPages(generated);
      setProgress(`Done — rendered ${generated.length} page${generated.length === 1 ? "" : "s"}. Download each JPG below.`);
    } catch (cause) {
      generated.forEach((page) => URL.revokeObjectURL(page.url));
      setError(cause instanceof Error ? cause.message : "Could not read this PDF. Try another file.");
      setProgress("");
    } finally {
      if (pdf) await pdf.destroy();
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function downloadPage(page: RenderedPage) {
    const anchor = document.createElement("a");
    anchor.href = page.url; anchor.download = `page-${String(page.pageNumber).padStart(3, "0")}.jpg`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove();
  }

  return (
    <section aria-label="PDF to JPG converter" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void convertPdf(selected); }} />
      <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const selected = event.dataTransfer.files?.[0]; if (selected) void convertPdf(selected); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><FileUp size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to extract pages</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Drop a PDF here or browse your device. Pages will be rendered as JPGs.</p>
        <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-60">Select PDF</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF up to 50 MB · Maximum 50 pages · local browser processing</p>
      </div>

      <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Image quality: {Math.round(quality * 100)}%
          <input className="mt-3 w-full accent-violet-600" type="range" min="0.5" max="1" step="0.05" value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={busy} />
        </label>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Resolution
          <select className="mt-2 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950" value={scale} onChange={(event) => setScale(Number(event.target.value))} disabled={busy}>
            <option value={1}>Standard</option><option value={1.5}>High</option><option value={2}>Very high</option>
          </select>
        </label>
      </div>
      {file && <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-800/60"><span className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">{file.name}</span><button type="button" onClick={() => { clearPages(); setFile(null); setError(""); setProgress(""); }} disabled={busy} className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 disabled:opacity-50"><Trash2 size={15}/> Clear</button></div>}
      {busy && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm text-violet-700 dark:bg-violet-950/30 dark:text-violet-300"><LoaderCircle size={16} className="animate-spin"/>{progress}</p>}
      {!busy && progress && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{progress}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {pages.length > 0 && <div className="mt-6"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">Extracted pages ({pages.length})</h3><button type="button" onClick={() => pages.forEach(downloadPage)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"><Download size={16}/> Download all JPGs</button></div>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{pages.map((page) => <li key={page.pageNumber} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"><div className="flex h-48 items-center justify-center bg-slate-50 p-3 dark:bg-slate-950"><img src={page.url} alt={`Preview of PDF page ${page.pageNumber}`} className="max-h-full max-w-full object-contain" /></div><div className="flex items-center justify-between gap-2 p-3"><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Page {page.pageNumber}</p><p className="text-xs text-slate-500 dark:text-slate-400">{page.width} × {page.height} px · {(page.blob.size / 1024).toFixed(0)} KB</p></div><button type="button" onClick={() => downloadPage(page)} aria-label={`Download page ${page.pageNumber} as JPG`} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={14}/> JPG</button></div></li>)}</ul>
      </div>}
      <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500 dark:text-slate-400"><FileImage size={15} className="mt-0.5 shrink-0" aria-hidden="true"/>Each PDF page is rendered to a JPG in your browser. Very large PDFs may use significant memory. Password-protected PDFs that cannot be opened by the browser renderer are not supported in this version.</p>
    </section>
  );
}
