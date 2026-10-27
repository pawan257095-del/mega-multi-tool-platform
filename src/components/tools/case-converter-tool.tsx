
"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  ArrowRightLeft,
} from "lucide-react";

type CaseMode =
  | "uppercase"
  | "lowercase"
  | "title"
  | "sentence"
  | "alternating"
  | "inverse"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant";

const modes: {
  id: CaseMode;
  label: string;
  example: string;
  description: string;
}[] = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    example: "HELLO WORLD",
    description: "Make every letter uppercase.",
  },
  {
    id: "lowercase",
    label: "lowercase",
    example: "hello world",
    description: "Make every letter lowercase.",
  },
  {
    id: "title",
    label: "Title Case",
    example: "Hello World",
    description: "Capitalize the first letter of each word.",
  },
  {
    id: "sentence",
    label: "Sentence case",
    example: "Hello world. This is a sentence.",
    description: "Capitalize the first letter after sentence punctuation.",
  },
  {
    id: "alternating",
    label: "aLtErNaTiNg cAsE",
    example: "hElLo WoRlD",
    description: "Alternate lowercase and uppercase letters.",
  },
  {
    id: "inverse",
    label: "iNVERSE cASE",
    example: "hELLO wORLD",
    description: "Swap the case of each letter.",
  },
  {
    id: "camel",
    label: "camelCase",
    example: "helloWorldExample",
    description: "Join words, capitalizing each word after the first.",
  },
  {
    id: "pascal",
    label: "PascalCase",
    example: "HelloWorldExample",
    description: "Join words and capitalize each word.",
  },
  {
    id: "snake",
    label: "snake_case",
    example: "hello_world_example",
    description: "Join lowercase words with underscores.",
  },
  {
    id: "kebab",
    label: "kebab-case",
    example: "hello-world-example",
    description: "Join lowercase words with hyphens.",
  },
  {
    id: "constant",
    label: "CONSTANT_CASE",
    example: "HELLO_WORLD_EXAMPLE",
    description: "Join uppercase words with underscores.",
  },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

function wordsFrom(text: string): string[] {
  return (
    text
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function sentenceCase(text: string): string {
  let capitalizeNext = true;

  return text
    .toLocaleLowerCase()
    .replace(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu, (part) => {
      if (!/[\p{L}\p{N}]/u.test(part)) {
        if (/[.!?]\s*$/.test(part)) {
          capitalizeNext = true;
        }

        return part;
      }

      if (capitalizeNext) {
        capitalizeNext = false;
        return part.charAt(0).toLocaleUpperCase() + part.slice(1);
      }

      return part;
    });
}

function convert(text: string, mode: CaseMode): string {
  const words = wordsFrom(text);

  switch (mode) {
    case "uppercase":
      return text.toLocaleUpperCase();

    case "lowercase":
      return text.toLocaleLowerCase();

    case "title":
      return text
        .toLocaleLowerCase()
        .replace(
          /(^|[\s\-_/]+)([\p{L}\p{N}])/gu,
          (_, separator: string, letter: string) =>
            separator + letter.toLocaleUpperCase(),
        );

    case "sentence":
      return sentenceCase(text);

    case "alternating": {
      let index = 0;

      return Array.from(text, (char) => {
        if (!/[\p{L}]/u.test(char)) return char;

        const result =
          index % 2 === 0
            ? char.toLocaleLowerCase()
            : char.toLocaleUpperCase();

        index += 1;
        return result;
      }).join("");
    }

    case "inverse":
      return Array.from(text, (char) =>
        char === char.toLocaleUpperCase()
          ? char.toLocaleLowerCase()
          : char.toLocaleUpperCase(),
      ).join("");

    case "camel":
      return words
        .map((word, index) => {
          const lower = word.toLocaleLowerCase();

          return index === 0
            ? lower
            : lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
        })
        .join("");

    case "pascal":
      return words
        .map((word) => {
          const lower = word.toLocaleLowerCase();
          return lower.charAt(0).toLocaleUpperCase() + lower.slice(1);
        })
        .join("");

    case "snake":
      return words.map((word) => word.toLocaleLowerCase()).join("_");

    case "kebab":
      return words.map((word) => word.toLocaleLowerCase()).join("-");

    case "constant":
      return words.map((word) => word.toLocaleUpperCase()).join("_");
  }
}

export default function CaseConverterTool() {
  const [text, setText] = useState(
    "Hello world! Convert this text into different cases.",
  );
  const [mode, setMode] = useState<CaseMode>("title");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => convert(text, mode), [text, mode]);
  const selected = modes.find((item) => item.id === mode) ?? modes[0];

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function downloadResult() {
    const blob = new Blob([result], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `converted-${mode}.txt`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  function reset() {
    setText("");
    setMode("title");
    setCopied(false);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Convert text case
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose a format and the output updates instantly. Processing is
              local to your browser.
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

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setMode(item.id);
                setCopied(false);
              }}
              aria-pressed={mode === item.id}
              className={`rounded-xl border p-3 text-left transition ${
                mode === item.id
                  ? "border-violet-300 bg-violet-50 ring-2 ring-violet-100 dark:border-violet-800 dark:bg-violet-950/50 dark:ring-violet-950"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                {item.label}
              </span>
              <span className="mt-1 block break-all font-mono text-xs text-violet-700 dark:text-violet-300">
                {item.example}
              </span>
              <span className="mt-2 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                {item.description}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="case-converter-input">
              Input text
            </label>
            <textarea
              id="case-converter-input"
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setCopied(false);
              }}
              rows={11}
              placeholder="Type or paste text here…"
              className={`${inputClass} min-h-64 resize-y leading-7`}
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {text.length.toLocaleString()} characters ·{" "}
              {wordsFrom(text).length.toLocaleString()} words
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                className={labelClass}
                htmlFor="case-converter-output"
              >
                Converted result
              </label>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                {selected.label}
              </span>
            </div>

            <textarea
              id="case-converter-output"
              readOnly
              value={result}
              rows={11}
              className={`${inputClass} min-h-64 resize-y bg-slate-50 leading-7 dark:bg-slate-950`}
            />

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={copyResult}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied result" : "Copy result"}
              </button>

              <button
                type="button"
                onClick={downloadResult}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download size={16} />
                Download .txt
              </button>

              <button
                type="button"
                onClick={() => {
                  setText(result);
                  setCopied(false);
                }}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ArrowRightLeft size={16} />
                Use result as input
              </button>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Title and sentence casing use general rules and may not match every
          language&apos;s editorial conventions. Identifier formats (camelCase,
          snake_case, etc.) remove punctuation and normalize separators by
          design.
        </p>
      </section>
    </div>
  );
}
