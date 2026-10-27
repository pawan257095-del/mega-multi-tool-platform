"use client";

import { Download, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_PAGES = 40;

type PdfTextItem = { str?: string; transform?: number[]; width?: number; height?: number };

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

export default function PdfToPowerPointTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  function clearResult() {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult();
    if (!nextFile) return;
    if (!(nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf"))) {
      setFile(null); setError("Please choose a PDF file."); return;
    }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) {
      setFile(null); setError("Choose a non-empty PDF no larger than 30 MB."); return;
    }
    setFile(nextFile);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function convertPdf() {
    if (!file) { setError("Choose a PDF first."); return; }
    setBusy(true); setError(""); setProgress("Opening the PDF locally…"); clearResult();
    let source: PDFDocumentProxy | undefined;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      source = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      if (source.numPages < 1) throw new Error("This PDF does not contain any pages.");
      if (source.numPages > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages. This file has ${source.numPages} pages.`);

      const pptxModule = await import("pptxgenjs");
      const pptx = new pptxModule.default();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "Mega Multi-Tool Platform";
      pptx.subject = "Slides converted from PDF text";
      pptx.title = safeBaseName(file.name);
      pptx.company = "Mega Multi-Tool Platform";
      let totalText = 0;

      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(`Extracting page ${pageNumber} of ${source.numPages}…`);
        const page = await source.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        const items = content.items as PdfTextItem[];
        const validItems = items.filter((item) => typeof item.str === "string" && item.str.trim());
        totalText += validItems.reduce((sum, item) => sum + (item.str?.length ?? 0), 0);
        const slide = pptx.addSlide();
        slide.background = { color: "FFFFFF" };
        slide.addText(`Page ${pageNumber}`, {
          x: 0.35, y: 0.12, w: 2.2, h: 0.22, fontFace: "Arial", fontSize: 8,
          color: "64748B", margin: 0, breakLine: false,
        });
        const scale = Math.min(12.55 / viewport.width, 6.75 / viewport.height);
        const offsetX = (13.333 - viewport.width * scale) / 2;
        const offsetY = 0.45 + (6.75 - viewport.height * scale) / 2;
        if (!validItems.length) {
          slide.addText("No selectable text found on this page. This may be a scanned page; OCR is not included.", {
            x: 0.6, y: 1.2, w: 12.1, h: 1.2, fontFace: "Arial", fontSize: 18,
            color: "64748B", margin: 0.1, breakLine: false,
          });
          continue;
        }
        for (const item of validItems) {
          const transform = item.transform ?? [10, 0, 0, 10, 0, 0];
          const rawX = transform[4] ?? 0;
          const rawY = transform[5] ?? 0;
          const fontSize = Math.max(5, Math.min(28, Math.abs(transform[3] || transform[0] || 10) * scale * 0.78));
          const x = Math.max(0.15, Math.min(13.0, offsetX + rawX * scale));
          const y = Math.max(0.42, Math.min(7.15, offsetY + (viewport.height - rawY) * scale - fontSize / 72));
          const width = Math.max(0.1, Math.min(13.0 - x, (item.width && item.width > 0 ? item.width * scale : Math.max(0.25, item.str!.length * fontSize / 90))));
          const height = Math.max(0.12, Math.min(0.6, Math.max(fontSize / 55, (item.height ?? 0) * scale)));
          slide.addText(item.str!.replace(/\s+/g, " "), {
            x, y, w: width, h: height, fontFace: "Arial", fontSize,
            color: "1F2937", margin: 0, breakLine: false, valign: "middle",
            fit: "shrink",
          });
        }
      }
      if (totalText === 0) throw new Error("No selectable text was found in this PDF. Scanned PDFs require OCR, which is not included in this version.");
      setProgress("Building the PowerPoint file…");
      const blob = await pptx.write({ outputType: "blob" }) as Blob;
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}.pptx`;
      setResult({ url, name });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name;
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — created ${source.numPages} slides and extracted ${totalText.toLocaleString()} characters. Review slide positioning; complex layouts may need manual adjustment.`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not convert this PDF.";
      setError(/password|encrypted|PasswordException/i.test(message) ? "This PDF is password-protected. Please use a PDF you can open without a password." : message);
      setProgress("");
    } finally {
      if (source) await source.destroy();
      setBusy(false);
    }
  }

  return (
    <section aria-label="Convert PDF to PowerPoint" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><FileText size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to convert</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Create one editable PowerPoint slide per page using selectable text. Files stay in your browser.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 30 MB · up to 40 pages · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to convert locally</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Conversion note:</strong> Text boxes are positioned from PDF text coordinates, so this creates editable text but cannot reliably preserve fonts, images, charts, complex tables, or exact layout. Scanned pages need OCR.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void convertPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <FileText size={17} />}{busy ? "Converting PDF…" : "Convert to PowerPoint"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline dark:text-blue-300"><Download size={16}/> Download PowerPoint again</a>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {progress && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{progress}</p>}
    </section>
  );
}
