"use client";

import { PDFDocument } from "pdf-lib";
import { Download, LoaderCircle, LockKeyhole, Trash2, Unlock } from "lucide-react";
import { useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const MAX_FILE_SIZE = 40 * 1024 * 1024;
const MAX_PAGES = 30;

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

function canvasToJpeg(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The browser could not encode a PDF page.")), "image/jpeg", 0.92);
  });
}

export default function UnlockPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setFile(null); setError("Choose a non-empty PDF no larger than 40 MB."); return;
    }
    setFile(nextFile); setPassword("");
    if (inputRef.current) inputRef.current.value = "";
  }

  async function unlockPdf() {
    if (!file) { setError("Choose a PDF first."); return; }
    setBusy(true); setError(""); setProgress("Opening the PDF locally…"); clearResult();
    let source: PDFDocumentProxy | undefined;
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      source = await pdfjs.getDocument({ data: await file.arrayBuffer(), password }).promise;
      if (source.numPages < 1) throw new Error("This PDF does not contain any pages.");
      if (source.numPages > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages. This file has ${source.numPages} pages.`);

      setProgress(`Preparing an unlocked copy of ${source.numPages} pages…`);
      const output = await PDFDocument.create();
      for (let pageNumber = 1; pageNumber <= source.numPages; pageNumber++) {
        setProgress(`Processing page ${pageNumber} of ${source.numPages}…`);
        const page = await source.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.ceil(viewport.width));
        canvas.height = Math.max(1, Math.ceil(viewport.height));
        const context = canvas.getContext("2d", { alpha: false });
        if (!context) throw new Error("Could not initialize the PDF renderer in this browser.");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: context, viewport, canvas } as Parameters<typeof page.render>[0]).promise;
        const jpeg = await canvasToJpeg(canvas);
        const image = await output.embedJpg(await jpeg.arrayBuffer());
        const outputPage = output.addPage([viewport.width / 1.5, viewport.height / 1.5]);
        outputPage.drawImage(image, { x: 0, y: 0, width: viewport.width / 1.5, height: viewport.height / 1.5 });
        canvas.width = 0; canvas.height = 0;
      }
      setProgress("Creating the unlocked PDF…");
      const bytes = await output.save({ useObjectStreams: true });
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}-unlocked.pdf`;
      setResult({ url, name });
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress("Done — your copy is no longer password-protected. The pages were converted to images, so text will not remain selectable.");
      setPassword("");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not open this PDF.";
      const passwordIssue = /password|encrypted|PasswordException/i.test(message);
      setError(passwordIssue ? "This PDF may require a password, or the password is incorrect. Enter the document's correct password and try again." : message);
      setProgress("");
    } finally {
      if (source) await source.destroy();
      setBusy(false);
    }
  }

  return (
    <section aria-label="Unlock a PDF with its password" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><Unlock size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to unlock</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Use this only for a document you own or are authorized to modify. If prompted, enter its correct password.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 40 MB · up to 30 pages · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><Unlock size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to process locally</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setPassword(""); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div><label htmlFor="unlock-password" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">PDF password (if required)</label><div className="relative"><input id="unlock-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} maxLength={256} placeholder="Enter the document password" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">{showPassword ? "Hide" : "Show"}</button></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Leave blank for an unprotected PDF. This tool cannot recover or guess forgotten passwords.</p></div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Important limitation:</strong> This browser-only version rebuilds pages as images. Selectable text, links, forms, metadata, and accessibility structure will not be preserved. Review the output before relying on it.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void unlockPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <LockKeyhole size={17} />}{busy ? "Processing PDF…" : "Unlock and download copy"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setPassword(""); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline dark:text-blue-300"><Download size={16}/> Download unlocked copy again</a>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {progress && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{progress}</p>}
    </section>
  );
}
