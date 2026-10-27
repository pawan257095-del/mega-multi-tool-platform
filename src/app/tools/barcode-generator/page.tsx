import { getToolMetadata } from "@/lib/seo";
import BarcodeGeneratorTool from "@/components/tools/barcode-generator-tool";

export const metadata = getToolMetadata("barcode-generator");

export default function PercentageDifferenceCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education & Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Barcode Generator</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Compare two values or calculate percentage change from an initial value, with clear formulas and zero-denominator handling.
        </p>
      </div>
      <BarcodeGeneratorTool />
    </main>
  );
}
