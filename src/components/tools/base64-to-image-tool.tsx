"use client";

import { Download, Image as ImageIcon, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/bmp"] as const;
type ImageMime = (typeof ALLOWED_TYPES)[number];

function bytesFromBase64(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Base64ToImageTool() {
  const [input, setInput] = useState("");
  const [rawType, setRawType] = useState<ImageMime>("image/png");
  const [result, setResult] = useState<{ url: string; type: ImageMime; size: number; filename: string } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result?.url]);

  function reset() {
    setInput(""); setResult(null); setError(""); setBusy(false); setRawType("image/png");
  }

  function decode() {
    setError(""); setResult(null);
    const trimmed = input.trim();
    if (!trimmed) { setError("Paste a Base64 string or image data URL first."); return; }
    setBusy(true);
    try {
      let payload = trimmed.replace(/\s+/g, "");
      let mime: string = rawType;
      const filename = "decoded-image";
      const dataUrlMatch = payload.match(/^data:([^;,]+);base64,(.*)$/i);
      if (payload.startsWith("data:") && !dataUrlMatch) throw new Error("This data URL is invalid. Use a Base64 data URL such as data:image/png;base64,...");
      if (dataUrlMatch) {
        mime = dataUrlMatch[1].toLowerCase();
        payload = dataUrlMatch[2];
      }
      if (!ALLOWED_TYPES.includes(mime as ImageMime)) throw new Error("Supported image types are PNG, JPEG, WebP, GIF, and BMP. SVG and other formats are not accepted.");
      if (!payload || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload) || payload.length % 4 !== 0) throw new Error("The Base64 input appears invalid. Check for missing characters or incorrect padding.");
      const estimatedBytes = Math.floor(payload.length * 3 / 4) - (payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0);
      if (estimatedBytes <= 0) throw new Error("The Base64 input is empty.");
      if (estimatedBytes > MAX_BYTES) throw new Error("Decoded image exceeds the 10 MB safety limit.");
      const bytes = bytesFromBase64(payload);
      const blobBytes = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([blobBytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setResult({ url, type: mime as ImageMime, size: blob.size, filename: `${filename}.${mime === "image/jpeg" ? "jpg" : mime.split("/")[1]}` });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not decode the Base64 input.");
    } finally {
      setBusy(false);
    }
  }

  function download() {
    if (!result) return;
    const link = document.createElement("a");
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Paste Base64 input</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste a Base64 image string or a complete data URL to decode it locally.</p></div>
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button>
        </div>
        <label htmlFor="raw-image-type" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Image type for Base64-only input</label>
        <select id="raw-image-type" value={rawType} onChange={(event) => setRawType(event.target.value as ImageMime)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 sm:max-w-xs">
          {ALLOWED_TYPES.map((type) => <option key={type} value={type}>{type.replace("image/", "").toUpperCase()}</option>)}
        </select>
        <label htmlFor="base64-input" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Base64 string or data URL</label>
        <textarea id="base64-input" value={input} onChange={(event) => { setInput(event.target.value); setError(""); }} rows={9} spellCheck={false} placeholder="data:image/png;base64,iVBORw0KGgo…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300" />
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Maximum decoded size: 10 MB. For a plain Base64 string, select the correct image type above. Supported: PNG, JPEG, WebP, GIF, and BMP.</p>
        {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
        <button type="button" onClick={decode} disabled={busy || !input.trim()} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Decoding…" : "Decode image"}</button>
      </section>

      {result && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center gap-2"><ImageIcon size={18} className="text-violet-600"/><h2 className="font-semibold text-slate-900 dark:text-white">Decoded image preview</h2></div>
        <div className="mt-4 flex min-h-56 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] p-4 dark:border-slate-700"><img src={result.url} alt="Decoded Base64 image preview" className="max-h-[28rem] max-w-full object-contain" onError={() => setError("The Base64 data is syntactically valid but does not appear to contain a readable image. Check that the selected image type is correct.")} /></div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><dt className="text-slate-500 dark:text-slate-400">Detected/selected type</dt><dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">{result.type}</dd></div><div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950"><dt className="text-slate-500 dark:text-slate-400">Decoded size</dt><dd className="mt-1 font-medium text-slate-800 dark:text-slate-200">{formatBytes(result.size)}</dd></div></dl>
        <button type="button" onClick={download} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"><Download size={16}/> Download image</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">The decoder validates the declared MIME type and size, but does not guarantee that the payload is a valid image until the browser renders it. Decoding happens locally in your browser.</p>
      </section>}
    </div>
  );
}
