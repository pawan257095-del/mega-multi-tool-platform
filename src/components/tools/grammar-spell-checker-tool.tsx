"use client";

import { useMemo, useState } from "react";

type Finding = {
  id: string;
  original: string;
  replacement: string;
  message: string;
  category: "Spelling" | "Grammar" | "Style";
  index: number;
};

const spellingRules: Array<[RegExp, string, string]> = [
  [/\bteh\b/gi, "the", "Common typo"],
  [/\brecieve\b/gi, "receive", "Common misspelling"],
  [/\bseperate\b/gi, "separate", "Common misspelling"],
  [/\bdefinately\b/gi, "definitely", "Common misspelling"],
  [/\boccured\b/gi, "occurred", "Common misspelling"],
  [/\bwich\b/gi, "which", "Common typo"],
  [/\bthier\b/gi, "their", "Common typo"],
  [/\bbecuase\b/gi, "because", "Common typo"],
  [/\balot\b/gi, "a lot", "Common usage error"],
  [/\buntill\b/gi, "until", "Common misspelling"],
  [/\bbegining\b/gi, "beginning", "Common misspelling"],
  [/\bbeleive\b/gi, "believe", "Common misspelling"],
  [/\bfreind\b/gi, "friend", "Common misspelling"],
  [/\bacheive\b/gi, "achieve", "Common misspelling"],
  [/\barguement\b/gi, "argument", "Common misspelling"],
  [/\bdefinately\b/gi, "definitely", "Common misspelling"],
];

function analyze(text: string): Finding[] {
  const findings: Finding[] = [];
  let counter = 0;
  for (const [pattern, replacement, message] of spellingRules) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      findings.push({
        id: `spell-${counter++}`,
        original: match[0],
        replacement: match[0][0] === match[0][0].toUpperCase()
          ? replacement[0].toUpperCase() + replacement.slice(1)
          : replacement,
        message,
        category: "Spelling",
        index: match.index,
      });
      if (match[0].length === 0) pattern.lastIndex++;
    }
  }

  const addPattern = (
    pattern: RegExp,
    replacement: string,
    message: string,
    category: Finding["category"],
  ) => {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      findings.push({
        id: `rule-${counter++}`,
        original: match[0],
        replacement,
        message,
        category,
        index: match.index,
      });
    }
  };

  addPattern(/\b([A-Za-z]+)\s+\1\b/gi, "$1", "Repeated word", "Grammar");
  addPattern(/(^|[.!?]\s+)([a-z])/g, "", "Sentence may need a capital letter", "Style");
  addPattern(/\s+([,.!?;:])/g, "$1", "Remove space before punctuation", "Style");
  addPattern(/([,.!?])([A-Za-z])/g, "$1 ", "Consider a space after punctuation", "Style");

  return findings.sort((a, b) => a.index - b.index);
}

function applyFindings(text: string, findings: Finding[]): string {
  // Apply non-overlapping fixes from right to left so offsets remain stable.
  const usable = findings
    .filter((f) => f.replacement !== "" && f.original.length > 0)
    .sort((a, b) => b.index - a.index);
  let output = text;
  let lastStart = Number.POSITIVE_INFINITY;
  for (const f of usable) {
    const end = f.index + f.original.length;
    if (end > lastStart) continue;
    const replacement = f.replacement === "$1"
      ? f.original.split(/\s+/)[0]
      : f.replacement;
    output = output.slice(0, f.index) + replacement + output.slice(end);
    lastStart = f.index;
  }
  return output;
}

export default function GrammarSpellCheckerTool() {
  const [text, setText] = useState("");
  const findings = useMemo(() => analyze(text), [text]);
  const [fixedText, setFixedText] = useState<string | null>(null);

  const correctedPreview = useMemo(() => applyFindings(text, findings), [text, findings]);
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard permissions vary by browser; the result remains selectable.
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Your text</h2>
            <p className="text-sm text-slate-500">Analysis runs locally in your browser.</p>
          </div>
          <div className="text-sm text-slate-500">{wordCount} words · {text.length} characters</div>
        </div>
        <textarea
          value={text}
          onChange={(event) => { setText(event.target.value); setFixedText(null); }}
          placeholder="Paste or type text to check common spelling and grammar issues…"
          className="min-h-56 w-full resize-y rounded-xl border border-slate-300 bg-transparent p-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700"
          aria-label="Text to check"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setText("")} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Clear</button>
          <button type="button" onClick={() => { setFixedText(correctedPreview); }} disabled={!text.trim()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">Apply suggested fixes</button>
          <button type="button" onClick={() => copy(correctedPreview)} disabled={!text.trim()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700">Copy corrected preview</button>
        </div>
      </section>

      {fixedText !== null && (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">Suggested revision</h2>
            <button type="button" onClick={() => copy(fixedText)} className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm dark:border-emerald-800">Copy</button>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7">{fixedText}</p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Findings</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm dark:bg-slate-800">{findings.length} potential issue{findings.length === 1 ? "" : "s"}</span>
        </div>
        {!text.trim() ? (
          <p className="text-sm text-slate-500">Enter text above to see possible corrections.</p>
        ) : findings.length === 0 ? (
          <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">No issues from this tool’s basic rules were found. This does not guarantee the text is error-free.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {findings.map((finding) => (
              <li key={finding.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{finding.category}</span>
                    <span className="text-sm font-medium">{finding.message}</span>
                  </div>
                  <p className="text-sm text-slate-500">Found: <span className="font-mono text-rose-600">{finding.original}</span>{finding.replacement ? <> → <span className="font-mono text-emerald-600">{finding.replacement}</span></> : null}</p>
                </div>
                {finding.replacement && (
                  <button type="button" onClick={() => {
                    const next = text.slice(0, finding.index) + finding.replacement + text.slice(finding.index + finding.original.length);
                    setText(next);
                    setFixedText(null);
                  }} className="self-start rounded-lg border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Apply this</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="text-xs leading-5 text-slate-500">Limitations: this is a lightweight, rule-based checker for common typos and formatting patterns—not a comprehensive grammar engine or AI proofreader. It does not upload your text or verify factual claims.</p>
    </div>
  );
}
