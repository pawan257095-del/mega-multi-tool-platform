import { getToolMetadata } from "@/lib/seo";
import CpmCalculatorTool from "@/components/tools/cpm-calculator-tool";

export const metadata = getToolMetadata("cpm-calculator");

export default function CpmCalculatorPage() {
  return <main className="mx-auto w-full max-w-4xl px-4 py-10"><div className="tool-page-hero mb-6"><p className="text-sm font-medium text-sky-600">E-Commerce &amp; Dropshipping Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight">CPM Calculator</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Estimate advertising cost, impressions, or cost per thousand impressions from your campaign metrics.</p></div><CpmCalculatorTool /></main>;
}
