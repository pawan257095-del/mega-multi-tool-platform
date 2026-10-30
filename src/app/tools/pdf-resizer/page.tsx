
import { getToolMetadata } from "@/lib/seo";
import PdfResizerTool from "@/components/tools/pdf-resizer-tool";

export const metadata = getToolMetadata("pdf-resizer");

export default function PdfResizerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">
          PDF Tools · Advanced
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
          Resize PDF Pages
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
          Resize PDF pages to standard paper sizes or custom dimensions.
          Adjust page orientation, margins, content scaling, and individual
          page ranges directly in your browser.
        </p>
      </div>

      <PdfResizerTool />
    </div>
  );
}
