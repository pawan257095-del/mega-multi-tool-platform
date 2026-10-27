import { getToolMetadata } from "@/lib/seo";
import CgpaGpaCalculatorTool from "@/components/tools/cgpa-gpa-calculator-tool";

export const metadata = getToolMetadata("cgpa-gpa-calculator");

export default function CgpaGpaCalculatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education & Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">CGPA / GPA Calculator</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Calculate semester GPA with credit-weighted grade points, then optionally combine it with your previous CGPA and completed credits.
        </p>
      </div>
      <CgpaGpaCalculatorTool />
    </main>
  );
}
