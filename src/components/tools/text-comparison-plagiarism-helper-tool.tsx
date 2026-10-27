"use client";

import { useMemo, useState } from "react";

type DiffPart = { value: string; kind: "same" | "added" | "removed" };
type Overlap = { phrase: string; countA: number; countB: number };

function tokenize(text: string): string[] {
  return text.match(/\s+|[\p{L}\p{N}_]+(?:['’][\p{L}\p{N}_]+)*|[^\s\p{L}\p{N}_]/gu) ?? [];
}

function wordTokens(text: string): string[] {
  return text.toLocaleLowerCase().match(/[\p{L}\p{N}_]+(?:['’][\p{L}\p{N}_]+)*/gu) ?? [];
}

function buildDiff(a: string, b: string): DiffPart[] {
  const left = tokenize(a);
  const right = tokenize(b);
  // Keep the dynamic-programming matrix bounded for large pasted texts.
  if (left.length * right.length > 180_000) {
    return [{ value: "Text is too large for detailed highlighting. Try shorter passages (up to roughly 600 tokens per side).", kind: "same" }];
  }
  const rows = left.length + 1;
  const cols = right.length + 1;
  const dp = Array.from({ length: rows }, () => new Uint32Array(cols));
  for (let i = left.length - 1; i >= 0; i--) {
    for (let j = right.length - 1; j >= 0; j--) {
      dp[i][j] = left[i] === right[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  const push = (value: string, kind: DiffPart["kind"]) => {
    if (!value) return;
    const last = parts[parts.length - 1];
    if (last && last.kind === kind) last.value += value;
    else parts.push({ value, kind });
  };
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      push(left[i], "same"); i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      push(left[i], "removed"); i++;
    } else {
      push(right[j], "added"); j++;
    }
  }
  while (i < left.length) push(left[i++], "removed");
  while (j < right.length) push(right[j++], "added");
  return parts;
}

function phraseOverlaps(a: string, b: string): Overlap[] {
  const wordsA = wordTokens(a);
  const wordsB = wordTokens(b);
  const countsA = new Map<string, number>();
  const countsB = new Map<string, number>();
  const minWords = 3;
  const maxPhrase = 7;
  for (const [words, counts] of [[wordsA, countsA], [wordsB, countsB]] as const) {
    for (let size = minWords; size <= maxPhrase; size++) {
      for (let i = 0; i + size <= words.length; i++) {
        const phrase = words.slice(i, i + size).join(" ");
        counts.set(phrase, (counts.get(phrase) ?? 0) + 1);
      }
    }
  }
  const common = [...countsA.entries()]
    .filter(([phrase]) => countsB.has(phrase))
    .map(([phrase, countA]) => ({ phrase, countA, countB: countsB.get(phrase) ?? 0 }))
    .filter((item) => item.phrase.split(" ").length >= minWords)
    .sort((x, y) => y.phrase.split(" ").length - x.phrase.split(" ").length || y.phrase.length - x.phrase.length)
    .slice(0, 25);
  // Prefer longer phrases and suppress shorter overlaps contained within them.
  return common.filter((item, index, all) =>
    !all.some((other, otherIndex) =>
      otherIndex !== index &&
      other.phrase.length > item.phrase.length &&
      (` ${other.phrase} `).includes(` ${item.phrase} `)
    )
  ).slice(0, 12);
}

export default function TextComparisonPlagiarismHelperTool() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [mode, setMode] = useState<"diff" | "overlap">("diff");

  const diff = useMemo(() => buildDiff(textA, textB), [textA, textB]);
  const overlaps = useMemo(() => phraseOverlaps(textA, textB), [textA, textB]);
  const wordCountA = wordTokens(textA).length;
  const wordCountB = wordTokens(textB).length;
  const exactSame = textA.trim() !== "" && textA.trim() === textB.trim();

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); } catch { /* Output remains available for manual selection. */ }
  }

  const inputClass = "min-h-56 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-4 text-sm leading-6 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Text A · Original</h2>
            <span className="text-xs text-slate-500">{wordCountA} words</span>
          </div>
          <textarea value={textA} onChange={(e) => setTextA(e.target.value)} placeholder="Paste the original text…" aria-label="Text A original" className={inputClass} />
          <button type="button" onClick={() => setTextA("")} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Clear text A</button>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="font-semibold">Text B · Comparison</h2>
            <span className="text-xs text-slate-500">{wordCountB} words</span>
          </div>
          <textarea value={textB} onChange={(e) => setTextB(e.target.value)} placeholder="Paste the text to compare…" aria-label="Text B comparison" className={inputClass} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTextB("")} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Clear text B</button>
            <button type="button" onClick={() => { setTextA("Clear writing helps readers understand complex ideas. Good explanations use evidence, examples, and a logical structure."); setTextB("Good explanations use evidence, examples, and a logical structure to help readers understand complex ideas."); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Load sample</button>
            <button type="button" onClick={() => { setTextA(textB); setTextB(textA); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Swap texts</button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Comparison results</h2>
            <p className="mt-1 text-sm text-slate-500">All comparisons happen locally in your browser.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setMode("diff")} className={`rounded-lg px-3 py-2 text-sm ${mode === "diff" ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>Highlight differences</button>
            <button type="button" onClick={() => setMode("overlap")} className={`rounded-lg px-3 py-2 text-sm ${mode === "overlap" ? "bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-700"}`}>Exact phrase overlap</button>
          </div>
        </div>
        {exactSame && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">Both texts match exactly after trimming surrounding whitespace.</p>}
        {mode === "diff" ? (
          <>
            <div className="mb-3 flex flex-wrap gap-3 text-xs">
              <span className="rounded bg-emerald-100 px-2 py-1 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">Green = added in Text B</span>
              <span className="rounded bg-rose-100 px-2 py-1 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300">Red = removed from Text A</span>
            </div>
            <div className="min-h-32 whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 dark:border-slate-800 dark:bg-slate-950">
              {(!textA && !textB) ? <span className="text-slate-400">Enter both texts to compare them.</span> : diff.map((part, index) => (
                <span key={`${part.kind}-${index}`} className={part.kind === "added" ? "bg-emerald-200 text-emerald-950 dark:bg-emerald-900/70 dark:text-emerald-100" : part.kind === "removed" ? "bg-rose-200 text-rose-950 line-through dark:bg-rose-900/70 dark:text-rose-100" : ""}>{part.value}</span>
              ))}
            </div>
            <button type="button" onClick={() => copy(diff.map((part) => part.value).join(""))} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Copy highlighted comparison text</button>
          </>
        ) : (
          <div>
            {overlaps.length === 0 ? (
              <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-950">No shared phrases of three or more words were found by this simple exact-match scan.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {overlaps.map((item) => <li key={item.phrase} className="flex flex-wrap items-center justify-between gap-2 py-3"><span className="font-medium">“{item.phrase}”</span><span className="text-xs text-slate-500">A: {item.countA} · B: {item.countB}</span></li>)}
              </ul>
            )}
            <button type="button" onClick={() => copy(overlaps.map((item) => `“${item.phrase}” (A: ${item.countA}, B: ${item.countB})`).join("\n"))} disabled={!overlaps.length} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-40 dark:border-slate-700">Copy overlaps</button>
          </div>
        )}
      </section>

      <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <strong>Important:</strong> This tool compares only the two texts you provide. Shared wording is not proof of plagiarism, and no external websites, academic databases, or unpublished sources are searched. Use it as a text comparison aid—not as a plagiarism verdict.
      </div>
    </div>
  );
}
