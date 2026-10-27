"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, FileCheck2, Minimize2, RotateCcw, WandSparkles } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const sample = '{\n  "name": "Mega Multi-Tool",\n  "milestone": 49,\n  "referenceRoadmap": true,\n  "features": ["format", "validate", "minify"],\n  "settings": {"indent": 2, "localOnly": true}\n}';

type Result = { ok: true; value: unknown; formatted: string; minified: string } | { ok: false; message: string; line?: number; column?: number };

function validateJson(source: string): Result {
  try {
    const value: unknown = JSON.parse(source);
    return { ok: true, value, formatted: JSON.stringify(value, null, 2), minified: JSON.stringify(value) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid JSON.";
    const positionMatch = message.match(/(?:position|at position)\s+(\d+)/i) ?? message.match(/position\s+(\d+)/i);
    if (positionMatch) {
      const position = Math.max(0, Math.min(source.length, Number(positionMatch[1])));
      const before = source.slice(0, position);
      return { ok: false, message, line: before.split("\n").length, column: position - before.lastIndexOf("\n") };
    }
    return { ok: false, message };
  }
}

export default function JsonFormatterTool() {
  const [source, setSource] = useState(sample);
  const [indent, setIndent] = useState("2");
  const [outputMode, setOutputMode] = useState<"formatted" | "minified">("formatted");
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => source.trim() ? validateJson(source) : null, [source]);
  const valid = result?.ok === true;
  const lineCount = source ? source.split("\n").length : 0;

  function format(mode: "formatted" | "minified" = outputMode) {
    if (!source.trim()) { setMessage("Paste or enter JSON first."); setOutput(""); return; }
    const checked = validateJson(source);
    if (!checked.ok) { setMessage(`Invalid JSON: ${checked.message}${checked.line ? ` (line ${checked.line}, column ${checked.column})` : ""}`); setOutput(""); return; }
    const indentValue = indent === "tab" ? "\t" : Number(indent);
    const formatted = JSON.stringify(checked.value, null, indentValue);
    const minified = JSON.stringify(checked.value);
    setOutput(mode === "formatted" ? formatted : minified);
    setOutputMode(mode);
    setMessage(mode === "formatted" ? "JSON validated and formatted successfully." : "JSON validated and minified successfully.");
    setCopied(false);
  }

  async function copyOutput() {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setMessage("Output copied to clipboard."); }
    catch { setMessage("Clipboard access was blocked. Select the output and copy it manually."); }
  }

  function downloadOutput() {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: "application/json;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = outputMode === "formatted" ? "formatted.json" : "minified.json"; anchor.click(); URL.revokeObjectURL(url);
  }

  function reset() { setSource(""); setOutput(""); setMessage(""); setCopied(false); setOutputMode("formatted"); setIndent("2"); }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Input JSON</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste JSON to validate or transform it.</p></div><button type="button" className={buttonClass} onClick={() => { setSource(sample); setOutput(""); setMessage(""); }}><WandSparkles size={15}/> Load sample</button></div>
      <label htmlFor="json-input" className="mb-2 mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">JSON source</label>
      <textarea id="json-input" value={source} onChange={e => { setSource(e.target.value); setOutput(""); setMessage(""); setCopied(false); }} spellCheck={false} rows={17} className={`${inputClass} resize-y`} placeholder={'Paste JSON here, e.g. {"hello":"world"}'} />
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{source.length.toLocaleString()} characters</span><span>{lineCount.toLocaleString()} lines</span></div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><label htmlFor="json-indent" className="text-sm font-semibold text-slate-700 dark:text-slate-200">Indent</label><select id="json-indent" value={indent} onChange={e => setIndent(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tab</option></select></div>
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={() => format("formatted")} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><WandSparkles size={16}/> Format JSON</button><button type="button" onClick={() => format("minified")} className={buttonClass}><Minimize2 size={16}/> Minify</button><button type="button" onClick={reset} className={buttonClass}><RotateCcw size={15}/> Reset</button></div>
      {source.trim() && <div className={`mt-5 rounded-xl border p-3 text-sm ${valid ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200" : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200"}`} role="status"><div className="flex items-center gap-2 font-semibold"><FileCheck2 size={16}/>{valid ? "Valid JSON" : "Invalid JSON"}</div>{!valid && result && !result.ok && <p className="mt-1 break-words">{result.message}{result.line ? ` — line ${result.line}, column ${result.column}` : ""}</p>}</div>}
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Output</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Formatted or compact JSON appears here.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${output ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{output ? (outputMode === "formatted" ? "Formatted" : "Minified") : "No output yet"}</span></div>
      <label htmlFor="json-output" className="mb-2 mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Result</label><textarea id="json-output" value={output} onChange={e => setOutput(e.target.value)} spellCheck={false} rows={17} className={`${inputClass} resize-y`} placeholder="Your JSON output will appear here…" />
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={copyOutput} disabled={!output} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy output"}</button><button type="button" onClick={downloadOutput} disabled={!output} className={buttonClass}><Download size={16}/> Download .json</button><button type="button" onClick={() => { setSource(output); setOutput(""); setMessage("Output moved to input."); }} disabled={!output} className={buttonClass}>Use as input</button></div>
      {message && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300" role="status">{message}</p>}
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy: validation and formatting use JavaScript in your browser. The JSON content is not uploaded to a server.</p>
    </section>
  </div>;
}
