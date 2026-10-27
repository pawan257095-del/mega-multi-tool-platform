"use client";

import { Download, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_PAGES = 50;

type TextItem = { str?: string; transform?: number[]; hasEOL?: boolean };

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

function groupTextIntoLines(items: TextItem[]) {
  const positioned = items
    .filter((item) => typeof item.str === "string" && item.str.trim().length > 0)
    .map((item) => ({ text: item.str!.replace(/\s+/g, " ").trim(), x: item.transform?.[4] ?? 0, y: item.transform?.[5] ?? 0, hasEOL: Boolean(item.hasEOL) }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: { y: number; parts: typeof positioned }[] = [];
  for (const item of positioned) {
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
    if (!line) {
      line = { y: item.y, parts: [] };
      lines.push(line);
    }
    line.parts.push(item);
  }
  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => line.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" ").replace(/\s+([,.;:!?])/g, "$1").trim())
    .filter(Boolean);
}

export default function PdfToWordTool() {
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

      const { Document, HeadingLevel, Packer, Paragraph, TextRun } = await import("docx");
      const paragraphs: InstanceType<typeof Paragraph>[] = [];
      let extractedCharacters = 0;
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(`Extracting text from page ${pageNumber} of ${source.numPages}…`);
        const page = await source.getPage(pageNumber);
        const content = await page.getTextContent();
        const lines = groupTextIntoLines(content.items as TextItem[]);
        const pageText = lines.join("\n").trim();
        extractedCharacters += pageText.length;
        paragraphs.push(new Paragraph({ text: `Page ${pageNumber}`, heading: HeadingLevel.HEADING_1, spacing: { after: 160 } }));
        if (lines.length) {
          for (const line of lines) paragraphs.push(new Paragraph({ children: [new TextRun({ text: line })], spacing: { after: 100 } }));
        } else {
          paragraphs.push(new Paragraph({ children: [new TextRun({ text: "No selectable text found on this page." })], spacing: { after: 100 } }));
        }
      }
      if (extractedCharacters === 0) {
        throw new Error("No selectable text was found. This may be a scanned PDF; OCR support is not included in this version.");
      }
      setProgress("Building the editable Word document…");
      const docxDocument = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const blob = await Packer.toBlob(docxDocument);
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}.docx`;
      setResult({ url, name });
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — extracted ${extractedCharacters.toLocaleString()} characters from ${source.numPages} pages. Review formatting in Word; complex layouts may not match the original PDF.`);
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
    <section aria-label="Convert PDF to Word" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><FileText size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to convert</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Extract selectable text and create an editable Word document. Files are processed in your browser.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 30 MB · up to 50 pages · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to convert locally</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Conversion note:</strong> This version extracts selectable text. It does not run OCR on scanned pages, and complex columns, tables, images, fonts, and exact page layout may not be preserved.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void convertPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <FileText size={17} />}{busy ? "Converting PDF…" : "Convert to Word"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline dark:text-blue-300"><Download size={16}/> Download Word document again</a>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {progress && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{progress}</p>}
    </section>
  );
}
