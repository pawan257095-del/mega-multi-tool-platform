"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, RotateCcw } from "lucide-react";

type TermRow = { term: string; count: number; density: number };
const sampleText = `Search engine optimization helps people discover useful pages. Useful content answers a reader's question clearly. A keyword checker can analyze keywords and phrases in content. Use keywords naturally, write for people, and make each page useful. Search engines may consider many signals, so keyword density alone does not determine rankings.`;
const stopWords = new Set("a an and are as at be been being but by can could did do does for from had has have he her hers him his how i if in into is it its may me more most my no not of on or our ours she so than that the their theirs them then there these they this those to too up us was we were what when where which who will with would you your yours".split(" "));

function tokenize(text: string): string[] {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
}
function analyze(text: string, phraseLength: number, includeStopWords: boolean): TermRow[] {
  const words = tokenize(text);
  if (!words.length) return [];
  const counts = new Map<string, number>();
  for (let i = 0; i <= words.length - phraseLength; i++) {
    const phraseWords = words.slice(i, i + phraseLength);
    if (!includeStopWords && phraseWords.some((word) => stopWords.has(word))) continue;
    const term = phraseWords.join(" ");
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([term, count]) => ({ term, count, density: (count / Math.max(1, words.length)) * 100 }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
}

export default function KeywordDensityCheckerTool() {
  const [text, setText] = useState(sampleText);
  const [phraseLength, setPhraseLength] = useState<1 | 2 | 3>(1);
  const [includeStopWords, setIncludeStopWords] = useState(false);
  const [limit, setLimit] = useState<10 | 25 | 50>(25);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState("");
  const words = useMemo(() => tokenize(text), [text]);
  const rows = useMemo(() => analyze(text, phraseLength, includeStopWords), [text, phraseLength, includeStopWords]);
  const uniqueWords = useMemo(() => new Set(words).size, [words]);
  const output = useMemo(() => ["Term,Count,Density (%)", ...rows.map((row) => `"${row.term.replace(/"/g, '""')}",${row.count},${row.density.toFixed(2)}`)].join("\n"), [rows]);
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  async function copyResults() {
    try { await navigator.clipboard.writeText(output); setCopied(true); setNotice("Analysis copied as CSV text."); }
    catch { setNotice("Clipboard access was blocked. You can download the CSV instead."); }
  }
  function downloadResults() {
    const url = URL.createObjectURL(new Blob([output], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "keyword-density.csv"; anchor.click(); URL.revokeObjectURL(url);
    setNotice("CSV download started.");
  }
  function reset() { setText(""); setPhraseLength(1); setIncludeStopWords(false); setLimit(25); setCopied(false); setNotice("Text cleared. Paste your content to analyze it."); }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your content</h2><div className="flex gap-2"><button type="button" onClick={() => { setText(sampleText); setNotice("Sample text loaded."); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700">Load sample</button><button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13}/> Clear</button></div></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Paste an article, page draft, or other text. Analysis is performed in this browser and is not uploaded.</p>
      <textarea aria-label="Text to analyze" value={text} onChange={(e) => { setText(e.target.value); setCopied(false); setNotice(""); }} placeholder="Paste or type your content here..." className={`${inputClass} mt-4 min-h-[22rem] resize-y font-mono leading-6`} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Analyze<select className={inputClass} value={phraseLength} onChange={(e) => setPhraseLength(Number(e.target.value) as 1 | 2 | 3)}><option value={1}>Single words</option><option value={2}>Two-word phrases</option><option value={3}>Three-word phrases</option></select></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Show results<select className={inputClass} value={limit} onChange={(e) => setLimit(Number(e.target.value) as 10 | 25 | 50)}><option value={10}>Top 10</option><option value={25}>Top 25</option><option value={50}>Top 50</option></select></label></div>
      <label className="mt-4 flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={includeStopWords} onChange={(e) => setIncludeStopWords(e.target.checked)} className="mt-1 accent-violet-600"/><span><strong>Include common stop words</strong><span className="mt-0.5 block text-xs leading-5 text-slate-500">When disabled, common words such as “the”, “and”, and “of” are excluded from term results.</span></span></label>
      <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs text-slate-500">Total words</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{words.length.toLocaleString()}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs text-slate-500">Unique words</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{uniqueWords.toLocaleString()}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"><p className="text-xs text-slate-500">Characters</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{text.length.toLocaleString()}</p></div></div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Frequency results</h2><span className="text-xs text-slate-500">{rows.length} unique term{rows.length === 1 ? "" : "s"}</span></div>
      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Density here means term count divided by total word count, shown as a percentage. It is a descriptive metric, not a ranking formula.</p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table className="w-full min-w-[22rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800"><tr><th className="px-3 py-3">Term</th><th className="px-3 py-3 text-right">Count</th><th className="px-3 py-3 text-right">Density</th></tr></thead><tbody>{rows.slice(0, limit).map((row) => <tr key={row.term} className="border-t border-slate-100 dark:border-slate-800"><td className="max-w-[14rem] break-words px-3 py-3 font-medium text-slate-800 dark:text-slate-200">{row.term}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{row.count}</td><td className="px-3 py-3 text-right tabular-nums text-slate-600 dark:text-slate-300">{row.density.toFixed(2)}%</td></tr>)}{rows.length === 0 && <tr><td colSpan={3} className="px-3 py-10 text-center text-slate-500">Add some text to see keyword frequency.</td></tr>}</tbody></table></div>
      {notice && <p role="status" className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={copyResults} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy CSV"}</button><button type="button" onClick={downloadResults} disabled={!rows.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"><Download size={15}/> Download CSV</button></div>
      <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300"><strong>How it works:</strong> punctuation is used to split terms, matching is case-insensitive, and phrases are counted in overlapping word windows. Density uses total word count as its denominator, so phrase percentages are not intended to sum to 100%.</div>
    </section>
  </div>;
}
