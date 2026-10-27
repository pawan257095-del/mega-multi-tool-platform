"use client";

import { PDFDocument } from "pdf-lib";
import { FilePlus2, Files, LoaderCircle, Trash2, Download, ArrowUp, ArrowDown } from "lucide-react";
import { useRef, useState } from "react";

type PdfItem = { id: string; file: File };
const MAX_FILES = 20;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_TOTAL_SIZE = 150 * 1024 * 1024;

function isPdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export default function MergePdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PdfItem[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function addFiles(fileList: FileList | File[]) {
    setError(""); setStatus("");
    const incoming = Array.from(fileList);
    const accepted: PdfItem[] = [];
    for (const file of incoming) {
      if (!isPdf(file)) { setError(`${file.name}: select a PDF file.`); continue; }
      if (file.size === 0 || file.size > MAX_FILE_SIZE) { setError(`${file.name}: each PDF must be between 1 byte and 50 MB.`); continue; }
      accepted.push({ id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`, file });
    }
    setFiles((current) => {
      const remaining = Math.max(0, MAX_FILES - current.length);
      const next = [...current, ...accepted].slice(0, MAX_FILES);
      const total = next.reduce((sum, item) => sum + item.file.size, 0);
      if (accepted.length > remaining) setError(`You can merge up to ${MAX_FILES} PDF files.`);
      else if (total > MAX_TOTAL_SIZE) setError("The combined file size must not exceed 150 MB.");
      return total <= MAX_TOTAL_SIZE ? next : current;
    });
    if (inputRef.current) inputRef.current.value = "";
  }

  function moveFile(index: number, offset: number) {
    setFiles((current) => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeFile(id: string) {
    setFiles((current) => current.filter((item) => item.id !== id));
    setError(""); setStatus("");
  }

  async function mergePdfs() {
    if (files.length < 2) { setError("Add at least two PDF files to merge."); return; }
    setBusy(true); setError(""); setStatus("Merging PDFs locally in your browser…");
    try {
      const merged = await PDFDocument.create();
      for (const item of files) {
        const source = await PDFDocument.load(await item.file.arrayBuffer(), { ignoreEncryption: false });
        const pages = await merged.copyPages(source, source.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }
      const bytes = await merged.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = "merged.pdf"; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`Success — merged ${files.length} PDFs into one ${merged.getPageCount()}-page document.`);
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? `Could not merge these PDFs: ${cause.message}. Encrypted or damaged PDFs may not be supported.` : "Could not merge the selected PDFs. Check that the files are valid and not password-protected.");
    } finally { setBusy(false); }
  }

  const totalSize = files.reduce((sum, item) => sum + item.file.size, 0);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="Merge PDF files">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" multiple className="sr-only" onChange={(event) => event.target.files && addFiles(event.target.files)} />
      <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); addFiles(event.dataTransfer.files); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-violet-200 bg-violet-50/70 px-5 py-10 text-center dark:border-violet-900 dark:bg-violet-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm dark:bg-slate-900 dark:text-violet-300"><FilePlus2 size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose PDF files to merge</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Drop PDFs here or browse your device. Files will be combined in the order shown below.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">Select PDF files</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">2–{MAX_FILES} PDFs · up to 50 MB each · 150 MB total · files stay on your device</p>
      </div>

      {files.length > 0 && <div className="mt-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-slate-900 dark:text-white">Selected PDFs ({files.length})</h3><p className="text-xs text-slate-500 dark:text-slate-400">Total {(totalSize / 1024 / 1024).toFixed(1)} MB · use arrows to change order</p></div>
        <ul className="space-y-2">{files.map((item, index) => <li key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"><Files size={20} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{index + 1}. {item.file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(item.file.size / 1024 / 1024).toFixed(2)} MB</p></div>
          <div className="flex items-center gap-1"><button type="button" aria-label={`Move ${item.file.name} up`} disabled={index === 0} onClick={() => moveFile(index, -1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30 dark:border-slate-700"><ArrowUp size={15} /></button><button type="button" aria-label={`Move ${item.file.name} down`} disabled={index === files.length - 1} onClick={() => moveFile(index, 1)} className="rounded-lg border border-slate-200 p-2 disabled:opacity-30 dark:border-slate-700"><ArrowDown size={15} /></button><button type="button" aria-label={`Remove ${item.file.name}`} onClick={() => removeFile(item.id)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={16} /></button></div>
        </li>)}</ul>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={mergePdfs} disabled={busy || files.length < 2} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />} {busy ? "Merging PDFs…" : "Merge and download PDF"}</button><button type="button" onClick={() => { setFiles([]); setError(""); setStatus(""); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Clear all</button></div>
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">PDFs are merged locally using pdf-lib. Files that are encrypted, damaged, or use unsupported features may fail. The tool does not remove passwords or bypass access controls.</p>
    </section>
  );
}
