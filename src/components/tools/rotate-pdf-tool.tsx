"use client";

import { degrees, PDFDocument } from "pdf-lib";
import { Download, FileText, LoaderCircle, RotateCw, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PAGES = 500;

function parsePageSelection(value: string, pageCount: number): Set<number> {
  const trimmed = value.trim();
  if (!trimmed || trimmed.toLowerCase() === "all") return new Set(Array.from({ length: pageCount }, (_, i) => i));
  const result = new Set<number>();
  for (const part of trimmed.split(",").map((item) => item.trim()).filter(Boolean)) {
    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(part);
    if (!match) throw new Error(`“${part}” is not valid. Use page numbers or ranges, e.g. 1-3, 5.`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) throw new Error(`Page selection “${part}” is outside this document. Choose pages from 1 to ${pageCount}.`);
    for (let page = start; page <= end; page += 1) result.add(page - 1);
  }
  if (!result.size) throw new Error("Choose all pages or enter at least one page number.");
  return result;
}

function baseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

export default function RotatePdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [angle, setAngle] = useState(90);
  const [pageSelection, setPageSelection] = useState("all");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function chooseFile(nextFile?: File) {
    setError(""); setStatus("");
    if (!nextFile) return;
    if (!(nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf"))) {
      setFile(null); setError("Please choose a PDF file."); return;
    }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) {
      setFile(null); setError("Choose a non-empty PDF file no larger than 100 MB."); return;
    }
    try {
      const pdf = await PDFDocument.load(await nextFile.arrayBuffer());
      const count = pdf.getPageCount();
      if (!count) throw new Error("This PDF has no pages.");
      if (count > MAX_PAGES) throw new Error(`This tool currently supports PDFs with up to ${MAX_PAGES} pages.`);
      setFile(nextFile); setPageCount(count); setPageSelection("all");
    } catch (cause) {
      setFile(null); setError(cause instanceof Error ? cause.message : "Could not read this PDF. It may be damaged or password-protected.");
    } finally { if (inputRef.current) inputRef.current.value = ""; }
  }

  async function rotatePdf() {
    if (!file) { setError("Choose a PDF first."); return; }
    setBusy(true); setError(""); setStatus("Rotating pages locally in your browser…");
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const selected = parsePageSelection(pageSelection, pageCount);
      for (const index of selected) {
        const page = pdf.getPage(index);
        const current = page.getRotation().angle;
        page.setRotation(degrees(((current + angle) % 360 + 360) % 360));
      }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `${baseName(file.name)}-rotated.pdf`; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setStatus(`Success — rotated ${selected.size} of ${pageCount} pages by ${angle}°. Your original file was not changed.`);
    } catch (cause) {
      setStatus(""); setError(cause instanceof Error ? cause.message : "Could not rotate this PDF. It may be damaged or password-protected.");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="Rotate PDF pages">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><Upload size={26} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to rotate</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop a PDF here or browse your device. Rotate the whole document or only the pages you specify.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 100 MB · up to 500 pages · processed on your device</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pageCount} pages · {(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button type="button" onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="rotate-angle" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Rotation angle</label><select id="rotate-angle" value={angle} onChange={(event) => setAngle(Number(event.target.value))} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value={90}>90° clockwise</option><option value={180}>180°</option><option value={270}>270° clockwise (90° counterclockwise)</option></select></div>
            <div><label htmlFor="rotate-pages" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Pages to rotate</label><input id="rotate-pages" value={pageSelection} onChange={(event) => setPageSelection(event.target.value)} placeholder="all or 1-3, 5" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use <code>all</code> or page numbers/ranges, e.g. <code>1-3, 5</code>.</p></div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void rotatePdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <RotateCw size={17} />}{busy ? "Rotating PDF…" : "Rotate and download PDF"}</button><button type="button" onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Rotation is applied to PDF page metadata using pdf-lib. Files stay in your browser and are not uploaded to a server. Password-protected or damaged PDFs may not work; this tool does not bypass document restrictions.</p>
    </section>
  );
}
