import { getToolMetadata } from "@/lib/seo";
import PdfTextExtractorTool from "@/components/tools/pdf-text-extractor-tool";

export const metadata = getToolMetadata("pdf-text-extractor");

export default function PdfTextExtractorPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">PDF Tools · Reference Inventory</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">PDF Text Extractor</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Extract selectable text from a PDF into a plain-text result you can copy or download. Your file is processed locally in your browser.</p>
      </div>
      <PdfTextExtractorTool />
    </div>
  );
}
