import { getToolMetadata } from "@/lib/seo";
import PdfToPowerPointTool from "@/components/tools/pdf-to-powerpoint-tool";

export const metadata = getToolMetadata("pdf-to-powerpoint");

export default function PdfToPowerPointPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">PDF Tools · Tool 15</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">PDF to PowerPoint</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Create one editable PowerPoint slide per PDF page from selectable text. Files are processed locally in your browser; complex layouts and scanned pages may not convert accurately.</p>
      </div>
      <PdfToPowerPointTool />
    </div>
  );
}
