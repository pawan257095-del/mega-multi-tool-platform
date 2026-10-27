"use client";

import { useMemo, useState } from "react";
import { Copy, Download, RotateCcw, Check } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const labelClass = "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

function countSentences(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/[^.!?]+(?:[.!?]+|$)/g);
  return matches?.filter((sentence) => sentence.trim().length > 0).length ?? 0;
}

function countSyllableEstimate(word: string) {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return 0;
  if (normalized.length <= 3) return 1;
  const groups = normalized.match(/[aeiouy]+/g);
  let count = groups?.length ?? 1;
  if (normalized.endsWith("e") && count > 1 && !normalized.endsWith("le")) count -= 1;
  return Math.max(1, count);
}

export default function WordCounterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/u).filter(Boolean) : [];
    const paragraphs = text.split(/\n\s*\n/u).filter((paragraph) => paragraph.trim().length > 0).length;
    const lines = text.length ? text.split(/\r\n|\r|\n/u).length : 0;
    const sentences = countSentences(text);
    const syllables = words.reduce((sum, word) => sum + countSyllableEstimate(word), 0);
    const letters = (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
    const minutes = words.length / 200;
    const speakingMinutes = words.length / 130;
    const flesch = words.length && sentences && syllables
      ? 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syllables / words.length)
      : null;
    return {
      words: words.length,
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/gu, "").length,
      lettersAndNumbers: letters,
      sentences,
      paragraphs,
      lines,
      readingTime: minutes,
      speakingTime: speakingMinutes,
      flesch,
    };
  }, [text]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  function downloadText() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "counted-text.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setText("");
    setCopied(false);
  }

  const cards = [
    { label: "Words", value: stats.words.toLocaleString() },
    { label: "Characters", value: stats.characters.toLocaleString() },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces.toLocaleString() },
    { label: "Sentences", value: stats.sentences.toLocaleString() },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString() },
    { label: "Lines", value: stats.lines.toLocaleString() },
  ];

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Text statistics</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Counts update as you type. Text stays in your browser and is not uploaded.</p>
        </div>
        <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Clear text</button>
      </div>

      <div className="mt-5">
        <label htmlFor="word-counter-input" className={labelClass}>Paste or type your text</label>
        <textarea id="word-counter-input" value={text} onChange={(event) => setText(event.target.value)} placeholder="Start typing or paste an essay, article, email, or social media caption…" rows={11} className={`${inputClass} min-h-64 resize-y leading-7`} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"><span>{stats.characters.toLocaleString()} characters</span><span>{stats.words.toLocaleString()} words</span></div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((card) => <div key={card.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950"><p className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400">{card.label}</p><p className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{card.value}</p></div>)}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-violet-50 p-4 dark:bg-violet-950/40"><p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Estimated reading time</p><p className="mt-1 text-lg font-bold text-violet-950 dark:text-violet-100">{stats.words === 0 ? "0 min" : stats.readingTime < 1 ? "Less than 1 min" : `${Math.ceil(stats.readingTime)} min`}</p><p className="mt-1 text-xs text-violet-700/80 dark:text-violet-300/80">Based on 200 words per minute</p></div>
        <div className="rounded-xl bg-sky-50 p-4 dark:bg-sky-950/40"><p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Estimated speaking time</p><p className="mt-1 text-lg font-bold text-sky-950 dark:text-sky-100">{stats.words === 0 ? "0 min" : stats.speakingTime < 1 ? "Less than 1 min" : `${Math.ceil(stats.speakingTime)} min`}</p><p className="mt-1 text-xs text-sky-700/80 dark:text-sky-300/80">Based on 130 words per minute</p></div>
        <div className="rounded-xl bg-emerald-50 p-4 dark:bg-emerald-950/40"><p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Letters and numbers</p><p className="mt-1 text-lg font-bold text-emerald-950 dark:text-emerald-100">{stats.lettersAndNumbers.toLocaleString()}</p><p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">Excludes punctuation and spaces</p></div>
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/40"><p className="text-xs font-semibold text-amber-700 dark:text-amber-300">Readability estimate</p><p className="mt-1 text-lg font-bold text-amber-950 dark:text-amber-100">{stats.flesch === null ? "—" : Math.max(0, Math.min(100, stats.flesch)).toFixed(0) + "/100"}</p><p className="mt-1 text-xs text-amber-700/80 dark:text-amber-300/80">Approximate English Flesch score</p></div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyText} disabled={!text} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied text" : "Copy text"}</button>
        <button type="button" onClick={downloadText} disabled={!text} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16}/> Download .txt</button>
      </div>
      <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">Word counts split text on whitespace. Sentence, syllable, and readability values are estimates; abbreviations and non-English text may affect accuracy.</p>
    </section>
  </div>;
}
