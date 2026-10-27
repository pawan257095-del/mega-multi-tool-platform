"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, ArrowLeftRight } from "lucide-react";

type CleanupOptions = {
  trimEdges: boolean;
  collapseSpaces: boolean;
  trimEachLine: boolean;
  removeBlankLines: boolean;
  normalizeLineBreaks: boolean;
  joinLines: boolean;
};

const defaults: CleanupOptions = {
  trimEdges: true,
  collapseSpaces: true,
  trimEachLine: true,
  removeBlankLines: false,
  normalizeLineBreaks: true,
  joinLines: false,
};

function cleanText(value: string, options: CleanupOptions): string {
  let text = value;
  if (options.normalizeLineBreaks) text = text.replace(/\r\n?/g, "\n");
  if (options.trimEachLine) text = text.split("\n").map((line) => line.trim()).join("\n");
  if (options.collapseSpaces) text = text.split("\n").map((line) => line.replace(/[\t\f\v ]{2,}/g, " ")).join("\n");
  if (options.removeBlankLines) text = text.split("\n").filter((line) => line.trim().length > 0).join("\n");
  if (options.joinLines) text = text.split("\n").map((line) => line.trim()).filter(Boolean).join(" ");
  if (options.trimEdges) text = text.trim();
  return text;
}

export default function RemoveExtraSpacesTool() {
  const [input, setInput] = useState("  This   is   an example.\n\n   It has extra spaces,\t tabs,\n and blank lines.   ");
  const [options, setOptions] = useState<CleanupOptions>(defaults);
  const [copied, setCopied] = useState(false);
  const output = useMemo(() => cleanText(input, options), [input, options]);
  const inputChars = input.length;
  const outputChars = output.length;
  const saved = Math.max(0, inputChars - outputChars);

  const update = (key: keyof CleanupOptions, value: boolean) => setOptions((current) => ({ ...current, [key]: value }));
  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  const downloadOutput = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "cleaned-text.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const reset = () => { setInput(""); setOptions(defaults); setCopied(false); };

  const toggles: { key: keyof CleanupOptions; label: string; description: string }[] = [
    { key: "trimEdges", label: "Trim start and end", description: "Remove whitespace at the beginning and end of the whole text." },
    { key: "collapseSpaces", label: "Collapse repeated spaces", description: "Replace runs of spaces or tabs inside each line with one space." },
    { key: "trimEachLine", label: "Trim each line", description: "Remove spaces at the start and end of every line." },
    { key: "removeBlankLines", label: "Remove blank lines", description: "Delete empty lines while preserving text order." },
    { key: "normalizeLineBreaks", label: "Normalize line endings", description: "Convert Windows and legacy line endings to standard line breaks." },
    { key: "joinLines", label: "Join lines into one paragraph", description: "Join non-empty lines with a single space." },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900 dark:text-white">Input text</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste or type the text to clean.</p></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{inputChars.toLocaleString()} chars</span>
        </div>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Paste text with extra spaces or blank lines…" className="min-h-[270px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950" />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500 dark:text-slate-400">Processed locally in your browser.</p><button onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15} /> Reset</button></div>
      </section>

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-4"><h2 className="font-semibold text-slate-900 dark:text-white">Cleanup options</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Toggle each rule to control the output.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {toggles.map((item) => <label key={item.key} className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 p-3 hover:border-indigo-200 dark:border-slate-700 dark:hover:border-indigo-900"><input type="checkbox" checked={options[item.key]} onChange={(event) => update(item.key, event.target.checked)} className="mt-1 h-4 w-4 accent-indigo-600" /><span><span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{item.label}</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</span></span></label>)}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900 dark:text-white">Cleaned output</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Updates automatically when you edit text or options.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{saved.toLocaleString()} chars removed</span></div>
          <textarea readOnly value={output} aria-label="Cleaned output" className="min-h-[230px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={copyOutput} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy output"}</button><button onClick={downloadOutput} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16} /> Download .txt</button><button onClick={() => setInput(output)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><ArrowLeftRight size={16} /> Use output as input</button></div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><div><p className="text-xs text-slate-500 dark:text-slate-400">Input</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{inputChars.toLocaleString()}</p></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Output</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{outputChars.toLocaleString()}</p></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Reduction</p><p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{inputChars ? `${Math.round((saved / inputChars) * 100)}%` : "0%"}</p></div></div>
        </section>
      </div>
    </div>
  );
}
