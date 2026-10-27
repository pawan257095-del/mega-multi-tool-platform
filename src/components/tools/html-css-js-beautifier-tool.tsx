"use client";

import { useState } from "react";
import { Check, Copy, Download, FileCode2, RotateCcw, Sparkles, ArrowLeftRight } from "lucide-react";

type CodeType = "html" | "css" | "javascript";
type IndentMode = "2" | "4" | "tab";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const samples: Record<CodeType, string> = {
  html: `<!DOCTYPE html><html><head><title>Demo Page</title></head><body><main class="content"><h1>Hello world</h1><p>Small example page.</p><ul><li>First item</li><li>Second item</li></ul></main></body></html>`,
  css: `.card{background-color:white;padding:24px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.12)}.card:hover{transform:translateY(-2px);color:#333}`,
  javascript: `function addNumbers(first,second){const result=first+second;return result;}const values=[1,2,3];values.forEach((value)=>{console.log(addNumbers(value,2));});`,
};

function indentUnit(mode: IndentMode) { return mode === "tab" ? "\t" : " ".repeat(Number(mode)); }
function trimLine(out: string) { return out.replace(/[ \t]+$/g, ""); }
function isLineStart(out: string) { return out.length === 0 || out.endsWith("\n"); }
function addIndent(out: string, depth: number, unit: string) { return isLineStart(out) ? out + unit.repeat(Math.max(0, depth)) : out; }

function formatCss(source: string, unit: string): string {
  let out = "", quote = "", escaped = false, comment = false, depth = 0, pendingSpace = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i], next = source[i + 1] ?? "";
    if (comment) { out += ch; if (ch === "*" && next === "/") { out += "/"; i++; comment = false; } continue; }
    if (quote) { out += ch; if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === quote) quote = ""; continue; }
    if (ch === "/" && next === "*") { out = trimLine(out); if (!isLineStart(out)) out += " "; out += "/*"; i++; comment = true; continue; }
    if (ch === "'" || ch === '"') { if (pendingSpace && /[\w#.)%\]]/.test(out.at(-1) ?? "")) out += " "; pendingSpace = false; out = addIndent(out, depth, unit); out += ch; quote = ch; continue; }
    if (/\s/.test(ch)) { pendingSpace = true; continue; }
    if (ch === "{") { out = trimLine(out); if (!isLineStart(out)) out += " "; out = addIndent(out, depth, unit) + "{" + "\n"; depth++; pendingSpace = false; continue; }
    if (ch === "}") { out = trimLine(out); if (!isLineStart(out)) out += "\n"; depth = Math.max(0, depth - 1); out = addIndent(out, depth, unit) + "}" + "\n"; pendingSpace = false; continue; }
    if (ch === ";") { out = trimLine(out) + ";\n"; pendingSpace = false; continue; }
    if (ch === ":") { out = trimLine(out) + ": "; pendingSpace = false; continue; }
    if (ch === ",") { out = trimLine(out) + ", "; pendingSpace = false; continue; }
    if (pendingSpace && /[\w#.(%\-]/.test(ch) && /[\w#.)%\-]/.test(out.at(-1) ?? "")) out += " ";
    pendingSpace = false; out = addIndent(out, depth, unit) + ch;
  }
  return out.split("\n").map(line => line.trimEnd()).filter((line, i, arr) => line.length || (i > 0 && i < arr.length - 1)).join("\n").trim();
}

function formatJavaScript(source: string, unit: string): string {
  let out = "", quote = "", escaped = false, lineComment = false, blockComment = false;
  let depth = 0, parens = 0, brackets = 0, pendingSpace = false;
  const append = (value: string) => { out = addIndent(out, depth, unit) + value; };
  const newline = () => { out = trimLine(out); if (out && !out.endsWith("\n")) out += "\n"; };
  for (let i = 0; i < source.length; i++) {
    const ch = source[i], next = source[i + 1] ?? "";
    if (lineComment) { if (ch === "\n" || ch === "\r") { lineComment = false; newline(); pendingSpace = false; } else append(ch); continue; }
    if (blockComment) { append(ch); if (ch === "*" && next === "/") { append("/"); i++; blockComment = false; } continue; }
    if (quote) { append(ch); if (escaped) escaped = false; else if (ch === "\\") escaped = true; else if (ch === quote) quote = ""; continue; }
    if (ch === "/" && next === "/") { if (pendingSpace && out && !out.endsWith(" ") && !isLineStart(out)) out += " "; append("//"); i++; lineComment = true; pendingSpace = false; continue; }
    if (ch === "/" && next === "*") { if (pendingSpace && out && !isLineStart(out)) out += " "; append("/*"); i++; blockComment = true; pendingSpace = false; continue; }
    if (ch === "'" || ch === '"' || ch === "`") { if (pendingSpace && /[\w$)]/.test(out.at(-1) ?? "")) out += " "; pendingSpace = false; append(ch); quote = ch; continue; }
    if (/\s/.test(ch)) { pendingSpace = true; continue; }
    if (ch === "(") { if (pendingSpace && /\b(if|for|while|switch|catch|with)\s*$/.test(out)) out += " "; pendingSpace = false; append(ch); parens++; continue; }
    if (ch === ")") { out = trimLine(out); append(ch); parens = Math.max(0, parens - 1); pendingSpace = false; continue; }
    if (ch === "[") { pendingSpace = false; append(ch); brackets++; continue; }
    if (ch === "]") { out = trimLine(out); append(ch); brackets = Math.max(0, brackets - 1); pendingSpace = false; continue; }
    if (ch === "{") { out = trimLine(out); if (!isLineStart(out)) out += " "; append("{"); out += "\n"; depth++; pendingSpace = false; continue; }
    if (ch === "}") { newline(); depth = Math.max(0, depth - 1); append("}"); pendingSpace = false; const rest = source.slice(i + 1).match(/^\s*(else|catch|finally|while)\b/); if (rest) out += " "; else out += "\n"; continue; }
    if (ch === ";") { out = trimLine(out) + ";"; pendingSpace = false; if (parens === 0) out += "\n"; else out += " "; continue; }
    if (ch === ",") { out = trimLine(out) + ", "; pendingSpace = false; continue; }
    if (ch === ":") { out = trimLine(out) + ": "; pendingSpace = false; continue; }
    if (pendingSpace) {
      const prev = out.at(-1) ?? "";
      if ((/[\w$]/.test(ch) && /[\w$]/.test(prev)) || ((ch === "+" || ch === "-") && /[=+\-]/.test(prev))) out += " ";
    }
    pendingSpace = false;
    append(ch);
  }
  return out.split("\n").map(line => line.trimEnd()).filter((line, i, arr) => line.length || (i > 0 && i < arr.length - 1)).join("\n").trim();
}

function formatHtml(source: string, unit: string): string {
  const tokens = source.replace(/>\s*</g, ">\n<").match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? [];
  const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  let depth = 0;
  const lines: string[] = [];
  for (const raw of tokens) {
    const token = raw.trim();
    if (!token) continue;
    const close = token.match(/^<\s*\/\s*([\w:-]+)/);
    const open = token.match(/^<\s*([\w:-]+)/);
    const tag = (close?.[1] ?? open?.[1] ?? "").toLowerCase();
    const isClosing = Boolean(close);
    const isOpening = Boolean(open) && !isClosing && !/^<!|^<\?/.test(token) && !/\/\s*>$/.test(token) && !voidTags.has(tag);
    if (isClosing) depth = Math.max(0, depth - 1);
    const line = unit.repeat(depth) + token;
    lines.push(line);
    if (isOpening) depth++;
  }
  return lines.join("\n").trim();
}

function beautify(source: string, type: CodeType, mode: IndentMode): string {
  const unit = indentUnit(mode);
  if (type === "css") return formatCss(source, unit);
  if (type === "javascript") return formatJavaScript(source, unit);
  return formatHtml(source, unit);
}

export default function HtmlCssJsBeautifierTool() {
  const [type, setType] = useState<CodeType>("html");
  const [indent, setIndent] = useState<IndentMode>("2");
  const [input, setInput] = useState(samples.html);
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const result = output || (input.trim() ? beautify(input, type, indent) : "");

  function changeType(next: CodeType) { setType(next); setInput(samples[next]); setOutput(""); setMessage(""); setCopied(false); }
  function runBeautify() { setOutput(beautify(input, type, indent)); setMessage("Formatting complete. Review the result before using it in production."); setCopied(false); }
  async function copyOutput() { try { await navigator.clipboard.writeText(result); setCopied(true); setMessage("Formatted code copied."); } catch { setMessage("Clipboard access was blocked. Select and copy the output manually."); } }
  function downloadOutput() { const blob = new Blob([result], { type: "text/plain;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = type === "javascript" ? "formatted.js" : type === "css" ? "formatted.css" : "formatted.html"; a.click(); URL.revokeObjectURL(url); }

  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold text-slate-900 dark:text-white">Choose code type</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select HTML, CSS, or JavaScript to apply a matching formatter.</p></div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Code type">
          {([["html", "HTML"], ["css", "CSS"], ["javascript", "JavaScript"]] as const).map(([value, label]) => <button key={value} type="button" onClick={() => changeType(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${type === value ? "bg-violet-600 text-white" : "border border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>{label}</button>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><label htmlFor="beautifier-indent" className="text-sm font-medium text-slate-700 dark:text-slate-300">Indentation</label><select id="beautifier-indent" value={indent} onChange={e => { setIndent(e.target.value as IndentMode); setOutput(""); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="2">2 spaces</option><option value="4">4 spaces</option><option value="tab">Tabs</option></select></div>
    </section>
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2"><h2 className="font-semibold text-slate-900 dark:text-white">Code input</h2><button type="button" className={buttonClass} onClick={() => { setInput(samples[type]); setOutput(""); setMessage(""); }}><RotateCcw size={15}/> Sample</button></div>
        <textarea aria-label="Code to beautify" className={`${inputClass} min-h-[330px] resize-y`} spellCheck={false} value={input} onChange={e => { setInput(e.target.value); setOutput(""); setMessage(""); setCopied(false); }} placeholder={`Paste ${type} code here…`} />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{input.length.toLocaleString()} characters · {new Blob([input]).size.toLocaleString()} bytes</span><button type="button" className={buttonClass} onClick={() => { setInput(""); setOutput(""); setMessage(""); }}>Clear</button></div>
        <button type="button" onClick={runBeautify} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"><Sparkles size={17}/> Beautify code</button>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold text-slate-900 dark:text-white">Formatted output</h2><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{indent === "tab" ? "Tabs" : `${indent} spaces`}</span></div>
        <textarea aria-label="Beautified code output" className={`${inputClass} min-h-[330px] resize-y`} spellCheck={false} value={result} onChange={e => setOutput(e.target.value)} placeholder="Your formatted code appears here…" />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"><span>{result.length.toLocaleString()} characters</span><span>{new Blob([result]).size.toLocaleString()} bytes</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" className={buttonClass} onClick={copyOutput} disabled={!result}><Copy size={15}/>{copied ? "Copied" : "Copy output"}</button><button type="button" className={buttonClass} onClick={downloadOutput} disabled={!result}><Download size={15}/>Download file</button></div>
        <div className="mt-2"><button type="button" className={`${buttonClass} w-full`} onClick={() => { setInput(result); setOutput(""); setMessage("Formatted output moved to input."); }} disabled={!result}><ArrowLeftRight size={15}/> Use output as input</button></div>
      </section>
    </div>
    {message && <p role="status" className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-200">{message}</p>}
    <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><div className="flex gap-2"><FileCode2 size={18} className="mt-0.5 shrink-0"/><p><strong>Important:</strong> This is a lightweight formatter, not a full language parser. HTML formatting separates tags and text into lines and may affect whitespace-sensitive content. JavaScript formatting is best-effort and may not handle every syntax pattern (such as complex template literals or semicolons inside unusual constructs). Review and test output before production use.</p></div></aside>
  </div>;
}
