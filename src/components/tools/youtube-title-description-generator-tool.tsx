"use client";

import { useMemo, useState } from "react";

type Tone = "informative" | "curious" | "bold" | "friendly";
type Length = "short" | "detailed";

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

export default function YoutubeTitleDescriptionGeneratorTool() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("beginners");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState<Tone>("informative");
  const [length, setLength] = useState<Length>("detailed");
  const [channelName, setChannelName] = useState("");
  const [callToAction, setCallToAction] = useState("Like, subscribe, and share your questions in the comments.");
  const [generated, setGenerated] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const output = useMemo(() => {
    const subject = clean(topic);
    if (!subject) return null;
    const keyList = keywords.split(/[,\n;]+/).map(clean).filter(Boolean).slice(0, 8);
    const primaryKeyword = keyList[0] || subject;
    const channel = clean(channelName);
    const toneLead: Record<Tone, string[]> = {
      informative: [`${titleCase(subject)} Explained: A Practical Guide`, `How to Learn ${titleCase(subject)} Step by Step`, `${titleCase(subject)} for ${titleCase(audience)}: What to Know`],
      curious: [`What Most People Miss About ${titleCase(subject)}`, `Can You Master ${titleCase(subject)}? Start Here`, `${titleCase(subject)}: The Questions Worth Asking`],
      bold: [`Stop Making These ${titleCase(subject)} Mistakes`, `${titleCase(subject)}: Learn the Essentials Faster`, `The ${titleCase(subject)} Guide You Need`],
      friendly: [`Let's Learn ${titleCase(subject)} Together`, `${titleCase(subject)} Made Easier`, `A Beginner-Friendly Guide to ${titleCase(subject)}`],
    };
    const titles = toneLead[tone].map((t) => t.replace(/\s+/g, " ").trim());
    if (keyList.length > 0 && !titles[0].toLocaleLowerCase().includes(primaryKeyword.toLocaleLowerCase())) {
      titles[0] = `${titleCase(primaryKeyword)}: ${titles[0]}`;
    }
    const titleOptions = [...new Set(titles)].slice(0, 3);
    const keywordLine = keyList.length ? `Topics covered: ${keyList.join(", ")}.` : `In this video, we explore ${subject} in a clear, practical way.`;
    const intro = length === "short"
      ? `In this video, you'll get a concise overview of ${subject} for ${audience}.`
      : `Want to understand ${subject}? This video walks through the key ideas for ${audience}, with a practical focus and clear next steps.`;
    const description = [
      intro,
      "",
      "In this video:",
      `• Understand the core ideas behind ${subject}.`,
      `• See how to approach it as ${audience}.`,
      `• Identify useful next steps and common pitfalls.`,
      "",
      keywordLine,
      "",
      clean(callToAction) || "Share your questions in the comments.",
      channel ? `\nChannel: ${channel}` : "",
      keyList.length ? `\nKeywords: ${keyList.join(" | ")}` : "",
      "\nNote: Review and personalize this draft before publishing. Confirm all claims, links, timestamps, and chapter markers yourself.",
    ].filter((part) => part !== "").join("\n");
    return { titles: titleOptions, description };
  }, [topic, audience, keywords, tone, length, channelName, callToAction]);

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`${label} copied.`);
    } catch {
      setCopyStatus("Clipboard access was blocked. Select and copy the text manually.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">YouTube Title / Description Generator</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Create editable draft ideas from your own inputs. This version uses local templates and does not call an AI service or fetch live SEO data.
        </p>

        <div className="mt-5">
          <label htmlFor="yt-gen-topic" className="mb-1 block text-sm font-medium">Video topic (required)</label>
          <input id="yt-gen-topic" value={topic} onChange={(e) => { setTopic(e.target.value); setGenerated(false); }} maxLength={200}
            placeholder="e.g. Python loops for beginners"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="yt-gen-audience" className="mb-1 block text-sm font-medium">Target audience</label>
            <input id="yt-gen-audience" value={audience} onChange={(e) => setAudience(e.target.value)} maxLength={100}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>
          <div>
            <label htmlFor="yt-gen-channel" className="mb-1 block text-sm font-medium">Channel name (optional)</label>
            <input id="yt-gen-channel" value={channelName} onChange={(e) => setChannelName(e.target.value)} maxLength={100}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="yt-gen-keywords" className="mb-1 block text-sm font-medium">Keywords (optional, comma-separated)</label>
          <textarea id="yt-gen-keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3}
            placeholder="python tutorial, programming basics, coding"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="yt-gen-tone" className="mb-1 block text-sm font-medium">Tone</label>
            <select id="yt-gen-tone" value={tone} onChange={(e) => setTone(e.target.value as Tone)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="informative">Informative</option>
              <option value="curious">Curiosity-driven</option>
              <option value="bold">Bold</option>
              <option value="friendly">Friendly</option>
            </select>
          </div>
          <div>
            <label htmlFor="yt-gen-length" className="mb-1 block text-sm font-medium">Description length</label>
            <select id="yt-gen-length" value={length} onChange={(e) => setLength(e.target.value as Length)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="short">Short</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="yt-gen-cta" className="mb-1 block text-sm font-medium">Call to action</label>
          <textarea id="yt-gen-cta" value={callToAction} onChange={(e) => setCallToAction(e.target.value)} rows={2}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>

        <button type="button" onClick={() => setGenerated(true)} disabled={!clean(topic)}
          className="mt-5 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50">
          Generate draft ideas
        </button>
      </section>

      {generated && output && (
        <section className="space-y-4" aria-live="polite">
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Title ideas</h3>
              <button type="button" onClick={() => void copyText(output.titles.join("\n"), "Title ideas")}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600">Copy all titles</button>
            </div>
            <ol className="mt-3 list-decimal space-y-3 pl-5">
              {output.titles.map((title, index) => (
                <li key={`${index}-${title}`} className="break-words">{title}</li>
              ))}
            </ol>
          </div>
          <div className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Description draft</h3>
              <button type="button" onClick={() => void copyText(output.description, "Description")}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600">Copy description</button>
            </div>
            <textarea readOnly value={output.description} rows={12}
              className="mt-3 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>
          {copyStatus && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
        </section>
      )}
    </div>
  );
}
