"use client";

import { useMemo, useState } from "react";

type Mode = "plain" | "bold" | "italic" | "boldItalic" | "underline" | "strike" | "spoiler" | "quote" | "code" | "codeblock" | "bullet" | "numbered";

const modes: { value: Mode; label: string; hint: string }[] = [
  { value: "plain", label: "Plain text", hint: "Remove Discord Markdown markers from the input." },
  { value: "bold", label: "Bold", hint: "Wrap text with **double asterisks**." },
  { value: "italic", label: "Italic", hint: "Wrap text with *single asterisks*." },
  { value: "boldItalic", label: "Bold + italic", hint: "Wrap text with ***triple asterisks***." },
  { value: "underline", label: "Underline", hint: "Wrap text with __double underscores__." },
  { value: "strike", label: "Strikethrough", hint: "Wrap text with ~~tildes~~." },
  { value: "spoiler", label: "Spoiler", hint: "Wrap text with ||double pipes||." },
  { value: "quote", label: "Quote", hint: "Prefix each line with > ." },
  { value: "code", label: "Inline code", hint: "Wrap text in backticks." },
  { value: "codeblock", label: "Code block", hint: "Wrap text in a fenced code block." },
  { value: "bullet", label: "Bullet list", hint: "Prefix non-empty lines with - ." },
  { value: "numbered", label: "Numbered list", hint: "Number each non-empty line." },
];

function formatText(input: string, mode: Mode, language: string): string {
  const text = input.trim();
  if (!text) return "";
  switch (mode) {
    case "plain":
      return text.replace(/(\*\*\*|___|\*\*|__|~~|\|\||\*|_|`|^>\s?)/gm, "");
    case "bold": return `**${text}**`;
    case "italic": return `*${text}*`;
    case "boldItalic": return `***${text}***`;
    case "underline": return `__${text}__`;
    case "strike": return `~~${text}~~`;
    case "spoiler": return `||${text}||`;
    case "quote": return text.split("\n").map((line) => line ? `> ${line}` : ">").join("\n");
    case "code": return "`" + text.replace(/`/g, "ˋ") + "`";
    case "codeblock": {
      const lang = language.trim().replace(/[^a-zA-Z0-9_+-]/g, "");
      const fence = String.fromCharCode(96, 96, 96);
      const safeText = text.split(fence).join("'''");
      return fence + lang + "\n" + safeText + "\n" + fence;
    }
    case "bullet": return text.split("\n").filter((line) => line.trim()).map((line) => `- ${line.trim()}`).join("\n");
    case "numbered": return text.split("\n").filter((line) => line.trim()).map((line, index) => `${index + 1}. ${line.trim()}`).join("\n");
  }
}

export default function DiscordTextFormatterTool() {
  const [input, setInput] = useState("Welcome to the server!\nPlease read the rules before chatting.");
  const [mode, setMode] = useState<Mode>("bold");
  const [language, setLanguage] = useState("js");
  const [copyStatus, setCopyStatus] = useState("");
  const output = useMemo(() => formatText(input, mode, language), [input, mode, language]);
  const charCount = output.length;

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopyStatus("Formatted text copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Select the output and copy it manually.");
    }
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "discord-formatted-text.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Discord Text Formatter</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Turn plain text into Discord-style Markdown. Formatting is represented by characters in the message; this tool does not connect to Discord or send messages.
        </p>
        <div className="mt-5">
          <label htmlFor="discord-input" className="mb-1 block text-sm font-medium">Your text</label>
          <textarea id="discord-input" value={input} onChange={(e) => setInput(e.target.value)} rows={7} maxLength={10000}
            placeholder="Type or paste your message..."
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          <div className="mt-1 text-right text-xs text-slate-500">{input.length.toLocaleString()} / 10,000 characters</div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="discord-mode" className="mb-1 block text-sm font-medium">Formatting</label>
            <select id="discord-mode" value={mode} onChange={(e) => setMode(e.target.value as Mode)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              {modes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{modes.find((item) => item.value === mode)?.hint}</p>
          </div>
          {mode === "codeblock" && <div>
            <label htmlFor="discord-language" className="mb-1 block text-sm font-medium">Code language (optional)</label>
            <input id="discord-language" value={language} onChange={(e) => setLanguage(e.target.value)} maxLength={24} placeholder="js, py, html..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-semibold">Formatted output</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{charCount.toLocaleString()} characters</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void copyOutput()} disabled={!output} className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:opacity-50">Copy output</button>
            <button type="button" onClick={downloadOutput} disabled={!output} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-slate-600">Download TXT</button>
          </div>
        </div>
        <textarea aria-label="Formatted output" readOnly value={output} rows={8}
          className="mt-4 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-sm dark:border-slate-600 dark:bg-slate-900" />
        {copyStatus && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="font-medium">Quick Markdown reference</p>
          <ul className="mt-2 grid gap-1 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
            <li><code>**bold**</code> — bold</li><li><code>*italic*</code> — italic</li>
            <li><code>~~strike~~</code> — strikethrough</li><li><code>||spoiler||</code> — spoiler</li>
            <li><code>`code`</code> — inline code</li><li><code>&gt; quote</code> — quote</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
