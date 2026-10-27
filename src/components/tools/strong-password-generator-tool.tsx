
"use client";

import { useMemo, useState } from "react";
import {
  Clipboard,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from "lucide-react";

type Options = {
  lower: boolean;
  upper: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

type PasswordItem = { id: number; value: string };

const CHARSETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/",
};

const AMBIGUOUS = new Set([
  "l",
  "I",
  "O",
  "0",
  "1",
  "|",
  "`",
  "'",
  '"',
]);

function secureIndex(max: number): number {
  if (!Number.isSafeInteger(max) || max < 1 || max > 256) {
    throw new Error("Unsupported character pool size.");
  }

  const limit = Math.floor(256 / max) * max;
  const byte = new Uint8Array(1);
  let value = 0;

  do {
    crypto.getRandomValues(byte);
    value = byte[0];
  } while (value >= limit);

  return value % max;
}

function secureShuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function makePassword(length: number, options: Options): string {
  let groups = [
    options.lower ? CHARSETS.lower : "",
    options.upper ? CHARSETS.upper : "",
    options.numbers ? CHARSETS.numbers : "",
    options.symbols ? CHARSETS.symbols : "",
  ].filter(Boolean);

  if (options.excludeAmbiguous) {
    groups = groups
      .map((group) =>
        [...group].filter((char) => !AMBIGUOUS.has(char)).join(""),
      )
      .filter(Boolean);
  }

  if (groups.length === 0) {
    throw new Error("Choose at least one character set.");
  }

  if (length < groups.length) {
    throw new Error(
      `Choose a length of at least ${groups.length} to include every selected character set.`,
    );
  }

  const pool = [...new Set(groups.join(""))];
  const chars = groups.map((group) => group[secureIndex(group.length)]);

  while (chars.length < length) {
    chars.push(pool[secureIndex(pool.length)]);
  }

  return secureShuffle(chars).join("");
}

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";

export default function StrongPasswordGeneratorTool() {
  const [length, setLength] = useState(20);
  const [count, setCount] = useState(5);
  const [options, setOptions] = useState<Options>({
    lower: true,
    upper: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
  });
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [visible, setVisible] = useState(true);
  const [notice, setNotice] = useState("");
  const [nextId, setNextId] = useState(1);

  const characterPoolSize = useMemo(() => {
    const groups = [
      options.lower ? CHARSETS.lower : "",
      options.upper ? CHARSETS.upper : "",
      options.numbers ? CHARSETS.numbers : "",
      options.symbols ? CHARSETS.symbols : "",
    ];

    const chars = [...new Set(groups.join(""))].filter(
      (char) => !options.excludeAmbiguous || !AMBIGUOUS.has(char),
    );

    return chars.length;
  }, [options]);

  const estimatedBits = length * Math.log2(Math.max(1, characterPoolSize));

  function generate() {
    try {
      if (!Number.isInteger(length) || length < 4 || length > 128) {
        throw new Error(
          "Password length must be between 4 and 128 characters.",
        );
      }

      if (!Number.isInteger(count) || count < 1 || count > 20) {
        throw new Error("Generate between 1 and 20 passwords at a time.");
      }

      if (
        !options.lower &&
        !options.upper &&
        !options.numbers &&
        !options.symbols
      ) {
        throw new Error("Select at least one character set.");
      }

      const result = Array.from({ length: count }, (_, index) => ({
        id: nextId + index,
        value: makePassword(length, options),
      }));

      setPasswords(result);
      setNextId(nextId + count);
      setNotice(
        `${count} password${count === 1 ? "" : "s"} generated using your browser&apos;s cryptographic random source.`,
      );
    } catch (error) {
      setPasswords([]);
      setNotice(
        error instanceof Error
          ? error.message
          : "Could not generate passwords in this browser.",
      );
    }
  }

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied to clipboard.`);
    } catch {
      setNotice(
        "Clipboard access was blocked. Select and copy the password manually.",
      );
    }
  }

  function download() {
    if (!passwords.length) return;

    const blob = new Blob(
      [passwords.map((item) => item.value).join("\n") + "\n"],
      { type: "text/plain;charset=utf-8" },
    );

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "generated-passwords.txt";
    anchor.click();

    URL.revokeObjectURL(url);

    setNotice(
      "Password list download started. Store the file securely and delete it when no longer needed.",
    );
  }

  function updateOption(key: keyof Options, checked: boolean) {
    setOptions((current) => ({ ...current, [key]: checked }));
    setPasswords([]);
    setNotice("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Password settings
          </h2>
          <ShieldCheck size={21} className="text-violet-600" />
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Choose the length and character groups you need. Generated passwords
          stay in this page&apos;s memory unless you copy or download them.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Length:{" "}
            <span className="font-bold tabular-nums">{length}</span>
            <input
              aria-label="Password length"
              className="mt-3 w-full accent-violet-600"
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(event) => {
                setLength(Number(event.target.value));
                setPasswords([]);
                setNotice("");
              }}
            />
            <span className="mt-1 flex justify-between text-xs text-slate-500">
              <span>4 chars</span>
              <span>128 chars</span>
            </span>
          </label>

          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Number of passwords
            <input
              aria-label="Number of passwords"
              className={fieldClass}
              type="number"
              min={1}
              max={20}
              step={1}
              value={count}
              onChange={(event) => {
                setCount(Number(event.target.value));
                setNotice("");
              }}
            />
          </label>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-slate-900 dark:text-white">
            Include characters
          </legend>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                { key: "lower", label: "Lowercase letters (a–z)" },
                { key: "upper", label: "Uppercase letters (A–Z)" },
                { key: "numbers", label: "Numbers (0–9)" },
                { key: "symbols", label: "Symbols (!@#$…)" },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={options[item.key]}
                  onChange={(event) =>
                    updateOption(item.key, event.target.checked)
                  }
                  className="h-4 w-4 accent-violet-600"
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 flex items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={options.excludeAmbiguous}
            onChange={(event) =>
              updateOption("excludeAmbiguous", event.target.checked)
            }
            className="mt-0.5 h-4 w-4 accent-violet-600"
          />
          <span>
            <span className="block font-medium">
              Exclude ambiguous characters
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              Avoid characters that can be mistaken for one another, such as O
              and 0.
            </span>
          </span>
        </label>

        <div className="mt-5 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/30">
          <p className="text-xs font-medium text-violet-800 dark:text-violet-300">
            Approximate entropy estimate
          </p>
          <p className="mt-1 text-2xl font-bold text-violet-950 dark:text-violet-100">
            {Math.round(estimatedBits)} bits
          </p>
          <p className="mt-1 text-xs leading-5 text-violet-800 dark:text-violet-300">
            Upper-bound estimate based on length and selected pool size; actual
            entropy can differ because selected character groups are guaranteed.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={generate}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <RefreshCw size={15} /> Generate passwords
          </button>

          <button
            type="button"
            onClick={() => {
              setPasswords([]);
              setNotice("");
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
          >
            <Trash2 size={15} /> Clear results
          </button>
        </div>

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300"
          >
            {notice}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Generated passwords
          </h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVisible((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              {visible ? "Hide" : "Show"}
            </button>

            <button
              type="button"
              disabled={!passwords.length}
              onClick={() =>
                void copyText(
                  passwords.map((item) => item.value).join("\n"),
                  "All passwords",
                )
              }
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              <Clipboard size={14} /> Copy all
            </button>

            <button
              type="button"
              disabled={!passwords.length}
              onClick={download}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
            >
              <Download size={14} /> TXT
            </button>
          </div>
        </div>

        {!passwords.length ? (
          <div className="mt-5 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50">
            <div>
              <ShieldCheck size={30} className="mx-auto text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                Your generated passwords will appear here.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Choose settings and select Generate passwords.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {passwords.map((item, index) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-xs font-medium text-slate-500">
                      Password {index + 1} · {item.value.length} characters
                    </p>
                    <code className="block break-all font-mono text-sm leading-6 text-slate-900 dark:text-slate-100">
                      {visible
                        ? item.value
                        : "•".repeat(item.value.length)}
                    </code>
                  </div>

                  <button
                    type="button"
                    aria-label={`Copy password ${index + 1}`}
                    onClick={() =>
                      void copyText(item.value, `Password ${index + 1}`)
                    }
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    <Clipboard size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <p className="font-semibold">Keep your passwords private</p>
          <p className="mt-1 text-xs">
            Use a password manager to store them. Don&apos;t reuse passwords
            across services. Avoid sharing or saving them in an unprotected
            text file. This tool never uploads them, but clipboard history,
            screenshots, extensions, or downloads may expose them.
          </p>
        </div>
      </section>
    </div>
  );
}
