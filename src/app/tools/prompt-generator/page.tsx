import { getToolMetadata } from "@/lib/seo";
import PromptGeneratorTool from "@/components/tools/prompt-generator-tool";

export const metadata = getToolMetadata("prompt-generator");

export default function PromptGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">AI & Trendy Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Prompt Generator</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Turn a rough idea into a clear prompt with a role, goal, context, constraints, instructions, and expected output.
        </p>
      </div>
      <PromptGeneratorTool />
    </main>
  );
}
