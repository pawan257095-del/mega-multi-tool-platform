import { getToolMetadata } from "@/lib/seo";
import PowerPointToPdfTool from "@/components/tools/powerpoint-to-pdf-tool";

export const metadata = getToolMetadata("powerpoint-to-pdf");

export default function PowerPointToPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">PDF Tools · Tool 16</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">PowerPoint to PDF</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Create a readable PDF from text extracted from a PowerPoint presentation. Processing happens locally in your browser; slide visuals and exact formatting are not retained.</p>
      </div>
      <PowerPointToPdfTool />
    </div>
  );
}
