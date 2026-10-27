
"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  ExternalLink,
  RotateCcw,
  Search,
} from "lucide-react";

type Thumbnail = {
  key: string;
  label: string;
  size: string;
  url: string;
  note: string;
};

function getVideoId(raw: string): string {
  const value = raw.trim();

  if (!value) return "";

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value;
  }

  try {
    const url = new URL(
      value.includes("://") ? value : `https://${value}`,
    );
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    let id = "";

    if (host === "youtu.be") {
      id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    } else if (
      host === "youtube.com" ||
      host.endsWith(".youtube.com") ||
      host === "youtube-nocookie.com" ||
      host.endsWith(".youtube-nocookie.com")
    ) {
      id = url.searchParams.get("v") ?? "";

      if (!id) {
        const parts = url.pathname.split("/").filter(Boolean);

        if (["embed", "shorts", "live", "v"].includes(parts[0] ?? "")) {
          id = parts[1] ?? "";
        }
      }
    }

    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : "";
  } catch {
    return "";
  }
}

export default function YouTubeThumbnailDownloaderTool() {
  const [input, setInput] = useState("");
  const [videoId, setVideoId] = useState("");
  const [selected, setSelected] = useState("maxresdefault");
  const [failed, setFailed] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  const thumbnails = useMemo<Thumbnail[]>(
    () =>
      videoId
        ? [
            {
              key: "maxresdefault",
              label: "Maximum resolution",
              size: "Usually 1280 × 720",
              url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              note: "May not exist for every video",
            },
            {
              key: "sddefault",
              label: "Standard definition",
              size: "Usually 640 × 480",
              url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
              note: "Availability varies",
            },
            {
              key: "hqdefault",
              label: "High quality",
              size: "Usually 480 × 360",
              url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
              note: "Common fallback",
            },
            {
              key: "mqdefault",
              label: "Medium quality",
              size: "Usually 320 × 180",
              url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
              note: "Common fallback",
            },
            {
              key: "default",
              label: "Default thumbnail",
              size: "Usually 120 × 90",
              url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
              note: "Small preview",
            },
          ]
        : [],
    [videoId],
  );

  const chosen = thumbnails.find((item) => item.key === selected) ??
    thumbnails[0];

  const invalid = Boolean(input.trim()) && !getVideoId(input);

  function load() {
    const id = getVideoId(input);

    setNotice("");
    setCopied(false);
    setFailed([]);

    if (!id) {
      setVideoId("");
      setNotice(
        "Enter a valid YouTube video URL or 11-character video ID.",
      );
      return;
    }

    setVideoId(id);
    setSelected("maxresdefault");
    setNotice(`Loaded thumbnails for video ID ${id}.`);
  }

  function clear() {
    setInput("");
    setVideoId("");
    setSelected("maxresdefault");
    setFailed([]);
    setCopied(false);
    setNotice("Input cleared.");
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice(
        "Clipboard access was blocked. You can select and copy the displayed text manually.",
      );
    }
  }

  async function downloadThumbnail(item: Thumbnail) {
    setNotice("");

    try {
      const response = await fetch(item.url, { mode: "cors" });

      if (!response.ok) {
        throw new Error("Image unavailable");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = `youtube-${videoId}-${item.key}.jpg`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      setNotice("Thumbnail download started.");
    } catch {
      setNotice(
        "Direct download was blocked by the image host. The image will open in a new tab so you can save it from your browser.",
      );
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Video details
          </h2>

          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium dark:border-slate-700"
          >
            <RotateCcw size={13} />
            Clear
          </button>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Paste a YouTube watch, Shorts, live, embed, or youtu.be link.
          This tool uses public thumbnail image URLs and does not fetch
          private video data.
        </p>

        <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">
          YouTube video URL or ID
          <input
            className={inputClass}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
              setNotice("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") load();
            }}
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
        </label>

        {invalid && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            This doesn&apos;t look like a supported YouTube URL or
            11-character video ID.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Search size={15} />
            Get thumbnails
          </button>

          <button
            type="button"
            onClick={() => {
              setInput(
                "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
              );
              setNotice(
                "Sample video URL loaded. Click Get thumbnails to preview it.",
              );
            }}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
          >
            Load sample
          </button>
        </div>

        {videoId && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Video ID
            </p>
            <p className="mt-1 break-all font-mono text-sm text-slate-900 dark:text-white">
              {videoId}
            </p>
            <button
              type="button"
              onClick={() => copyText(videoId, "Video ID")}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
            >
              <Clipboard size={13} />
              Copy ID
            </button>
          </div>
        )}

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {notice}
          </p>
        )}

        <p className="mt-5 text-xs leading-5 text-slate-500">
          Only reuse thumbnails when you have permission. Availability and
          resolution depend on the video and YouTube&apos;s current image
          endpoints.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Available thumbnail sizes
          </h2>
          {videoId && (
            <span className="text-xs text-slate-500">
              Video: {videoId}
            </span>
          )}
        </div>

        {!videoId ? (
          <div className="mt-5 flex min-h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50">
            Enter a video URL or ID to view available thumbnail sizes.
          </div>
        ) : (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {thumbnails.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    setSelected(item.key);
                    setNotice("");
                    setCopied(false);
                  }}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected === item.key
                      ? "border-violet-500 ring-2 ring-violet-100 dark:ring-violet-950"
                      : "border-slate-200 hover:border-slate-300 dark:border-slate-700"
                  }`}
                >
                  <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {failed.includes(item.key) ? (
                      <span className="px-3 text-center text-xs text-slate-500">
                        Image unavailable at this size
                      </span>
                    ) : (
                      <img
                        src={item.url}
                        alt={`${item.label} YouTube thumbnail`}
                        className="h-full w-full object-contain"
                        onError={() =>
                          setFailed((old) =>
                            old.includes(item.key)
                              ? old
                              : [...old, item.key],
                          )
                        }
                      />
                    )}
                  </div>

                  <div className="mt-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.size}
                      </p>
                    </div>

                    {selected === item.key && (
                      <Check
                        size={16}
                        className="shrink-0 text-violet-600"
                      />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {item.note}
                  </p>
                </button>
              ))}
            </div>

            {chosen && (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Selected: {chosen.label}
                </p>
                <p className="mt-1 break-all font-mono text-xs text-slate-600 dark:text-slate-300">
                  {chosen.url}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => copyText(chosen.url, "Thumbnail URL")}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                  >
                    <Clipboard size={14} />
                    {copied ? "Copied" : "Copy image URL"}
                  </button>

                  <button
                    type="button"
                    onClick={() => void downloadThumbnail(chosen)}
                    disabled={failed.includes(chosen.key)}
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Download size={14} />
                    Download JPG
                  </button>

                  <a
                    href={chosen.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold dark:border-slate-700 dark:bg-slate-900"
                  >
                    <ExternalLink size={14} />
                    Open image
                  </a>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
