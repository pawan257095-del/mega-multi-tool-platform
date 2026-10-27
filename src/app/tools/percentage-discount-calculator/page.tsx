import { getToolMetadata } from "@/lib/seo";
import PercentageDiscountCalculatorTool from "@/components/tools/percentage-discount-calculator-tool";

export const metadata = getToolMetadata("percentage-discount-calculator");

export default function PercentageDiscountCalculatorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Calculators &amp; Daily Utilities · Milestone 67</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Percentage / Discount Calculator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Calculate a percentage of a value, compare values, measure percentage change, or work out a discount and final sale price.</p>
    </div>
    <PercentageDiscountCalculatorTool />
  </div>;
}
