import { getToolMetadata } from "@/lib/seo";
import WordUnscramblerAnagramSolverTool from "@/components/tools/word-unscrambler-anagram-solver-tool";

export const metadata = getToolMetadata("word-unscrambler-anagram-solver");

export default function WordUnscramblerAnagramSolverPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education & Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Word Unscrambler / Anagram Solver</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Rearrange scrambled letters into possible words, search exact anagrams, and filter suggestions by word length.
        </p>
      </div>
      <WordUnscramblerAnagramSolverTool />
    </main>
  );
}
