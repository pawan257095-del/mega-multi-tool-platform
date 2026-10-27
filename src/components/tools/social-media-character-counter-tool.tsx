"use client";

import { useMemo, useState } from "react";

type Platform = { id: string; label: string; limit: number; note?: string };

const PLATFORMS: Platform[] = [
  { id: "x", label: "X / Twitter", limit: 280 },
  { id: "instagram", label: "Instagram caption", limit: 2200 },
  { id: "linkedin", label: "LinkedIn post", limit: 3000 },
  { id: "youtube", label: "YouTube description", limit: 5000 },
  { id: "tiktok", label: "TikTok caption (reference)", limit: 2200, note: "TikTok limits may vary by region, account, and app version." },
  { id: "custom", label: "Custom limit", limit: 280 },
];

export default function SocialMediaCharacterCounterTool() {
  const [text, setText] = useState("");
  const [platformId, setPlatformId] = useState("x");
  const [customLimit, setCustomLimit] = useState("280");
  const platform = PLATFORMS.find((item) => item.id === platformId) ?? PLATFORMS[0];
  const limit = platformId === "custom" ? Math.max(0, Number.parseInt(customLimit, 10) || 0) : platform.limit;

  const stats = useMemo(() => ({
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, "").length,
    words: text.trim() ? text.trim().split(/\s+/u).length : 0,
    lines: text.length ? text.split(/\r\n|\r|\n/).length : 0,
    hashtags: (text.match(/(^|\s)#[\p{L}\p{N}_]+/gu) ?? []).length,
    urls: (text.match(/https?:\/\/[^\s]+/giu) ?? []).length,
  }), [text]);

  async function copyText() {
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { /* Clipboard access can be blocked. */ }
  }

  const remaining = limit - stats.characters;
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="w-full sm:max-w-md">
            <label htmlFor="smcc-platform" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Platform / character limit</label>
            <select id="smcc-platform" value={platformId} onChange={(event) => setPlatformId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              {PLATFORMS.map((item) => <option key={item.id} value={item.id}>{item.label} — {item.id === "custom" ? "set your own" : `${item.limit.toLocaleString()} characters`}</option>)}
            </select>
          </div>
          {platformId === "custom" && <div className="w-full sm:w-48">
            <label htmlFor="smcc-custom-limit" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Custom limit</label>
            <input id="smcc-custom-limit" type="number" min="0" value={customLimit} onChange={(event) => setCustomLimit(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>}
        </div>
        <div className="mt-5">
          <label htmlFor="smcc-text" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Your post or caption</label>
          <textarea id="smcc-text" value={text} onChange={(event) => setText(event.target.value)} placeholder="Write or paste your social media post here…" rows={9} className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${remaining < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-600 dark:text-slate-300"}`} aria-live="polite">
              {stats.characters.toLocaleString()} / {limit.toLocaleString()} characters
              {remaining < 0 ? ` · ${Math.abs(remaining).toLocaleString()} over limit` : ` · ${remaining.toLocaleString()} remaining`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyText} disabled={!text} className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40">Copy text</button>
              <button type="button" onClick={() => setText("")} disabled={!text} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Clear</button>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className={`h-full rounded-full transition-all ${remaining < 0 ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${limit > 0 ? Math.min(100, (stats.characters / limit) * 100) : (stats.characters ? 100 : 0)}%` }} />
          </div>
          {remaining < 0 && <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">Your text is over the selected limit. Trim it before posting.</p>}
          {platform.note && <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">{platform.note}</p>}
        </div>
      </section>
      <section aria-label="Text statistics" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          ["Characters", stats.characters], ["Characters without spaces", stats.charactersNoSpaces],
          ["Words", stats.words], ["Lines", stats.lines], ["Hashtags", stats.hashtags], ["URLs", stats.urls],
        ].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{Number(value).toLocaleString()}</p>
        </div>)}
      </section>
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        Counts are calculated in your browser. Platform limits can change and may vary by account, region, or app version; verify the current limit before publishing. Character counting uses JavaScript string length, so some emoji may count as more than one character.
      </p>
    </div>
  );
}
