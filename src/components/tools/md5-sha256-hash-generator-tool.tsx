"use client";

import { useState } from "react";
import { Check, Clipboard, Download, Hash, RotateCcw, Trash2 } from "lucide-react";

type Algorithm = "MD5" | "SHA-256";

function md5Hex(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const paddedLength = Math.ceil((bytes.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const bitLength = bytes.length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 8, bitLength >>> 0, true);
  view.setUint32(paddedLength - 4, Math.floor(bitLength / 0x100000000), true);

  const shifts = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
  const constants = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0);
  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;

  for (let offset = 0; offset < paddedLength; offset += 64) {
    const words = new Uint32Array(16);
    for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number, shift: number;
      if (i < 16) { f = (b & c) | (~b & d); g = i; shift = shifts[i % 4]; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; shift = shifts[4 + (i % 4)]; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; shift = shifts[8 + (i % 4)]; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; shift = shifts[12 + (i % 4)]; }
      const sum = (a + f + constants[i] + words[g]) >>> 0;
      const rotated = ((sum << shift) | (sum >>> (32 - shift))) >>> 0;
      const nextB = (b + rotated) >>> 0;
      a = d; d = c; c = b; b = nextB;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  return [a0, b0, c0, d0].map((word) => [0, 8, 16, 24].map((shift) => ((word >>> shift) & 0xff).toString(16).padStart(2, "0")).join("")).join("");
}

export default function MD5SHA256HashGeneratorTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm>("SHA-256");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  async function generateHash() {
    setError(""); setCopied(false); setOutput("");
    if (!input) { setError("Enter some text before generating a hash."); return; }
    setBusy(true);
    try {
      if (algorithm === "MD5") setOutput(md5Hex(input));
      else {
        if (!globalThis.crypto?.subtle) throw new Error("SHA-256 requires Web Crypto, usually available on HTTPS or localhost.");
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
        setOutput(Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""));
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not generate the hash."); }
    finally { setBusy(false); }
  }

  async function copyOutput() {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setError(""); }
    catch { setError("Clipboard access was blocked. Select the hash and copy it manually."); }
  }

  function downloadOutput() {
    if (!output) return;
    const content = `${algorithm}\n${output}\n`;
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${algorithm.toLowerCase()}-hash.txt`; anchor.click(); URL.revokeObjectURL(url);
  }

  function clearAll() { setInput(""); setOutput(""); setError(""); setCopied(false); }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hash settings</h2>
      <label htmlFor="hash-algorithm" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Algorithm</label>
      <select id="hash-algorithm" value={algorithm} onChange={(event) => { setAlgorithm(event.target.value as Algorithm); setOutput(""); setError(""); setCopied(false); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        <option value="SHA-256">SHA-256 (recommended)</option><option value="MD5">MD5 (legacy / checksums only)</option>
      </select>
      <label htmlFor="hash-input" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Text to hash</label>
      <textarea id="hash-input" value={input} onChange={(event) => { setInput(event.target.value); setOutput(""); setError(""); setCopied(false); }} placeholder="Enter text here…" className="mt-2 min-h-52 w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-violet-950" />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setInput("Hello, world!"); setOutput(""); setError(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Load sample</button>
        <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Trash2 size={13}/> Clear</button>
      </div>
      <button type="button" onClick={generateHash} disabled={busy || !input} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"><Hash size={16}/>{busy ? "Generating…" : `Generate ${algorithm} hash`}</button>
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Hashing runs in your browser. The same text and algorithm produce the same digest; even a small input change typically produces a very different result.</p>
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Hash output</h2><span className="text-xs text-slate-500 dark:text-slate-400">{output ? `${output.length} hexadecimal characters` : "No hash yet"}</span></div>
      <textarea aria-label="Generated hash" readOnly value={output} placeholder="Your hash will appear here…" className="mt-4 min-h-40 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200" />
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      {output && <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{algorithm === "MD5" ? "MD5 is cryptographically broken. Do not use it for passwords, signatures, or security-sensitive integrity checks." : "SHA-256 is a cryptographic hash, not encryption; it cannot be decoded back into the original text."}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!output} onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy hash"}</button>
        <button type="button" disabled={!output} onClick={downloadOutput} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={15}/> Download TXT</button>
        <button type="button" disabled={!output} onClick={() => { setInput(output); setOutput(""); setCopied(false); }} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Use hash as input</button>
      </div>
    </section>
  </div>;
}
