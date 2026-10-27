import { getToolMetadata } from "@/lib/seo";
import AgeCalculatorTool from "@/components/tools/age-calculator-tool";

export const metadata = getToolMetadata("age-calculator");

export default function AgeCalculatorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Calculators &amp; Daily Utilities · Milestone 64</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Age Calculator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Calculate age in calendar years, months and days, total days lived, and the next birthday countdown.</p>
    </div>
    <AgeCalculatorTool />
  </div>;
}
