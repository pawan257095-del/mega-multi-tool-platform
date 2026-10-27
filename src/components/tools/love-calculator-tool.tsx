"use client";

import { useMemo, useState } from "react";

function compatibilityScore(first: string, second: string): number {
  // Stable playful hash: the score is reproducible for the same two names and is not a real compatibility measure.
  const pair = [first.trim().toLocaleLowerCase(), second.trim().toLocaleLowerCase()].sort().join("♥");
  let hash = 2166136261;
  for (let i = 0; i < pair.length; i++) {
    hash ^= pair.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 101;
}

function resultMessage(score: number): { title: string; message: string; emoji: string } {
  if (score >= 90) return { title: "Rom-com energy!", message: "A very high score for fun. Maybe celebrate with a good conversation.", emoji: "💖" };
  if (score >= 75) return { title: "Cute chemistry!", message: "The calculator is feeling optimistic—take it as a playful prompt to connect.", emoji: "💕" };
  if (score >= 55) return { title: "A little spark!", message: "Every connection is unique. Shared interests and honest communication matter more.", emoji: "💗" };
  if (score >= 30) return { title: "Mystery pairing!", message: "A number cannot tell the whole story. Get to know each other beyond the score.", emoji: "💌" };
  return { title: "Plot twist!", message: "This score is just for laughs. Real relationships cannot be measured by a name-based formula.", emoji: "💞" };
}

export default function LoveCalculatorTool() {
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const score = useMemo(() => compatibilityScore(firstName, secondName), [firstName, secondName]);
  const result = resultMessage(score);
  const ready = Boolean(firstName.trim() && secondName.trim());

  async function copyResult() {
    const text = `${firstName.trim()} + ${secondName.trim()}: ${score}% — ${result.title}\nFor entertainment only; this is not a real compatibility assessment.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Result copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. You can select the result text and copy it manually.");
    }
  }

  function reset() {
    setFirstName("");
    setSecondName("");
    setSubmitted(false);
    setCopyStatus("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Who’s the lucky duo?</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Enter two names to get a reproducible, just-for-fun score. The same pair of names produces the same result.
        </p>
        <form className="mt-5 space-y-4" onSubmit={(event) => { event.preventDefault(); if (ready) { setSubmitted(true); setCopyStatus(""); } }}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="love-name-one" className="mb-1 block text-sm font-medium">First name</label>
              <input id="love-name-one" value={firstName} onChange={(e) => { setFirstName(e.target.value); setSubmitted(false); }} maxLength={60} required placeholder="Enter a name"
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </div>
            <div>
              <label htmlFor="love-name-two" className="mb-1 block text-sm font-medium">Second name</label>
              <input id="love-name-two" value={secondName} onChange={(e) => { setSecondName(e.target.value); setSubmitted(false); }} maxLength={60} required placeholder="Enter another name"
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={!ready} className="rounded-lg bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-50">Calculate for fun</button>
            <button type="button" onClick={reset} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium dark:border-slate-600">Reset</button>
          </div>
        </form>
      </section>

      {submitted && ready && <section className="rounded-xl border border-pink-200 bg-pink-50 p-6 text-center dark:border-pink-900 dark:bg-pink-950/30" aria-live="polite">
        <div className="text-4xl" aria-hidden="true">{result.emoji}</div>
        <p className="mt-3 text-sm font-medium text-pink-700 dark:text-pink-300">{firstName.trim()} + {secondName.trim()}</p>
        <p className="mt-2 text-5xl font-bold tracking-tight text-pink-700 dark:text-pink-300">{score}%</p>
        <h3 className="mt-3 text-xl font-semibold">{result.title}</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-700 dark:text-slate-200">{result.message}</p>
        <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-pink-200 dark:bg-pink-900">
          <div className="h-full rounded-full bg-pink-500 transition-all" style={{ width: `${score}%` }} />
        </div>
        <button type="button" onClick={() => void copyResult()} className="mt-5 rounded-lg border border-pink-300 bg-white px-4 py-2 text-sm font-semibold text-pink-700 dark:border-pink-800 dark:bg-slate-900 dark:text-pink-300">Copy result</button>
        {copyStatus && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
      </section>}

      <aside className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-semibold">Entertainment only</p>
        <p className="mt-1">This score is generated by a simple name-based hash. It has no scientific validity and cannot predict love, attraction, or relationship success. Real compatibility depends on people, communication, values, and circumstances. Names are processed locally in your browser and are not sent to a service by this tool.</p>
      </aside>
    </div>
  );
}
