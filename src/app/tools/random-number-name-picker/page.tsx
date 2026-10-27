import { getToolMetadata } from "@/lib/seo";
import RandomNumberNamePickerTool from "@/components/tools/random-number-name-picker-tool";

export const metadata = getToolMetadata("random-number-name-picker");

export default function RandomNumberNamePickerPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Calculators &amp; Daily Utilities · Milestone 69</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Random Number / Name Picker</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Choose random numbers from a range or randomly select names from your list. Results are generated locally in your browser.</p>
    </div>
    <RandomNumberNamePickerTool />
  </div>;
}
