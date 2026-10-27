import { getToolMetadata } from "@/lib/seo";
import BmiCalculatorTool from "@/components/tools/bmi-calculator-tool";

export const metadata = getToolMetadata("bmi-calculator");

export default function BmiCalculatorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Calculators &amp; Daily Utilities · Milestone 66</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">BMI Calculator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Calculate body mass index from height and weight, switch between metric and imperial units, and view general adult BMI reference categories.</p>
    </div>
    <BmiCalculatorTool />
  </div>;
}
