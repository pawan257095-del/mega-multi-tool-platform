
"use client";

import { useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  RefreshCw,
  Trash2,
} from "lucide-react";

function createUUIDv4(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  if (
    typeof crypto === "undefined" ||
    typeof crypto.getRandomValues !== "function"
  ) {
    throw new Error(
      "This browser does not provide a cryptographically secure random generator.",
    );
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));

  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UUIDGUIDGeneratorTool() {
  const [count, setCount] = useState("5");
  const [uppercase, setUppercase] = useState(false);
  const [withoutHyphens, setWithoutHyphens] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setError("");
    setCopied(false);

    const amount = Number(count);

    if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
      setOutput("");
      setError("Enter a whole number from 1 to 1,000.");
      return;
    }

    try {
      const values = Array.from({ length: amount }, () => {
        let value = createUUIDv4();

        if (withoutHyphens) {
          value = value.replace(/-/g, "");
        }

        return uppercase ? value.toUpperCase() : value;
      });

      setOutput(values.join("\n"));
    } catch (err) {
      setOutput("");
      setError(
        err instanceof Error
          ? err.message
          : "Could not generate UUIDs in this browser.",
      );
    }
  }

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
    } catch {
      setError(
        "Clipboard access was blocked. Select the result and copy it manually.",
      );
    }
  }

  function downloadOutput() {
    if (!output) return;

    const blob = new Blob([output + "\n"], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "generated-uuids.txt";
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function clearResults() {
    setOutput("");
    setError("");
    setCopied(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Generator settings
        </h2>

        <label
          htmlFor="uuid-count"
          className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Number of UUIDs (1–1,000)
        </label>

        <input
          id="uuid-count"
          type="number"
          min="1"
          max="1000"
          step="1"
          value={count}
          onChange={(event) => setCount(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950"
        />

        <div className="mt-5 space-y-3">
          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(event) => setUppercase(event.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            Use uppercase letters
          </label>

          <label className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={withoutHyphens}
              onChange={(event) => setWithoutHyphens(event.target.checked)}
              className="h-4 w-4 accent-violet-600"
            />
            Remove hyphens (compact format)
          </label>
        </div>

        <button
          type="button"
          onClick={generate}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <RefreshCw size={16} />
          Generate UUIDs
        </button>

        <button
          type="button"
          onClick={clearResults}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Trash2 size={15} />
          Clear results
        </button>

        <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          UUID v4 values contain 122 random bits plus version and variant
          markers. A GUID is a common name for the same general identifier
          format.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Generated output
          </h2>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {output
              ? `${output.split("\n").length} item(s)`
              : "No results yet"}
          </span>
        </div>

        <textarea
          aria-label="Generated UUID values"
          readOnly
          value={output}
          placeholder="Your generated UUIDs will appear here…"
          className="mt-4 min-h-72 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!output}
            onClick={copyOutput}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {copied ? <Check size={15} /> : <Clipboard size={15} />}
            {copied ? "Copied" : "Copy all"}
          </button>

          <button
            type="button"
            disabled={!output}
            onClick={downloadOutput}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Download size={15} />
            Download TXT
          </button>
        </div>
      </section>
    </div>
  );
}
