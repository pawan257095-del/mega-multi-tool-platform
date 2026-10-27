import { getToolMetadata } from "@/lib/seo";
import ExcelToPdfTool from "@/components/tools/excel-to-pdf-tool";

export const metadata = getToolMetadata("excel-to-pdf");

export default function ExcelToPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">PDF Tools · Tool 14</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Excel to PDF</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Export an Excel worksheet to PDF in your browser. Choose a sheet and page orientation; data is laid out as a simple table and is not uploaded to a server.</p>
      </div>
      <ExcelToPdfTool />
    </div>
  );
}
