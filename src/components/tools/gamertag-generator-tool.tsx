"use client";

import { useMemo, useState } from "react";

type Style = "sweaty" | "fantasy" | "minimal" | "funny" | "dark" | "cyber";

const styleWords: Record<Style, { prefixes: string[]; suffixes: string[] }> = {
  sweaty: { prefixes: ["Clutch", "Sweat", "Aim", "Flick", "Rogue", "Toxic", "Peak"], suffixes: ["Diff", "FPS", "Clutch", "OneTap", "Frag", "Recoil", "Main"] },
  fantasy: { prefixes: ["Arcane", "Dragon", "Rune", "Shadow", "Storm", "Mystic", "Elder"], suffixes: ["Warden", "Mage", "Knight", "Drake", "Sage", "Rider", "Bane"] },
  minimal: { prefixes: ["Nova", "Echo", "Zen", "Kiro", "Vex", "Luma", "Aero"], suffixes: ["X", "Core", "Void", "Flux", "Zero", "One", "Neo"] },
  funny: { prefixes: ["Potato", "Waffle", "Sneaky", "Oops", "Tiny", "Sleepy", "Banana"], suffixes: ["Wizard", "Noodle", "Goblin", "Panda", "Toast", "Gremlin", "Duck"] },
  dark: { prefixes: ["Nocturne", "Grim", "Void", "Dread", "Raven", "Phantom", "Obsidian"], suffixes: ["Reaper", "Specter", "Shade", "Nightfall", "Wraith", "Hollow", "Curse"] },
  cyber: { prefixes: ["Cyber", "Neon", "Glitch", "Pixel", "Nano", "Quantum", "Synth"], suffixes: ["Byte", "Protocol", "Matrix", "Pulse", "Kernel", "Circuit", "Cipher"] },
};

function titleWord(value: string): string {
  return value.trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);
}

export default function GamertagGeneratorTool() {
  const [base, setBase] = useState("Nova");
  const [style, setStyle] = useState<Style>("cyber");
  const [count, setCount] = useState("20");
  const [includeNumbers, setIncludeNumbers] = useState(false);
  const [separator, setSeparator] = useState<"none" | "underscore" | "dot">("none");
  const [maxLength, setMaxLength] = useState("16");
  const [copyStatus, setCopyStatus] = useState("");

  const tags = useMemo(() => {
    const words = styleWords[style];
    const seed = titleWord(base);
    const sep = separator === "underscore" ? "_" : separator === "dot" ? "." : "";
    const candidates: string[] = [];
    if (seed) {
      candidates.push(seed, `${seed}${words.suffixes[0]}`, `${words.prefixes[0]}${seed}`);
      for (const suffix of words.suffixes) candidates.push(`${seed}${sep}${suffix}`);
      for (const prefix of words.prefixes) candidates.push(`${prefix}${sep}${seed}`);
    }
    for (const prefix of words.prefixes) {
      for (const suffix of words.suffixes) candidates.push(`${prefix}${sep}${suffix}`);
    }
    const limit = Math.max(6, Math.min(24, Number(maxLength) || 16));
    const unique = [...new Set(candidates.map((value) => value.replace(/[^a-zA-Z0-9_.]/g, "")).filter(Boolean))];
    const fitted = unique.filter((value) => value.length <= limit);
    const numbered = includeNumbers
      ? fitted.flatMap((value, i) => [value, `${value}${String(7 + i * 13).slice(0, 3)}`])
      : fitted;
    return [...new Set(numbered)].slice(0, Math.max(1, Math.min(50, Number(count) || 20)));
  }, [base, style, count, includeNumbers, separator, maxLength]);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(tags.join("\n"));
      setCopyStatus("Gamertags copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Select and copy the names manually.");
    }
  }

  function downloadList() {
    const blob = new Blob([tags.join("\n") + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gamertag-ideas.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Gamertag Generator</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Generate gaming-name ideas from local word lists. Availability is not checked on Xbox, PlayStation, Steam, Discord, or any other platform.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="gamertag-base" className="mb-1 block text-sm font-medium">Base word or nickname</label>
            <input id="gamertag-base" value={base} onChange={(e) => setBase(e.target.value)} maxLength={40} placeholder="Your nickname"
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>
          <div>
            <label htmlFor="gamertag-style" className="mb-1 block text-sm font-medium">Style</label>
            <select id="gamertag-style" value={style} onChange={(e) => setStyle(e.target.value as Style)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="sweaty">Competitive / Sweaty</option>
              <option value="fantasy">Fantasy</option>
              <option value="minimal">Minimal</option>
              <option value="funny">Funny</option>
              <option value="dark">Dark</option>
              <option value="cyber">Cyber / Sci-fi</option>
            </select>
          </div>
          <div>
            <label htmlFor="gamertag-count" className="mb-1 block text-sm font-medium">Number of ideas</label>
            <select id="gamertag-count" value={count} onChange={(e) => setCount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="10">10</option><option value="20">20</option><option value="30">30</option><option value="50">50</option>
            </select>
          </div>
          <div>
            <label htmlFor="gamertag-length" className="mb-1 block text-sm font-medium">Maximum length</label>
            <select id="gamertag-length" value={maxLength} onChange={(e) => setMaxLength(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="12">12 characters</option><option value="16">16 characters</option><option value="20">20 characters</option><option value="24">24 characters</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)} /> Include number variations</label>
          <label className="flex items-center gap-2 text-sm">Separator
            <select value={separator} onChange={(e) => setSeparator(e.target.value as "none" | "underscore" | "dot")}
              className="rounded-lg border border-slate-300 bg-white p-2 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="none">None</option><option value="underscore">Underscore</option><option value="dot">Dot</option>
            </select>
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Generated gamertags ({tags.length})</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => void copyAll()} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">Copy all</button>
            <button type="button" onClick={downloadList} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600">Download TXT</button>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {tags.map((tag) => <div key={tag} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"><span className="break-all font-medium">{tag}</span><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(tag); setCopyStatus(`${tag} copied.`); } catch { setCopyStatus("Clipboard access was blocked."); } }} className="shrink-0 text-sky-600 hover:underline">Copy</button></div>)}
        </div>
        {tags.length === 0 && <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">No names fit these settings. Try a shorter base word or a longer maximum length.</p>}
        {copyStatus && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Generated names are suggestions only. Check the target platform’s username rules and availability before using a name.</p>
      </section>
    </div>
  );
}
