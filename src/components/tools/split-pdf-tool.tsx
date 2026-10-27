"use client";

import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { Download, FileText, LoaderCircle, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PAGES = 500;

type SplitMode = "ranges" | "each-page";
type PageRange = { start: number; end: number };

function parseRanges(value: string, pageCount: number): PageRange[] {
  const chunks = value.split(",").map((part) => part.trim()).filter(Boolean);
  if (!chunks.length) throw new Error("Enter one or more page numbers or ranges, such as 1-3, 5, 8-10.");
  const ranges: PageRange[] = [];
  for (const chunk of chunks) {
    const match = /^(\d+)\s*(?:-\s*(\d+))?$/.exec(chunk);
    if (!match) throw new Error(`“${chunk}” is not valid. Use page numbers and ranges like 1-3, 5, 8-10.`);
    const start = Number(match[1]);
    const end = Number(match[2] ?? match[1]);
    if (start < 1 || end < start || end > pageCount) {
      throw new Error(`Range “${chunk}” is outside the document. Use page numbers from 1 to ${pageCount}.`);
    }
    ranges.push({ start, end });
  }
  const pages = ranges.flatMap(({ start, end }) => Array.from({ length: end - start + 1 }, (_, index) => start + index));
  if (new Set(pages).size !== pages.length) throw new Error("Page ranges overlap or repeat a page. Remove duplicate pages or ranges.");
  return ranges;
}

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

export default function SplitPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<SplitMode>("ranges");
  const [rangesInput, setRangesInput] = useState("1-2, 3");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function chooseFile(nextFile?: File) {
    setError(""); setStatus(""); setPageCount(null);
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
      if (count < 2) { setFile(null); setError("This PDF has only one page, so there is nothing to split."); return; }
      if (count > MAX_PAGES) { setFile(null); setError(`This tool currently supports PDFs with up to ${MAX_PAGES} pages.`); return; }
      setFile(nextFile); setPageCount(count); setRangesInput(count >= 3 ? "1-2, 3" : "1, 2");
    } catch {
      setFile(null); setError("Could not read this PDF. It may be damaged, password-protected, or use unsupported features.");
    } finally { if (inputRef.current) inputRef.current.value = ""; }
  }

  async function splitPdf() {
    if (!file || pageCount === null) { setError("Choose a PDF first."); return; }
    setBusy(true); setError(""); setStatus("Preparing your split PDFs locally in the browser…");
    try {
      const source = await PDFDocument.load(await file.arrayBuffer());
      const ranges = mode === "each-page"
        ? Array.from({ length: pageCount }, (_, index) => ({ start: index + 1, end: index + 1 }))
        : parseRanges(rangesInput, pageCount);
      if (ranges.length > 100) throw new Error("Please create no more than 100 output PDFs at a time.");
      const zip = new JSZip();
      const base = safeBaseName(file.name);
      for (let index = 0; index < ranges.length; index += 1) {
        const range = ranges[index];
        const output = await PDFDocument.create();
        const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, offset) => range.start - 1 + offset);
        const pages = await output.copyPages(source, pageIndices);
        pages.forEach((page) => output.addPage(page));
        const bytes = await output.save();
        const pageLabel = range.start === range.end ? `page-${range.start}` : `pages-${range.start}-${range.end}`;
        zip.file(`${base}-part-${String(index + 1).padStart(2, "0")}-${pageLabel}.pdf`, bytes);
      }
      const archive = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 4 } });
      const url = URL.createObjectURL(archive);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `${base}-split.zip`; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
      setStatus(`Success — created ${ranges.length} PDF file${ranges.length === 1 ? "" : "s"} in a ZIP archive. Your original file was not changed.`);
    } catch (cause) {
      setStatus(""); setError(cause instanceof Error ? cause.message : "Could not split this PDF. Check that the document is valid and not password-protected.");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="Split PDF file">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><Upload size={26} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to split</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Drop one PDF here or browse your device. Choose page ranges or create one PDF for each page.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 100 MB · up to 500 pages · processed on your device</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pageCount} pages · {(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button type="button" onClick={() => { setFile(null); setPageCount(null); setError(""); setStatus(""); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <fieldset className="space-y-3"><legend className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">How would you like to split it?</legend>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${mode === "ranges" ? "border-violet-400 bg-violet-50/70 dark:border-violet-700 dark:bg-violet-950/20" : "border-slate-200 dark:border-slate-800"}`}><input type="radio" name="split-mode" checked={mode === "ranges"} onChange={() => setMode("ranges")} className="mt-1 accent-violet-600" /><span><span className="block text-sm font-semibold text-slate-900 dark:text-white">Split by page ranges</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Create a separate PDF for each range you enter.</span></span></label>
            <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${mode === "each-page" ? "border-violet-400 bg-violet-50/70 dark:border-violet-700 dark:bg-violet-950/20" : "border-slate-200 dark:border-slate-800"}`}><input type="radio" name="split-mode" checked={mode === "each-page"} onChange={() => setMode("each-page")} className="mt-1 accent-violet-600" /><span><span className="block text-sm font-semibold text-slate-900 dark:text-white">Extract every page separately</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Create one single-page PDF per page, then bundle them into a ZIP.</span></span></label>
          </fieldset>
          {mode === "ranges" && <div><label htmlFor="page-ranges" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Page ranges</label><input id="page-ranges" value={rangesInput} onChange={(event) => setRangesInput(event.target.value)} placeholder="e.g. 1-3, 5, 8-10" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-900"/><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Example: <code>1-3, 5, 8-10</code> creates three PDFs. Page numbers start at 1; ranges must not overlap.</p></div>}
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void splitPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}{busy ? "Splitting PDF…" : "Split and download ZIP"}</button><button type="button" onClick={() => { setFile(null); setPageCount(null); setError(""); setStatus(""); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Splitting is performed locally with pdf-lib; output PDFs are packaged into a ZIP in your browser. Password-protected or damaged PDFs may not work. This tool does not remove passwords or bypass document restrictions.</p>
    </section>
  );
}
