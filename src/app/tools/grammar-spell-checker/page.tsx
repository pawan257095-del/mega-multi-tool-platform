import { getToolMetadata } from "@/lib/seo";
import GrammarSpellCheckerTool from "@/components/tools/grammar-spell-checker-tool";

export const metadata = getToolMetadata("grammar-spell-checker");

export default function GrammarSpellCheckerPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">AI & Trendy Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Grammar & Spell Checker</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Find common typos, repeated words, and simple punctuation or capitalization patterns. Review suggestions before using them.
        </p>
      </div>
      <GrammarSpellCheckerTool />
    </main>
  );
}
