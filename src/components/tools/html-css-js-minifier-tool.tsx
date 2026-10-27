"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, FileCode2, RotateCcw, Sparkles } from "lucide-react";

type CodeType = "html" | "css" | "javascript";
const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const samples: Record<CodeType, string> = {
  html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Demo Page</title>\n  </head>\n  <body>\n    <!-- Welcome message -->\n    <main class="content">\n      <h1>Hello world</h1>\n      <p>Small example page.</p>\n    </main>\n  </body>\n</html>`,
  css: `/* Card styles */\n.card {\n  background-color: white;\n  padding: 24px;\n  border-radius: 12px;\n  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);\n}\n\n.card:hover {\n  transform: translateY(-2px);\n}`, 
  javascript: `// Add two values\nfunction addNumbers(first, second) {\n  const result = first + second;\n  return result;\n}\n\nconsole.log(addNumbers(2, 3));`,
};

function minifyCss(source: string): string {
  let out = ""; let quote = ""; let escaped = false; let pendingSpace = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]; const next = source[i + 1] ?? "";
    if (quote) { out += ch; if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === quote) quote = ""; continue; }
    if (ch === "\"" || ch === "'") { if (pendingSpace && /[\w.#%)]/.test(out.at(-1) ?? "") ) out += " "; pendingSpace = false; quote = ch; out += ch; continue; }
    if (ch === "/" && next === "*") { const end = source.indexOf("*/", i + 2); i = end < 0 ? source.length : end + 1; continue; }
    if (/\s/.test(ch)) { pendingSpace = true; continue; }
    if (/[{}:;,>+~()]/.test(ch)) { out = out.trimEnd(); out += ch; pendingSpace = false; continue; }
    if (pendingSpace && /[\w.#%\-]/.test(ch) && /[\w.#%\-)]/.test(out.at(-1) ?? "")) out += " ";
    pendingSpace = false; out += ch;
  }
  return out.replace(/;}/g, "}").trim();
}

function minifyJs(source: string): string {
  let out = ""; let quote = ""; let escaped = false; let pendingSpace = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i]; const next = source[i + 1] ?? "";
    if (quote) { out += ch; if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === quote) quote = ""; continue; }
    if (ch === "\"" || ch === "'" || ch === "`") { if (pendingSpace && /[\w$]/.test(out.at(-1) ?? "")) out += " "; pendingSpace = false; quote = ch; out += ch; continue; }
    if (ch === "/" && next === "/") { while (i < source.length && source[i] !== "\n" && source[i] !== "\r") i++; pendingSpace = true; continue; }
    if (ch === "/" && next === "*") { const end = source.indexOf("*/", i + 2); i = end < 0 ? source.length : end + 1; pendingSpace = true; continue; }
    if (/\s/.test(ch)) { pendingSpace = true; continue; }
    const prev = out.at(-1) ?? "";
    if (pendingSpace && /[\w$]/.test(ch) && /[\w$]/.test(prev)) out += " ";
    pendingSpace = false;
    if (ch === "+" && next === "+" && prev === "+") out += " ";
    if (ch === "-" && next === "-" && prev === "-") out += " ";
    out += ch;
  }
  return out.trim();
}

function minifyHtml(source: string): string {
  // Conservative whitespace handling: keep text nodes intact; collapse whitespace only around markup.
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/[\t\r\n]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/\s+(?=[=])/g, "")
    .replace(/(?<=[=])\s+/g, "")
    .replace(/\s*(\/?>)\s*/g, "$1")
    .trim();
}

function minify(source: string, type: CodeType): string {
  if (type === "css") return minifyCss(source);
  if (type === "javascript") return minifyJs(source);
  return minifyHtml(source);
}

export default function HtmlCssJsMinifierTool() {
  const [type, setType] = useState<CodeType>("html");
  const [input, setInput] = useState(samples.html);
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const result = useMemo(() => output || (input.trim() ? minify(input, type) : ""), [input, output, type]);
  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([result]).size;
  const saved = Math.max(0, inputBytes - outputBytes);
  const percent = inputBytes ? Math.round((saved / inputBytes) * 100) : 0;

  function changeType(next: CodeType) { setType(next); setInput(samples[next]); setOutput(""); setMessage(""); setCopied(false); }
  function runMinify() { setOutput(minify(input, type)); setMessage("Minification complete. Review the result before using it in production."); setCopied(false); }
  async function copyOutput() { try { await navigator.clipboard.writeText(result); setCopied(true); setMessage("Minified code copied."); } catch { setMessage("Clipboard access was blocked. Select and copy the output manually."); } }
  function downloadOutput() { const blob = new Blob([result], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = type === "javascript" ? "minified.js" : type === "css" ? "minified.css" : "minified.html"; a.click(); URL.revokeObjectURL(url); }

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold text-slate-900 dark:text-white">Choose code type</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select the matching language for best results.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Code type">
          {([ ["html", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => changeType(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${type === value ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>{label}</button>)}
        </div>
      </div>
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-semibold text-slate-900 dark:text-white">Original code</h2><button type="button" className={buttonClass} onClick={() => { setInput(samples[type]); setOutput(""); setMessage(""); }}><RotateCcw size={15}/> Sample</button></div>
        <textarea aria-label="Code to minify" className={`${inputClass} min-h-[330px] resize-y`} spellCheck={false} value={input} onChange={e => { setInput(e.target.value); setOutput(""); setMessage(""); setCopied(false); }} placeholder={`Paste ${type} code here…`} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{input.length.toLocaleString()} characters · {inputBytes.toLocaleString()} bytes</span><button type="button" className={buttonClass} onClick={() => { setInput(""); setOutput(""); setMessage(""); }}>Clear</button></div>
        <button type="button" onClick={runMinify} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"><Sparkles size={17}/> Minify code</button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-slate-900 dark:text-white">Minified output</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{percent}% smaller</span></div>
        <textarea aria-label="Minified code output" className={`${inputClass} min-h-[330px] resize-y`} spellCheck={false} value={result} onChange={e => setOutput(e.target.value)} placeholder="Your compact code appears here…" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{result.length.toLocaleString()} characters · {outputBytes.toLocaleString()} bytes</span><span>{saved.toLocaleString()} bytes saved</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" className={buttonClass} onClick={copyOutput} disabled={!result}><Copy size={15}/>{copied ? "Copied" : "Copy output"}</button><button type="button" className={buttonClass} onClick={downloadOutput} disabled={!result}><Download size={15}/>Download file</button></div>
      </section>
    </div>
    {message && <p role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200">{message}</p>}
    <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><div className="flex gap-2"><FileCode2 size={18} className="mt-0.5 shrink-0"/><p><strong>Important:</strong> This is a lightweight, browser-only minifier, not a full compiler or parser. JavaScript regular expressions and complex template literals, and HTML whitespace-sensitive content such as <code>pre</code>, may need special care. Review and test minified output before deploying it to production.</p></div></aside>
  </div>;
}
