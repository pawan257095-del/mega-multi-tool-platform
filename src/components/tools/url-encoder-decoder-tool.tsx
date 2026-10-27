"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, ArrowDownUp, RotateCcw, Trash2 } from "lucide-react";

type Mode = "component" | "uri";
type Action = "encode" | "decode";

const sample = "https://example.com/search?q=hello world&tag=web tools";

function convert(value: string, action: Action, mode: Mode): string {
  if (action === "encode") return mode === "component" ? encodeURIComponent(value) : encodeURI(value);
  return mode === "component" ? decodeURIComponent(value) : decodeURI(value);
}

export default function UrlEncoderDecoderTool() {
  const [input, setInput] = useState(sample);
  const [mode, setMode] = useState<Mode>("component");
  const [action, setAction] = useState<Action>("encode");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const preview = useMemo(() => {
    if (!input) return "";
    try { return convert(input, action, mode); } catch { return ""; }
  }, [input, action, mode]);

  function run(nextAction: Action = action) {
    setCopied(false);
    setError("");
    try {
      setOutput(convert(input, nextAction, mode));
      setAction(nextAction);
    } catch {
      setOutput("");
      setError("Could not decode this value. Check that every percent sign is followed by two valid hexadecimal digits and that the text uses the selected encoding mode.");
    }
  }

  async function copyOutput() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setError("Clipboard access was blocked by the browser. Select the output and copy it manually."); }
  }

  function downloadOutput() {
    if (!output) return;
    const url = URL.createObjectURL(new Blob([output], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = action === "encode" ? "url-encoded.txt" : "url-decoded.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Input</h2>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => { setInput(sample); setOutput(""); setError(""); }} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Load sample</button>
          <button type="button" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"><Trash2 size={13}/> Clear</button>
        </div>
      </div>
      <label htmlFor="url-mode" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Encoding mode</label>
      <select id="url-mode" value={mode} onChange={(e) => { setMode(e.target.value as Mode); setOutput(""); setError(""); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
        <option value="component">URL component — encodeURIComponent</option>
        <option value="uri">Full URI — encodeURI</option>
      </select>
      <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Component mode is best for query values and individual URL parts. Full URI mode preserves structural characters such as <code>:/?#[]@</code> and <code>&amp;=</code>.</p>
      <label htmlFor="url-input" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Text or URL</label>
      <textarea id="url-input" value={input} onChange={(e) => { setInput(e.target.value); setOutput(""); setError(""); }} rows={9} spellCheck={false} placeholder="Paste a URL or encoded string…" className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
      <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400"><span>{input.length.toLocaleString()} characters</span><span>Processed locally</span></div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => run("encode")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"><ArrowDownUp size={16}/> Encode</button>
        <button type="button" onClick={() => run("decode")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={16}/> Decode</button>
      </div>
      {preview && <p className="mt-4 break-all rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-500 dark:bg-slate-950 dark:text-slate-400"><span className="font-semibold">Preview:</span> {preview}</p>}
    </section>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Result</h2><span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-950 dark:text-violet-300">{output ? `${output.length.toLocaleString()} chars` : "Ready"}</span></div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{error}</p>}
      <textarea aria-label="Encoded or decoded result" value={output} onChange={(e) => setOutput(e.target.value)} rows={14} placeholder="Your encoded or decoded result will appear here…" spellCheck={false} className="mt-5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none focus:border-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!output} onClick={copyOutput} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy result"}</button>
        <button type="button" disabled={!output} onClick={downloadOutput} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={15}/> Download .txt</button>
        <button type="button" disabled={!output} onClick={() => { setInput(output); setOutput(""); setError(""); }} className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Use result as input</button>
      </div>
      <div className="mt-6 rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick guide</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300"><li>Use <code>encodeURIComponent</code> for query values or individual URL components.</li><li>Use <code>encodeURI</code> when encoding a complete URI and preserving its separators.</li><li>Decode using the same mode that was used to encode the value.</li></ul></div>
    </section>
  </div>;
}
