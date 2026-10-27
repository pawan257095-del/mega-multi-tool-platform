"use client";

import { useState } from "react";
import { Check, Clipboard, Download, RotateCcw, Trash2, ArrowDownUp } from "lucide-react";

type Action = "encode" | "decode";
const sample = "Hello, world! 👋\nBase64 supports UTF-8 text when encoded as bytes.";

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const normalized = value.replace(/\s+/g, "");
  if (!normalized) return "";
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error("Invalid Base64 format. Check the characters and padding, then try again.");
  }
  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new Error("This Base64 value is valid, but it does not decode to valid UTF-8 text. It may represent binary data instead.");
  }
}

export default function Base64EncoderDecoderTool() {
  const [input, setInput] = useState(sample);
  const [output, setOutput] = useState("");
  const [action, setAction] = useState<Action>("encode");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function run(nextAction: Action) {
    setAction(nextAction);
    setError("");
    setCopied(false);
    try {
      setOutput(nextAction === "encode" ? encodeBase64(input) : decodeBase64(input));
    } catch (err) {
      setOutput("");
      setError(err instanceof Error ? err.message : "Unable to process this value.");
    }
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Clipboard access was blocked by the browser. Select the result and copy it manually.");
    }
  }

  function downloadOutput() {
    if (!output) return;
    const blobUrl = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = action === "encode" ? "base64-encoded.txt" : "base64-decoded.txt";
    anchor.click();
    URL.revokeObjectURL(blobUrl);
  }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Input</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => { setInput(sample); setOutput(""); setError(""); setCopied(false); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Load sample</button>
          <button type="button" onClick={() => { setInput(""); setOutput(""); setError(""); setCopied(false); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Trash2 size={13}/> Clear</button>
        </div>
      </div>
      <label htmlFor="base64-input" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Plain text or Base64 string</label>
      <textarea id="base64-input" value={input} onChange={(event) => { setInput(event.target.value); setOutput(""); setError(""); setCopied(false); }} rows={12} spellCheck={false} placeholder="Enter text to encode or a Base64 string to decode…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{input.length.toLocaleString()} characters</span><span>Processed locally</span></div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => run("encode")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"><ArrowDownUp size={16}/> Encode to Base64</button>
        <button type="button" onClick={() => run("decode")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={16}/> Decode Base64</button>
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Result</h2><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">{output ? `${output.length.toLocaleString()} chars` : "Ready"}</span></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      <textarea aria-label="Base64 result" value={output} onChange={(event) => setOutput(event.target.value)} rows={12} placeholder="Your encoded or decoded result will appear here…" spellCheck={false} className="mt-5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!output} onClick={copyOutput} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy result"}</button>
        <button type="button" disabled={!output} onClick={downloadOutput} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={15}/> Download .txt</button>
        <button type="button" disabled={!output} onClick={() => { setInput(output); setOutput(""); setError(""); setCopied(false); }} className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Use result as input</button>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick guide</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300"><li>Base64 is an encoding format, not encryption; it does not protect secrets.</li><li>This tool encodes and decodes UTF-8 text, including emoji and non-English characters.</li><li>Binary Base64 data may not decode as readable text; use a file-oriented tool for images or other binary content.</li></ul></div>
    </section>
  </div>;
}
