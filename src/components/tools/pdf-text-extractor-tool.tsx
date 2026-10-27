"use client";

import { Check, Copy, Download, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 30 * 1024 * 1024;
const MAX_PAGES = 100;
type TextItem = { str?: string; transform?: number[]; hasEOL?: boolean };

function groupTextIntoLines(items: TextItem[]) {
  const positioned = items
    .filter((item) => typeof item.str === "string" && item.str.trim().length > 0)
    .map((item) => ({ text: item.str!.replace(/\s+/g, " ").trim(), x: item.transform?.[4] ?? 0, y: item.transform?.[5] ?? 0 }))
    .sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; parts: typeof positioned }[] = [];
  for (const item of positioned) {
    let line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
    if (!line) { line = { y: item.y, parts: [] }; lines.push(line); }
    line.parts.push(item);
  }
  return lines
    .sort((a, b) => b.y - a.y)
    .map((line) => line.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" ").replace(/\s+([,.;:!?])/g, "$1").trim())
    .filter(Boolean);
}

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "extracted-text";
}

export default function PdfTextExtractorTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function selectFile(next?: File) {
    setError(""); setStatus(""); setText(""); setCopied(false);
    if (!next) return;
    if (!(next.type === "application/pdf" || next.name.toLowerCase().endsWith(".pdf"))) { setFile(null); setError("Please select a PDF file."); return; }
    if (next.size === 0 || next.size > MAX_FILE_SIZE) { setFile(null); setError("Choose a non-empty PDF no larger than 30 MB."); return; }
    setFile(next);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function extractText() {
    if (!file) { setError("Choose a PDF file first."); return; }
    setBusy(true); setError(""); setStatus("Opening PDF locally…"); setText(""); setCopied(false);
    let documentProxy: { numPages: number; getPage: (n: number) => Promise<{ getTextContent: () => Promise<{ items: unknown[] }> }>; destroy: () => Promise<void> } | undefined;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      documentProxy = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
      if (documentProxy.numPages < 1) throw new Error("This PDF does not contain any pages.");
      if (documentProxy.numPages > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages; this PDF has ${documentProxy.numPages}.`);
      const pages: string[] = [];
      let totalChars = 0;
      for (let pageNo = 1; pageNo <= documentProxy.numPages; pageNo++) {
        setStatus(`Extracting page ${pageNo} of ${documentProxy.numPages}…`);
        const page = await documentProxy.getPage(pageNo);
        const content = await page.getTextContent();
        const pageText = groupTextIntoLines(content.items as TextItem[]).join("\n").trim();
        totalChars += pageText.length;
        pages.push(`===== Page ${pageNo} =====\n${pageText || "[No selectable text found on this page.]"}`);
      }
      if (!totalChars) throw new Error("No selectable text was found. This may be a scanned PDF; OCR is not included in this version.");
      setText(pages.join("\n\n"));
      setStatus(`Extracted ${totalChars.toLocaleString()} characters from ${documentProxy.numPages} pages. Review the result before using it.`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not extract text from this PDF.";
      setError(/password|encrypted|PasswordException/i.test(message) ? "This PDF is password-protected. Use a PDF you are authorized to open and can access with its password." : message);
      setStatus("");
    } finally {
      if (documentProxy) await documentProxy.destroy();
      setBusy(false);
    }
  }

  async function copyText() {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); setCopied(true); setStatus("Extracted text copied to clipboard."); }
    catch { setError("Clipboard access was blocked by the browser. Select the text in the result box and copy it manually."); }
  }

  function downloadText() {
    if (!text || !file) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${safeBaseName(file.name)}.txt`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  return (
    <section aria-label="Extract text from PDF" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><FileText size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF file</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Extract selectable text from PDF pages, then copy it or save it as a .txt file.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 30 MB · up to 100 pages · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · processed in your browser</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setText(""); setError(""); setStatus(""); setCopied(false); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Important:</strong> Scanned PDFs that contain only page images need OCR, which is not included. Reading order in complex columns or tables may not be exact.</div>
          <button type="button" onClick={() => void extractText()} disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <FileText size={17} />}{busy ? "Extracting text…" : "Extract text"}</button>
          {text && <div className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">Extracted text</h3><span className="text-xs text-slate-500 dark:text-slate-400">{text.length.toLocaleString()} characters</span></div><textarea readOnly value={text} rows={16} aria-label="Extracted PDF text" className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-blue-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" /><div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void copyText()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Copied" : "Copy text"}</button><button type="button" onClick={downloadText} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={17} />Download .txt</button></div></div>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{status}</p>}
    </section>
  );
}
