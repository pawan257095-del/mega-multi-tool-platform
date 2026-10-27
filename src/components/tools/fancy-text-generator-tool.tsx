"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, Sparkles } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

type Style = { id: string; name: string; description: string; convert: (text: string) => string };
function mapRange(text: string, upperStart: number, lowerStart: number, digitStart?: number, lowerExceptions: Record<string, string> = {}) {
  return Array.from(text, (char) => {
    const code = char.codePointAt(0)!;
    if (lowerExceptions[char]) return lowerExceptions[char];
    if (code >= 65 && code <= 90) return String.fromCodePoint(upperStart + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(lowerStart + code - 97);
    if (digitStart !== undefined && code >= 48 && code <= 57) return String.fromCodePoint(digitStart + code - 48);
    return char;
  }).join("");
}
function fullwidth(text: string) { return Array.from(text, (c) => { const n = c.codePointAt(0)!; return n === 32 ? "　" : n >= 33 && n <= 126 ? String.fromCodePoint(n + 0xFEE0) : c; }).join(""); }
function circled(text: string) { return Array.from(text, (c) => { const n = c.codePointAt(0)!; if (n >= 65 && n <= 90) return String.fromCodePoint(0x24B6 + n - 65); if (n >= 97 && n <= 122) return String.fromCodePoint(0x24D0 + n - 97); if (n >= 49 && n <= 57) return String.fromCodePoint(0x2460 + n - 49); if (n === 48) return "⓪"; return c; }).join(""); }
function smallCaps(text: string) { const map: Record<string, string> = {a:"ᴀ",b:"ʙ",c:"ᴄ",d:"ᴅ",e:"ᴇ",f:"ꜰ",g:"ɢ",h:"ʜ",i:"ɪ",j:"ᴊ",k:"ᴋ",l:"ʟ",m:"ᴍ",n:"ɴ",o:"ᴏ",p:"ᴘ",q:"ǫ",r:"ʀ",s:"ꜱ",t:"ᴛ",u:"ᴜ",v:"ᴠ",w:"ᴡ",x:"x",y:"ʏ",z:"ᴢ"}; return Array.from(text, c => map[c.toLowerCase()] ?? c).join(""); }
function strike(text: string) { return Array.from(text, c => /[\p{L}\p{N}]/u.test(c) ? c + "̶" : c).join(""); }
const styles: Style[] = [
  { id: "bold", name: "Bold", description: "Mathematical bold Unicode", convert: t => mapRange(t, 0x1D400, 0x1D41A, 0x1D7CE) },
  { id: "italic", name: "Italic", description: "Mathematical italic Unicode", convert: t => mapRange(t, 0x1D434, 0x1D44E, undefined, { h: "ℎ" }) },
  { id: "bold-italic", name: "Bold italic", description: "Bold and slanted lettering", convert: t => mapRange(t, 0x1D468, 0x1D482) },
  { id: "monospace", name: "Monospace", description: "Fixed-width Unicode lettering", convert: t => mapRange(t, 0x1D670, 0x1D68A, 0x1D7F6) },
  { id: "double-struck", name: "Double-struck", description: "Outlined mathematical style", convert: t => mapRange(t, 0x1D538, 0x1D552, 0x1D7D8, { C:"ℂ", H:"ℍ", N:"ℕ", P:"ℙ", Q:"ℚ", R:"ℝ", Z:"ℤ" }) },
  { id: "fullwidth", name: "Fullwidth", description: "Wide, spaced-looking characters", convert: fullwidth },
  { id: "circled", name: "Circled", description: "Circle letters and digits", convert: circled },
  { id: "small-caps", name: "Small caps", description: "Compact uppercase-like letters", convert: smallCaps },
  { id: "strikethrough", name: "Strikethrough", description: "Add a combining strike mark", convert: strike },
];

export default function FancyTextGeneratorTool() {
  const [input, setInput] = useState("Make your text stand out!");
  const [copiedId, setCopiedId] = useState("");
  const [copiedAll, setCopiedAll] = useState(false);
  const results = useMemo(() => styles.map(style => ({ ...style, output: style.convert(input) })), [input]);
  async function copy(text: string, id: string) { try { await navigator.clipboard.writeText(text); setCopiedId(id); window.setTimeout(() => setCopiedId(""), 1400); } catch { setCopiedId(""); } }
  function downloadAll() { const text = results.map(item => `${item.name}\n${item.output}`).join("\n\n"); const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "fancy-text-styles.txt"; a.click(); URL.revokeObjectURL(url); }
  function reset() { setInput(""); setCopiedId(""); setCopiedAll(false); }
  const allText = results.map(item => `${item.name}: ${item.output}`).join("\n");
  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Enter your text</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Every style below updates as you type.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <label className={`${labelClass} mt-5`} htmlFor="fancy-input">Plain text</label><textarea id="fancy-input" value={input} onChange={e => { setInput(e.target.value); setCopiedId(""); setCopiedAll(false); }} rows={4} maxLength={2000} placeholder="Type or paste text here…" className={`${inputClass} resize-y leading-7`}/>
      <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{input.length.toLocaleString()} / 2,000 characters</span><span>Works best with Latin letters and numbers</span></div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(allText);setCopiedAll(true);window.setTimeout(()=>setCopiedAll(false),1400);}catch{setCopiedAll(false);}}} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">{copiedAll?<Check size={16}/>:<Copy size={16}/>} {copiedAll?"All styles copied":"Copy all styles"}</button><button type="button" onClick={downloadAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16}/> Download all (.txt)</button></div>
    </section>
    <section><div className="mb-4 flex items-center gap-2"><Sparkles className="text-violet-600 dark:text-violet-400" size={20}/><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Choose a style</h2><p className="text-sm text-slate-500 dark:text-slate-400">Tap Copy on any card to use that version.</p></div></div>
      <div className="grid gap-4 md:grid-cols-2">{results.map(item=><article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">{item.name}</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.description}</p></div><button type="button" onClick={()=>copy(item.output,item.id)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">{copiedId===item.id?<Check size={14}/>:<Copy size={14}/>} {copiedId===item.id?"Copied":"Copy"}</button></div><p className="mt-4 min-h-12 break-words rounded-xl bg-slate-50 p-3 text-lg text-slate-900 dark:bg-slate-950 dark:text-slate-100">{item.output || "Your styled text will appear here."}</p></article>)}</div>
    </section>
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy note: all conversions happen in your browser. Fancy styles use Unicode characters rather than font files, so appearance may vary across devices and some characters may not be supported by every app or screen reader.</p>
  </div>;
}
