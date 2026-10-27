"use client";

import { useMemo, useState } from "react";

type SummaryMode = "short" | "balanced" | "detailed";

const STOP_WORDS = new Set([
  "a","an","and","are","as","at","be","been","but","by","for","from","had","has","have","he","her","his","in","is","it","its","of","on","or","our","she","that","the","their","them","there","these","they","this","to","was","we","were","will","with","you","your"
]);

function splitSentences(text: string) {
  return (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? []).map(s => s.trim()).filter(Boolean);
}

function summarize(text: string, mode: SummaryMode) {
  const sentences = splitSentences(text);
  if (sentences.length <= 2) return text.trim();

  const words = text.toLowerCase().match(/\b[\p{L}\p{N}'’-]+\b/gu) ?? [];
  const frequencies = new Map<string, number>();
  for (const word of words) {
    if (!STOP_WORDS.has(word) && word.length > 2) frequencies.set(word, (frequencies.get(word) ?? 0) + 1);
  }

  const ranked = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b[\p{L}\p{N}'’-]+\b/gu) ?? [];
    const score = sentenceWords.reduce((sum, word) => sum + (frequencies.get(word) ?? 0), 0) / Math.max(1, sentenceWords.length);
    return { sentence, index, score };
  });
  const ratio = mode === "short" ? 0.2 : mode === "balanced" ? 0.35 : 0.5;
  const count = Math.max(1, Math.min(sentences.length, Math.ceil(sentences.length * ratio)));
  const selected = [...ranked].sort((a, b) => b.score - a.score).slice(0, count).sort((a, b) => a.index - b.index);
  return selected.map(item => item.sentence).join(" ");
}

export default function AiSummarizerTool() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SummaryMode>("balanced");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const stats = useMemo(() => ({
    words: input.trim() ? input.trim().split(/\s+/u).length : 0,
    characters: input.length,
    sentences: splitSentences(input).length,
  }), [input]);

  function runSummary() {
    setError("");
    setCopied(false);
    if (!input.trim()) {
      setError("Paste some text first.");
      setOutput("");
      return;
    }
    setOutput(summarize(input, mode));
  }

  async function copySummary() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
    } catch {
      setError("Clipboard access failed. Select and copy the summary manually.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="ais-input" className="text-sm font-medium text-slate-700 dark:text-slate-200">Text to summarize</label>
          <span className="text-xs text-slate-500 dark:text-slate-400">{stats.words.toLocaleString()} words · {stats.characters.toLocaleString()} characters · {stats.sentences} sentences</span>
        </div>
        <textarea id="ais-input" value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); setError(""); }} rows={11} placeholder="Paste an article, notes, or other text here…" className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="ais-mode" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Summary length</label>
            <select id="ais-mode" value={mode} onChange={(e) => setMode(e.target.value as SummaryMode)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="short">Short — about 20%</option>
              <option value="balanced">Balanced — about 35%</option>
              <option value="detailed">Detailed — about 50%</option>
            </select>
          </div>
          <button type="button" onClick={runSummary} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">Summarize text</button>
        </div>
        {error && <p role="alert" className="mt-3 text-sm text-amber-700 dark:text-amber-300">{error}</p>}
      </section>

      {output && <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Summary</h2>
          <button type="button" onClick={copySummary} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Copy summary</button>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{output}</p>
        {copied && <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">Summary copied.</p>}
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">This is an extractive, browser-based summary that selects high-scoring sentences. It is not a generative AI model and may miss context; review the result before relying on it.</p>
      </section>}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-white">How it works</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">The tool scores sentences using word frequency, then keeps the highest-scoring sentences in their original order. Processing runs locally in your browser; no external AI API or account is needed.</p>
      </section>
    </div>
  );
}
