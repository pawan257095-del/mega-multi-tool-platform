"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Download, RotateCcw, RefreshCw } from "lucide-react";

type Mode = "paragraphs" | "sentences" | "words";
const WORDS = ("lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum praesent commodo cursus magna vel scelerisque nisl consectetur et fusce dapibus tellus ac cursus commodo mauris condimentum nibh ut fermentum massa justo sit amet risus etiam porta sem malesuada magna mollis euismod donec sed odio dui").split(" ");

function makeSentence(minWords: number, maxWords: number): string {
  const count = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const parts = Array.from({ length: count }, () => WORDS[Math.floor(Math.random() * WORDS.length)]);
  parts[0] = parts[0][0].toUpperCase() + parts[0].slice(1);
  return `${parts.join(" ")}.`;
}
function generate(mode: Mode, amount: number, sentencesPerParagraph: number, wordsPerSentence: number, startClassic: boolean): string {
  if (mode === "words") {
    const words = Array.from({ length: amount }, (_, i) => WORDS[i % WORDS.length]);
    if (startClassic && words.length) words[0] = "Lorem";
    return words.join(" ") + (words.length ? "." : "");
  }
  if (mode === "sentences") return Array.from({ length: amount }, (_, i) => startClassic && i === 0 ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit." : makeSentence(wordsPerSentence, wordsPerSentence + 7)).join(" ");
  return Array.from({ length: amount }, (_, i) => {
    const sentenceCount = sentencesPerParagraph;
    const sentences = Array.from({ length: sentenceCount }, (_, j) => startClassic && i === 0 && j === 0 ? "Lorem ipsum dolor sit amet, consectetur adipiscing elit." : makeSentence(wordsPerSentence, wordsPerSentence + 7));
    return sentences.join(" ");
  }).join("\n\n");
}

export default function LoremIpsumGeneratorTool() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [amount, setAmount] = useState(3);
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(4);
  const [wordsPerSentence, setWordsPerSentence] = useState(8);
  const [startClassic, setStartClassic] = useState(true);
  const [generated, setGenerated] = useState(() => generate("paragraphs", 3, 4, 8, true));
  const [copied, setCopied] = useState(false);
  const stats = useMemo(() => ({ words: generated.trim() ? generated.trim().split(/\s+/).length : 0, chars: generated.length, paragraphs: generated.trim() ? generated.trim().split(/\n\s*\n/).length : 0 }), [generated]);
  const createText = () => { setGenerated(generate(mode, amount, sentencesPerParagraph, wordsPerSentence, startClassic)); setCopied(false); };
  const copy = async () => { try { await navigator.clipboard.writeText(generated); setCopied(true); } catch { setCopied(false); } };
  const download = () => { const url = URL.createObjectURL(new Blob([generated], { type: "text/plain;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "lorem-ipsum.txt"; a.click(); URL.revokeObjectURL(url); };
  const reset = () => { setMode("paragraphs"); setAmount(3); setSentencesPerParagraph(4); setWordsPerSentence(8); setStartClassic(true); setGenerated(generate("paragraphs", 3, 4, 8, true)); setCopied(false); };
  const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950";
  return <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="font-semibold text-slate-900 dark:text-white">Generation settings</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose the output type and amount, then generate your placeholder text.</p>
      <div className="mt-5 space-y-4">
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Generate by</span><select className={field} value={mode} onChange={(e) => { const v = e.target.value as Mode; setMode(v); setAmount(v === "paragraphs" ? 3 : v === "sentences" ? 8 : 100); }}><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></label>
        <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">{mode === "paragraphs" ? "Number of paragraphs" : mode === "sentences" ? "Number of sentences" : "Number of words"}: <strong>{amount}</strong></span><input className="w-full accent-indigo-600" type="range" min={1} max={mode === "words" ? 1000 : mode === "sentences" ? 100 : 30} value={amount} onChange={(e) => setAmount(Number(e.target.value))} /><div className="mt-1 flex justify-between text-xs text-slate-400"><span>1</span><span>{mode === "words" ? "1,000" : mode === "sentences" ? "100" : "30"}</span></div></label>
        {mode === "paragraphs" && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Sentences per paragraph: <strong>{sentencesPerParagraph}</strong></span><input className="w-full accent-indigo-600" type="range" min={1} max={10} value={sentencesPerParagraph} onChange={(e) => setSentencesPerParagraph(Number(e.target.value))} /></label>}
        {mode !== "words" && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">Minimum words per sentence: <strong>{wordsPerSentence}</strong></span><input className="w-full accent-indigo-600" type="range" min={4} max={20} value={wordsPerSentence} onChange={(e) => setWordsPerSentence(Number(e.target.value))} /></label>}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"><input type="checkbox" checked={startClassic} onChange={(e) => setStartClassic(e.target.checked)} className="mt-1 h-4 w-4 accent-indigo-600" /><span><span className="block text-sm font-medium text-slate-800 dark:text-slate-100">Start with classic Lorem Ipsum</span><span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">Begin with the familiar “Lorem ipsum dolor sit amet…” sentence.</span></span></label>
        <button onClick={createText} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"><RefreshCw size={16} /> Generate text</button>
        <button onClick={reset} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15} /> Reset settings</button>
      </div>
      <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">Runs locally in your browser. Generated text is intended as placeholder copy for mockups and prototypes.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold text-slate-900 dark:text-white">Generated text</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit the generated result if you need to tweak it.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{stats.words.toLocaleString()} words</span></div>
      <textarea value={generated} onChange={(e) => { setGenerated(e.target.value); setCopied(false); }} aria-label="Generated Lorem Ipsum text" className="min-h-[380px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-800 outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={copy} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy text"}</button><button onClick={download} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16} /> Download .txt</button></div>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4 dark:border-slate-800"><div><p className="text-xs text-slate-500 dark:text-slate-400">Words</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stats.words.toLocaleString()}</p></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Characters</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stats.chars.toLocaleString()}</p></div><div><p className="text-xs text-slate-500 dark:text-slate-400">Paragraphs</p><p className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">{stats.paragraphs.toLocaleString()}</p></div></div>
    </section>
  </div>;
}
