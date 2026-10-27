import { getToolMetadata } from "@/lib/seo";
import TextComparisonPlagiarismHelperTool from "@/components/tools/text-comparison-plagiarism-helper-tool";

export const metadata = getToolMetadata("text-comparison-plagiarism-helper");

export default function TextComparisonPlagiarismHelperPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education & Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Text Comparison / Plagiarism Helper</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Compare two passages, inspect additions and removals, and identify exact shared phrases without uploading your text.
        </p>
      </div>
      <TextComparisonPlagiarismHelperTool />
    </main>
  );
}
