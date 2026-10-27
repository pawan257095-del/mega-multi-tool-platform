import { getToolMetadata } from "@/lib/seo";
import PdfToExcelTool from "@/components/tools/pdf-to-excel-tool";

export const metadata = getToolMetadata("pdf-to-excel");

export default function PdfToExcelPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">PDF Tools · Tool 13</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">PDF to Excel</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Extract selectable text from a PDF into an Excel workbook. Text placement is used to estimate rows and columns; scanned PDFs require OCR, which is not included in this version.</p>
      </div>
      <PdfToExcelTool />
    </div>
  );
}
