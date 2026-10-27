import { getToolMetadata } from "@/lib/seo";
import ZodiacCalculatorTool from "@/components/tools/zodiac-calculator-tool";

export const metadata = getToolMetadata("zodiac-calculator");

export default function ZodiacCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Fun, Gaming &amp; Social Generators</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Zodiac Calculator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Find the commonly used Western zodiac sign associated with your birth date.
        </p>
      </div>
      <ZodiacCalculatorTool />
    </main>
  );
}
