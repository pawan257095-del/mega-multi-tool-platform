import { getToolMetadata } from "@/lib/seo";
import LoveCalculatorTool from "@/components/tools/love-calculator-tool";

export const metadata = getToolMetadata("love-calculator");

export default function LoveCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Fun, Gaming &amp; Social Generators</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Love Calculator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          A light-hearted name game for entertainment, not a real measure of compatibility.
        </p>
      </div>
      <LoveCalculatorTool />
    </main>
  );
}
