
"use client";

import { useMemo, useState } from "react";

type ParsedTag = {
  value: string;
  normalized: string;
  length: number;
};

function parseTags(raw: string): ParsedTag[] {
  return raw
    .split(/[,\n;]+/)
    .map((value) => value.trim().replace(/^#+/, ""))
    .filter(Boolean)
    .map((value) => ({
      value,
      normalized: value.toLocaleLowerCase(),
      length: value.length,
    }));
}

export default function YoutubeTagsKeywordsTool() {
  const [videoTitle, setVideoTitle] = useState("");
  const [rawTags, setRawTags] = useState("");
  const [keywordText, setKeywordText] = useState("");
  const [separator, setSeparator] = useState<"comma" | "newline">("comma");
  const [includeHashtags, setIncludeHashtags] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  const analysis = useMemo(() => {
    const tags = parseTags(rawTags);
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const tag of tags) {
      if (seen.has(tag.normalized)) {
        duplicates.add(tag.normalized);
      }
      seen.add(tag.normalized);
    }

    const uniqueTags = tags.filter(
      (tag, index) =>
        tags.findIndex((item) => item.normalized === tag.normalized) ===
        index,
    );

    const titleWords = new Set(
      videoTitle.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [],
    );

    const keywords = keywordText
      .split(/[,\n;]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    const repeatedKeywords = keywords.filter(
      (value, index) =>
        keywords.findIndex(
          (item) => item.toLocaleLowerCase() === value.toLocaleLowerCase(),
        ) !== index,
    );

    const titleMatches = uniqueTags.filter((tag) => {
      const words = tag.normalized.match(/[\p{L}\p{N}]+/gu) ?? [];
      return words.some((word) => titleWords.has(word));
    });

    return {
      tags,
      uniqueTags,
      duplicates: [...duplicates],
      totalCharacters:
        tags.reduce((sum, tag) => sum + tag.length, 0) +
        Math.max(0, tags.length - 1),
      longestTag: tags.reduce(
        (longest, tag) =>
          tag.length > longest.length ? tag.value : longest,
        "",
      ),
      keywords,
      repeatedKeywords,
      titleMatches,
    };
  }, [rawTags, videoTitle, keywordText]);

  const outputTags = analysis.uniqueTags
    .map((tag) =>
      includeHashtags ? `#${tag.value.replace(/\s+/g, "")}` : tag.value,
    )
    .join(separator === "comma" ? ", " : "\n");

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopyStatus(`${label} copied to clipboard.`);
    } catch {
      setCopyStatus(
        "Clipboard access was blocked by your browser. Select and copy the text manually.",
      );
    }
  }

  function downloadCsv() {
    const rows: string[][] = [
      ["Tag", "Character count", "Duplicate", "Shares word with title"],
    ];

    for (const tag of analysis.tags) {
      rows.push([
        tag.value,
        String(tag.length),
        analysis.duplicates.includes(tag.normalized) ? "Yes" : "No",
        analysis.titleMatches.some(
          (match) => match.normalized === tag.normalized,
        )
          ? "Yes"
          : "No",
      ]);
    }

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${cell.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "youtube-tags-analysis.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">
          YouTube Tags / Keywords
        </h2>

        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Paste tags you already have to clean up duplicates, review
          character counts, and compare tags with your video title. This
          tool does not scrape YouTube or reveal hidden tags from other
          channels.
        </p>

        <div className="mt-5">
          <label
            htmlFor="yt-tags-title"
            className="mb-1 block text-sm font-medium"
          >
            Your video title (optional)
          </label>

          <input
            id="yt-tags-title"
            value={videoTitle}
            onChange={(event) => setVideoTitle(event.target.value)}
            maxLength={300}
            placeholder="e.g. Beginner Python Tutorial"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="yt-tags-input"
            className="mb-1 block text-sm font-medium"
          >
            Existing tags (separate with commas, semicolons, or new lines)
          </label>

          <textarea
            id="yt-tags-input"
            value={rawTags}
            onChange={(event) => setRawTags(event.target.value)}
            rows={6}
            placeholder={"python tutorial, learn python, beginner coding\nPython Tutorial"}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="yt-keywords-input"
            className="mb-1 block text-sm font-medium"
          >
            Keyword ideas to compare (optional)
          </label>

          <textarea
            id="yt-keywords-input"
            value={keywordText}
            onChange={(event) => setKeywordText(event.target.value)}
            rows={3}
            placeholder="python for beginners, coding tutorial, learn python"
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="yt-tags-separator"
              className="mb-1 block text-sm font-medium"
            >
              Output format
            </label>

            <select
              id="yt-tags-separator"
              value={separator}
              onChange={(event) =>
                setSeparator(event.target.value as "comma" | "newline")
              }
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="comma">Comma-separated</option>
              <option value="newline">One tag per line</option>
            </select>
          </div>

          <label className="flex items-center gap-2 self-end pb-3 text-sm">
            <input
              type="checkbox"
              checked={includeHashtags}
              onChange={(event) =>
                setIncludeHashtags(event.target.checked)
              }
            />
            Format output as hashtags
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <h3 className="font-semibold">Tag analysis</h3>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Tags entered</p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.tags.length}
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Unique tags</p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.uniqueTags.length}
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">Duplicate values</p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.duplicates.length}
            </p>
          </div>

          <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
            <p className="text-xs text-slate-500">
              Combined characters*
            </p>
            <p className="mt-1 text-2xl font-bold">
              {analysis.totalCharacters}
            </p>
          </div>
        </div>

        {analysis.duplicates.length > 0 && (
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            Duplicates detected: {analysis.duplicates.join(", ")}
          </p>
        )}

        <div className="mt-5">
          <label
            htmlFor="yt-tags-output"
            className="mb-1 block text-sm font-medium"
          >
            Cleaned output
          </label>

          <textarea
            id="yt-tags-output"
            readOnly
            value={outputTags}
            rows={5}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-900"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void copyText(outputTags, "Cleaned tags")}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              Copy cleaned tags
            </button>

            <button
              type="button"
              onClick={downloadCsv}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600"
            >
              Download CSV analysis
            </button>
          </div>

          {copyStatus && (
            <p
              role="status"
              className="mt-2 text-sm text-slate-600 dark:text-slate-300"
            >
              {copyStatus}
            </p>
          )}
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          *Character total includes commas between parsed tags and is not
          a guarantee of YouTube&apos;s current tag-field acceptance rules.
          The tool only analyzes text you provide.
        </p>
      </section>

      <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
        <h3 className="font-semibold">Keyword comparison</h3>

        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Tags sharing at least one word with your title:{" "}
          {analysis.titleMatches.length
            ? analysis.titleMatches
                .map((tag) => tag.value)
                .join(", ")
            : "None detected yet."}
        </p>

        {analysis.repeatedKeywords.length > 0 && (
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
            Repeated keyword ideas:{" "}
            {analysis.repeatedKeywords.join(", ")}
          </p>
        )}

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          This is a text-cleanup helper, not an SEO ranking predictor. It
          does not fetch search volume, competitors, or current YouTube
          suggestions.
        </p>
      </section>
    </div>
  );
}
