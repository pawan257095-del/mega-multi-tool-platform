import { getToolMetadata } from "@/lib/seo";
import AiSummarizerTool from "@/components/tools/ai-summarizer-tool";

export const metadata = getToolMetadata("ai-summarizer");

export default function AiSummarizerPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">AI &amp; Trendy Tools</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">AI Summarizer</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Condense articles and notes into a shorter version. This initial version works locally by selecting key sentences, without an external AI API.</p>
      </div>
      <AiSummarizerTool />
    </main>
  );
}
