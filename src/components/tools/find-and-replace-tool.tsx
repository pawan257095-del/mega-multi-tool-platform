"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Search, Replace, ArrowRightLeft } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

type MatchResult = { output: string; count: number; error: string | null };

function processText(input: string, find: string, replacement: string, caseSensitive: boolean, replaceAll: boolean, regexMode: boolean): MatchResult {
  if (!find) return { output: input, count: 0, error: null };
  try {
    const pattern = regexMode ? find : find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const flags = `${caseSensitive ? "" : "i"}${replaceAll ? "g" : ""}`;
    const expression = new RegExp(pattern, flags);
    const matches = input.match(new RegExp(pattern, `${caseSensitive ? "" : "i"}g`));
    return { output: input.replace(expression, replacement), count: matches?.length ?? 0, error: null };
  } catch (error) {
    return { output: input, count: 0, error: error instanceof Error ? error.message : "Invalid regular expression" };
  }
}

export default function FindAndReplaceTool() {
  const [input, setInput] = useState("Replace repeated words in this sample text. This text is only a sample.");
  const [find, setFind] = useState("sample");
  const [replacement, setReplacement] = useState("example");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [replaceAll, setReplaceAll] = useState(true);
  const [regexMode, setRegexMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => processText(input, find, replacement, caseSensitive, replaceAll, regexMode), [input, find, replacement, caseSensitive, replaceAll, regexMode]);

  async function copyOutput() {
    try { await navigator.clipboard.writeText(result.output); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setCopied(false); }
  }
  function downloadOutput() {
    const url = URL.createObjectURL(new Blob([result.output], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "find-and-replace.txt"; anchor.click(); URL.revokeObjectURL(url);
  }
  function reset() { setInput(""); setFind(""); setReplacement(""); setCaseSensitive(false); setReplaceAll(true); setRegexMode(false); setCopied(false); }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Find text and replace it</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Preview updates automatically as you change the text or options.</p></div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div><label className={labelClass} htmlFor="find-text">Find</label><div className="relative"><Search size={16} className="absolute left-3 top-3.5 text-slate-400"/><input id="find-text" value={find} onChange={(e) => { setFind(e.target.value); setCopied(false); }} placeholder="Text or pattern to find" className={`${inputClass} pl-9`}/></div></div>
        <div><label className={labelClass} htmlFor="replace-text">Replace with</label><div className="relative"><Replace size={16} className="absolute left-3 top-3.5 text-slate-400"/><input id="replace-text" value={replacement} onChange={(e) => { setReplacement(e.target.value); setCopied(false); }} placeholder="Replacement text" className={`${inputClass} pl-9`}/></div></div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600"/><span><span className="font-semibold text-slate-800 dark:text-slate-100">Case-sensitive</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Match letter case exactly.</span></span></label>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" checked={replaceAll} onChange={(e) => setReplaceAll(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600"/><span><span className="font-semibold text-slate-800 dark:text-slate-100">Replace all matches</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Off replaces only the first match.</span></span></label>
        <label className="flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" checked={regexMode} onChange={(e) => setRegexMode(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600"/><span><span className="font-semibold text-slate-800 dark:text-slate-100">Regular expression</span><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">Treat Find as a JavaScript regex pattern.</span></span></label>
      </div>
      {regexMode && <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">Regex mode uses JavaScript regular expressions. Invalid patterns are shown below and leave the original text unchanged.</p>}
      <div className="mt-5"><label className={labelClass} htmlFor="source-text">Input text</label><textarea id="source-text" value={input} onChange={(e) => { setInput(e.target.value); setCopied(false); }} rows={8} placeholder="Paste or type the text to edit…" className={`${inputClass} min-h-48 resize-y leading-7`}/><p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{input.length.toLocaleString()} input characters</p></div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Result preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{result.error ? "Could not process this pattern." : `${result.count.toLocaleString()} match${result.count === 1 ? "" : "es"} found`}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={copyOutput} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy result"}</button><button type="button" onClick={downloadOutput} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16}/> Download .txt</button><button type="button" onClick={() => { setInput(result.output); setCopied(false); }} disabled={Boolean(result.error)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowRightLeft size={16}/> Use as input</button></div></div>
      {result.error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Regex error: {result.error}</p>}
      <textarea aria-label="Replacement output" readOnly value={result.output} rows={10} className={`${inputClass} mt-5 min-h-56 resize-y leading-7`}/>
      <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-xs text-slate-500 dark:text-slate-400">Input characters</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{input.length.toLocaleString()}</p></div><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-xs text-slate-500 dark:text-slate-400">Output characters</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{result.output.length.toLocaleString()}</p></div><div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-xs text-slate-500 dark:text-slate-400">Characters changed</p><p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{Math.abs(input.length - result.output.length).toLocaleString()}</p></div></div>
    </section>
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy note: processing happens locally in your browser. Regex replacement supports JavaScript replacement tokens such as $&amp; and $1.</p>
  </div>;
}
