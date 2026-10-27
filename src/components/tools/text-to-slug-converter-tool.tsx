
"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  ArrowRightLeft,
  Link2,
} from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

type Separator = "hyphen" | "underscore";

function toSlug(
  value: string,
  separator: Separator,
  stripAccents: boolean,
  keepNumbers: boolean,
): string {
  let result = value.trim().toLocaleLowerCase();

  if (stripAccents) {
    result = result.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  }

  // Keep letters and optionally numbers from any language.
  const allowed = keepNumbers
    ? /[^\p{L}\p{N}]+/gu
    : /[^\p{L}]+/gu;

  const replacement = separator === "hyphen" ? "-" : "_";
  const delimiter = separator === "hyphen" ? /-+/g : /_+/g;

  result = result.replace(allowed, replacement);
  result = result.replace(delimiter, replacement);

  return result.replace(/^[-_]+|[-_]+$/g, "");
}

export default function TextToSlugConverterTool() {
  const [text, setText] = useState(
    "How to Build a Great Website in 2026!",
  );
  const [separator, setSeparator] = useState<Separator>("hyphen");
  const [stripAccents, setStripAccents] = useState(true);
  const [keepNumbers, setKeepNumbers] = useState(true);
  const [copied, setCopied] = useState(false);

  const slug = useMemo(
    () => toSlug(text, separator, stripAccents, keepNumbers),
    [text, separator, stripAccents, keepNumbers],
  );

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(slug);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function downloadResult() {
    const blob = new Blob([slug], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "slug.txt";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function reset() {
    setText("");
    setSeparator("hyphen");
    setStripAccents(true);
    setKeepNumbers(true);
    setCopied(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Create a URL-friendly slug
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The slug updates as you type. No server upload is required.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="slug-input">
              Title or phrase
            </label>

            <textarea
              id="slug-input"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setCopied(false);
              }}
              rows={8}
              placeholder="Enter a title, article heading, or phrase…"
              className={`${inputClass} min-h-48 resize-y leading-7`}
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {text.length.toLocaleString()} input characters
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <span className={labelClass}>Word separator</span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSeparator("hyphen");
                      setCopied(false);
                    }}
                    aria-pressed={separator === "hyphen"}
                    className={`rounded-xl border p-3 text-left ${
                      separator === "hyphen"
                        ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:ring-violet-950"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Hyphen (-)
                    </span>
                    <span className="mt-1 block font-mono text-xs text-violet-700 dark:text-violet-300">
                      great-website-title
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSeparator("underscore");
                      setCopied(false);
                    }}
                    aria-pressed={separator === "underscore"}
                    className={`rounded-xl border p-3 text-left ${
                      separator === "underscore"
                        ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:ring-violet-950"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                      Underscore (_)
                    </span>
                    <span className="mt-1 block font-mono text-xs text-violet-700 dark:text-violet-300">
                      great_website_title
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={stripAccents}
                  onChange={(event) => {
                    setStripAccents(event.target.checked);
                    setCopied(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="font-semibold">
                    Normalize accented letters
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    For example, “café” becomes “cafe”.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={keepNumbers}
                  onChange={(event) => {
                    setKeepNumbers(event.target.checked);
                    setCopied(false);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span>
                  <span className="font-semibold">Keep numbers</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Turn this off to remove digits from the slug.
                  </span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="slug-output">
              Generated slug
            </label>

            <textarea
              id="slug-output"
              readOnly
              value={slug}
              rows={8}
              className={`${inputClass} min-h-48 resize-y bg-slate-50 font-mono leading-7 dark:bg-slate-950`}
              placeholder="Your slug will appear here…"
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!slug}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied slug" : "Copy slug"}
              </button>

              <button
                type="button"
                onClick={downloadResult}
                disabled={!slug}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download size={16} />
                Download .txt
              </button>

              <button
                type="button"
                onClick={() => {
                  setText(slug);
                  setCopied(false);
                }}
                disabled={!slug}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowRightLeft size={16} />
                Use as input
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                <Link2
                  size={16}
                  className="text-violet-600 dark:text-violet-400"
                />
                URL preview
              </div>

              <p className="mt-2 break-all font-mono text-sm text-violet-700 dark:text-violet-300">
                {`https://example.com/${slug || "your-slug"}`}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                  <span className="text-slate-500 dark:text-slate-400">
                    Slug length
                  </span>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {slug.length.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 dark:bg-slate-900">
                  <span className="text-slate-500 dark:text-slate-400">
                    Words detected
                  </span>
                  <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                    {slug
                      ? slug
                          .split(separator === "hyphen" ? "-" : "_")
                          .filter(Boolean)
                          .length.toLocaleString()
                      : "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
        Note: URL rules differ between platforms. This tool generates a
        general-purpose slug; check your site&apos;s routing and language
        requirements before publishing.
      </p>
    </div>
  );
}
