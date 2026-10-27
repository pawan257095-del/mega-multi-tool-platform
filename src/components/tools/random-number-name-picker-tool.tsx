"use client";

import { useMemo, useState } from "react";
import { Clipboard, Dices, RotateCcw, Shuffle, UserRound } from "lucide-react";

type Mode = "number" | "name";
function secureRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  if (!Number.isSafeInteger(range) || range < 1 || range > 0x1_0000_0000) throw new Error("Choose a smaller, valid range.");
  const limit = Math.floor(0x1_0000_0000 / range) * range;
  const data = new Uint32Array(1);
  do { crypto.getRandomValues(data); } while (data[0] >= limit);
  return min + (data[0] % range);
}
function shuffled<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = secureRandomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function RandomNumberNamePickerTool() {
  const [mode, setMode] = useState<Mode>("number");
  const [minText, setMinText] = useState("1");
  const [maxText, setMaxText] = useState("100");
  const [countText, setCountText] = useState("1");
  const [unique, setUnique] = useState(true);
  const [namesText, setNamesText] = useState("Aarav\nPriya\nRohan\nAnanya\nKabir");
  const [results, setResults] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const names = useMemo(() => namesText.split(/[\n,;]+/).map((name) => name.trim()).filter(Boolean), [namesText]);
  const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  function pick() {
    setError(""); setNotice("");
    try {
      const count = Number(countText);
      if (!Number.isInteger(count) || count < 1 || count > 100) throw new Error("Result count must be between 1 and 100.");
      if (mode === "number") {
        const min = Number(minText), max = Number(maxText);
        if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < -Number.MAX_SAFE_INTEGER || max > Number.MAX_SAFE_INTEGER || min > max) throw new Error("Enter valid whole-number bounds with minimum no greater than maximum.");
        const range = max - min + 1;
        if (!Number.isSafeInteger(range) || range < 1 || range > 0x1_0000_0000) throw new Error("The range is too large. Use a range of at most 4,294,967,296 possible values.");
        if (unique && count > range) throw new Error(`Only ${range.toLocaleString()} distinct number${range === 1 ? " is" : "s are"} available in this range.`);
        let values: number[];
        if (unique) {
          // Partial Fisher–Yates without allocating the entire range.
          const pool = new Map<number, number>(); values = [];
          for (let i = 0; i < count; i++) {
            const j = secureRandomInt(i, range - 1);
            const picked = pool.get(j) ?? j;
            const atI = pool.get(i) ?? i;
            pool.set(j, atI);
            values.push(min + picked);
          }
        } else values = Array.from({ length: count }, () => secureRandomInt(min, max));
        setResults(values.map(String));
      } else {
        if (!names.length) throw new Error("Enter at least one name to pick from.");
        if (unique && count > names.length) throw new Error(`You requested ${count} picks, but only ${names.length} name${names.length === 1 ? " is" : "s are"} available.`);
        const picked = unique ? shuffled(names).slice(0, count) : Array.from({ length: count }, () => names[secureRandomInt(0, names.length - 1)]);
        setResults(picked);
      }
      setNotice("Random result generated locally using the browser's Web Crypto API.");
    } catch (err) { setResults([]); setError(err instanceof Error ? err.message : "Could not generate a result."); }
  }
  function reset() { setMinText("1"); setMaxText("100"); setCountText("1"); setUnique(true); setNamesText("Aarav\nPriya\nRohan\nAnanya\nKabir"); setResults([]); setNotice(""); setError(""); }
  async function copyResults() {
    if (!results.length) return;
    try { await navigator.clipboard.writeText(results.join("\n")); setNotice("Results copied to clipboard."); }
    catch { setNotice("Clipboard access was blocked. Select the results and copy them manually."); }
  }
  function downloadResults() {
    if (!results.length) return;
    const blob = new Blob([results.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = mode === "number" ? "random-numbers.txt" : "picked-names.txt"; a.click(); URL.revokeObjectURL(url);
  }

  return <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Picker settings</h2><button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"><RotateCcw size={13}/> Reset</button></div>
      <div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => { setMode("number"); setResults([]); setError(""); }} aria-pressed={mode === "number"} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${mode === "number" ? "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><Dices size={17}/> Random number</button><button type="button" onClick={() => { setMode("name"); setResults([]); setError(""); }} aria-pressed={mode === "name"} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${mode === "name" ? "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><UserRound size={17}/> Name picker</button></div>
      {mode === "number" ? <div className="mt-5 grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum<input type="number" step="1" value={minText} onChange={(e) => setMinText(e.target.value)} className={inputClass}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Maximum<input type="number" step="1" value={maxText} onChange={(e) => setMaxText(e.target.value)} className={inputClass}/></label></div> : <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Names or entries <span className="font-normal text-slate-500">(one per line, or separated by commas)</span><textarea rows={7} value={namesText} onChange={(e) => setNamesText(e.target.value)} className={inputClass} placeholder="Enter names, one per line"/><span className="mt-1 block text-xs text-slate-500">{names.length} non-empty entries found.</span></label>}
      <label className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">How many results?<input type="number" min="1" max="100" step="1" value={countText} onChange={(e) => setCountText(e.target.value)} className={inputClass}/></label>
      <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"><input type="checkbox" checked={unique} onChange={(e) => setUnique(e.target.checked)} className="mt-0.5 accent-violet-600"/><span><span className="font-semibold text-slate-800 dark:text-slate-100">No duplicates</span><span className="mt-0.5 block text-xs leading-5 text-slate-500">Pick distinct numbers or distinct entries. If the list contains the same name more than once, those entries are treated as separate tickets.</span></span></label>
      <button type="button" onClick={pick} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><Shuffle size={17}/> Pick randomly</button>
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{notice}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-500">Uses browser cryptographic randomness. Results are generated on this device and are not uploaded.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your results</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{results.length} result{results.length === 1 ? "" : "s"}</span></div>
      {!results.length ? <div className="mt-5 flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50"><Dices size={32} className="text-slate-400"/><p className="mt-3 text-sm text-slate-500">Set your options, then pick a random number or name.</p></div> : <><ol className="mt-5 grid gap-2 sm:grid-cols-2">{results.map((result, index) => <li key={`${index}-${result}`} className={`flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-700 ${index === 0 ? "sm:col-span-2 bg-violet-50/60 dark:bg-violet-950/20" : ""}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-900/60 dark:text-violet-200">{index + 1}</span><span className={`${index === 0 ? "text-2xl" : "text-base"} min-w-0 break-words font-semibold text-slate-900 dark:text-white`}>{result}</span></li>)}</ol><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={copyResults} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><Clipboard size={15}/> Copy results</button><button type="button" onClick={downloadResults} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900">Download TXT</button><button type="button" onClick={pick} className="rounded-lg border border-violet-200 px-4 py-2.5 text-sm font-semibold text-violet-700 dark:border-violet-900 dark:text-violet-300">Pick again</button></div></>}
    </section>
  </div>;
}
