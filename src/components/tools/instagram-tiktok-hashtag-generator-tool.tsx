"use client";

import { useMemo, useState } from "react";

type Platform = "instagram" | "tiktok";
type Style = "balanced" | "niche" | "broad";

const topicPresets: Record<string, string[]> = {
  technology: ["technology", "tech", "techtips", "digitaltools", "innovation", "techcommunity", "howto"],
  programming: ["programming", "coding", "learncoding", "programmingtips", "developer", "softwaredevelopment", "codinglife"],
  fitness: ["fitness", "workout", "fitnesstips", "healthylifestyle", "strengthtraining", "gymmotivation", "wellness"],
  food: ["food", "foodie", "easyrecipes", "homecooking", "foodlover", "recipeideas", "cooking"],
  travel: ["travel", "travelgram", "wanderlust", "travelguide", "exploremore", "travelphotography", "adventure"],
  education: ["education", "learning", "studytips", "studentlife", "knowledge", "learnsomething", "studywithme"],
  business: ["entrepreneur", "smallbusiness", "marketingtips", "businessgrowth", "startuplife", "branding", "digitalmarketing"],
  beauty: ["beauty", "skincare", "beautytips", "makeupideas", "selfcare", "beautyroutine", "glowup"],
  gaming: ["gaming", "gamer", "gamingcommunity", "gameplay", "pcgaming", "mobilegaming", "gamingclips"],
};

function normalizeTag(value: string): string {
  return value.trim().replace(/^#+/, "").replace(/\s+/g, "");
}

export default function InstagramTikTokHashtagGeneratorTool() {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [topic, setTopic] = useState("technology");
  const [niche, setNiche] = useState("");
  const [customTags, setCustomTags] = useState("");
  const [style, setStyle] = useState<Style>("balanced");
  const [count, setCount] = useState("15");
  const [copyStatus, setCopyStatus] = useState("");

  const tags = useMemo(() => {
    const topicKey = topic.toLocaleLowerCase().trim();
    const presetTags = topicPresets[topicKey] ?? [
      topicKey.replace(/[^a-z0-9]+/gi, ""),
      `${topicKey.replace(/[^a-z0-9]+/gi, "")}tips`,
      `${topicKey.replace(/[^a-z0-9]+/gi, "")}community`,
      "contentcreator",
      "explore",
      "tipsandtricks",
      "dailyinspiration",
    ];
    const nicheTags = niche.split(/[,\n;]+/).map(normalizeTag).filter(Boolean);
    const manualTags = customTags.split(/[,\n;]+/).map(normalizeTag).filter(Boolean);
    const styleTags = style === "niche"
      ? [...nicheTags, ...presetTags.slice(0, 4)]
      : style === "broad"
        ? [...presetTags.slice(0, 4), "trending", "viral", "fyp", "explorepage"]
        : [...nicheTags, ...presetTags, "contentcreator", "dailycontent"];
    const platformTags = platform === "tiktok" ? ["fyp", "foryou", "tiktok", "tiktoktips"] : ["instagram", "instagood", "reels", "reelsinstagram"];
    const combined = [...manualTags, ...styleTags, ...platformTags];
    const seen = new Set<string>();
    return combined.filter((tag) => {
      const normalized = tag.toLocaleLowerCase();
      if (!normalized || seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    }).slice(0, Math.max(1, Math.min(30, Number(count) || 15)));
  }, [platform, topic, niche, customTags, style, count]);

  const output = tags.map((tag) => `#${tag}`).join(" ");

  async function copyTags() {
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Hashtags copied to clipboard.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Select and copy the hashtags manually.");
    }
  }

  function downloadTxt() {
    const blob = new Blob([output + "\n"], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${platform}-hashtags.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Instagram / TikTok Hashtag Generator</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create a starting set of hashtags from local topic templates and your own tags. Suggestions are not live trend data and do not guarantee reach.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hashtag-platform" className="mb-1 block text-sm font-medium">Platform</label>
            <select id="hashtag-platform" value={platform} onChange={(e) => setPlatform(e.target.value as Platform)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label htmlFor="hashtag-topic" className="mb-1 block text-sm font-medium">Topic / niche</label>
            <input id="hashtag-topic" list="hashtag-topic-options" value={topic} onChange={(e) => setTopic(e.target.value)} maxLength={80}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
            <datalist id="hashtag-topic-options">
              {Object.keys(topicPresets).map((item) => <option key={item} value={item} />)}
            </datalist>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="hashtag-niche" className="mb-1 block text-sm font-medium">Specific niche tags (optional)</label>
          <input id="hashtag-niche" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. ai, machine learning, student projects"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        <div className="mt-4">
          <label htmlFor="hashtag-custom" className="mb-1 block text-sm font-medium">Your own hashtags / keywords (optional)</label>
          <textarea id="hashtag-custom" value={customTags} onChange={(e) => setCustomTags(e.target.value)} rows={3}
            placeholder="Paste tags separated by commas, spaces inside tags are removed"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hashtag-style" className="mb-1 block text-sm font-medium">Hashtag style</label>
            <select id="hashtag-style" value={style} onChange={(e) => setStyle(e.target.value as Style)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="balanced">Balanced</option>
              <option value="niche">Niche-focused</option>
              <option value="broad">Broad discovery</option>
            </select>
          </div>
          <div>
            <label htmlFor="hashtag-count" className="mb-1 block text-sm font-medium">Maximum hashtags</label>
            <select id="hashtag-count" value={count} onChange={(e) => setCount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="5">5</option><option value="10">10</option><option value="15">15</option><option value="20">20</option><option value="30">30</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold">Generated hashtags ({tags.length})</h3>
          <div className="flex gap-2">
            <button type="button" onClick={() => void copyTags()} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700">Copy</button>
            <button type="button" onClick={downloadTxt} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium dark:border-slate-600">Download TXT</button>
          </div>
        </div>
        <textarea readOnly value={output} rows={5} className="mt-3 w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900" />
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag) => <span key={tag} className="rounded-full bg-white px-3 py-1 text-sm text-sky-700 dark:bg-slate-900 dark:text-sky-300">#{tag}</span>)}
        </div>
        {copyStatus && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Review tags for relevance and platform rules before posting. “Trending”, “viral”, and similar tags are generic template suggestions, not evidence that a tag is currently trending.</p>
      </section>
    </div>
  );
}
