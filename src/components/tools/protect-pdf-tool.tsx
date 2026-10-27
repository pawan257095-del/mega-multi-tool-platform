"use client";

import { PDFDocument } from "pdf-lib";
import { Download, Eye, EyeOff, FileLock2, LoaderCircle, ShieldCheck, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { encryptPDF } from "@pdfsmaller/pdf-encrypt";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_PAGES = 300;

function safeBaseName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

export default function ProtectPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  function clearResult() {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  async function chooseFile(nextFile?: File) {
    setError(""); setStatus(""); clearResult();
    if (!nextFile) return;
    if (!(nextFile.type === "application/pdf" || nextFile.name.toLowerCase().endsWith(".pdf"))) {
      setFile(null); setPageCount(0); setError("Please choose a PDF file."); return;
    }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) {
      setFile(null); setPageCount(0); setError("Choose a non-empty PDF file no larger than 50 MB."); return;
    }
    try {
      const bytes = await nextFile.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const count = pdf.getPageCount();
      if (count < 1) throw new Error("This PDF does not contain any pages.");
      if (count > MAX_PAGES) throw new Error(`This tool supports up to ${MAX_PAGES} pages per PDF.`);
      setFile(nextFile); setPageCount(count); setPassword(""); setConfirmPassword("");
    } catch (cause) {
      setFile(null); setPageCount(0);
      setError(cause instanceof Error ? cause.message : "Could not read this PDF. It may be damaged or already password-protected.");
    } finally { if (inputRef.current) inputRef.current.value = ""; }
  }

  async function protectPdf() {
    if (!file) { setError("Choose a PDF first."); return; }
    if (password.length < 8) { setError("Use a password with at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("The passwords do not match."); return; }
    setBusy(true); setError(""); setStatus("Encrypting your PDF locally…"); clearResult();
    try {
      const source = new Uint8Array(await file.arrayBuffer());
      const encrypted = await encryptPDF(source, password);
      const output = encrypted instanceof Uint8Array ? encrypted : new Uint8Array(encrypted as ArrayBuffer);
      if (!output.length) throw new Error("The encryption library returned an empty file.");
      const blob = new Blob([output as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}-protected.pdf`;
      setResult({ url, name });
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setStatus(`Done — password protection was applied to ${pageCount} pages. Keep your password safe; it cannot be recovered by this tool.`);
      setPassword(""); setConfirmPassword("");
    } catch (cause) {
      setStatus("");
      setError(cause instanceof Error ? cause.message : "Could not protect this PDF. It may be encrypted already or use unsupported PDF features.");
    } finally { setBusy(false); }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6" aria-label="Protect PDF with a password">
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-10 text-center dark:border-emerald-900 dark:bg-emerald-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300"><FileLock2 size={26} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PDF to protect</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Add password encryption before sharing a document. Your file is processed on your device.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Select PDF file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PDF only · up to 50 MB · up to 300 pages · no upload</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"><FileLock2 size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{pageCount} pages · {(file.size / 1024 / 1024).toFixed(2)} MB</p></div>
            <button type="button" onClick={() => { setFile(null); setPageCount(0); setError(""); setStatus(""); clearResult(); }} aria-label="Remove selected PDF" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="space-y-4">
            <div><label htmlFor="protect-password" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Create password</label><div className="relative"><input id="protect-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} maxLength={128} placeholder="At least 8 characters" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Use a unique passphrase. Longer passwords are harder to guess.</p></div>
            <div><label htmlFor="protect-confirm-password" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-white">Confirm password</label><input id="protect-confirm-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} maxLength={128} placeholder="Enter the same password again" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white"/></div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Important:</strong> Keep the password somewhere safe. If you forget it, this tool cannot recover it. Encryption compatibility can vary between older PDF readers.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void protectPdf()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <ShieldCheck size={17} />}{busy ? "Encrypting PDF…" : "Protect and download PDF"}</button><button type="button" onClick={() => { setFile(null); setPageCount(0); setPassword(""); setConfirmPassword(""); setError(""); setStatus(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 underline dark:text-emerald-300"><Download size={16}/> Download protected PDF again</a>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {status && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Uses PDF password encryption in your browser. Files and passwords are not sent to a server by this tool. PDF reader compatibility may vary; test the output with a trusted reader before sharing sensitive documents.</p>
    </section>
  );
}
