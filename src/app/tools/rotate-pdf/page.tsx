import { getToolMetadata } from "@/lib/seo";
import RotatePdfTool from "@/components/tools/rotate-pdf-tool";

export const metadata = getToolMetadata("rotate-pdf");

export default function RotatePdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">PDF Tools · Tool 6</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Rotate PDF Pages</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Rotate an entire PDF or choose specific pages and ranges. Download the updated document without uploading your file.</p>
      </div>
      <RotatePdfTool />
    </div>
  );
}
