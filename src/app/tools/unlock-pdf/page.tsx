import { getToolMetadata } from "@/lib/seo";
import UnlockPdfTool from "@/components/tools/unlock-pdf-tool";

export const metadata = getToolMetadata("unlock-pdf");

export default function UnlockPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">PDF Tools · Tool 8</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Unlock PDF</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Use the correct document password to create an unlocked copy in your browser. The current version rasterizes pages, so searchable text and interactive elements are not retained.</p>
      </div>
      <UnlockPdfTool />
    </div>
  );
}
