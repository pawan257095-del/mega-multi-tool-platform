import { getToolMetadata } from "@/lib/seo";
import CompressPdfTool from "@/components/tools/compress-pdf-tool";

export const metadata = getToolMetadata("compress-pdf");

export default function CompressPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">PDF Tools · Tool 5</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Compress PDF Files</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Reduce PDF size using image quality and resolution presets. Processing happens locally in your browser, with a clear warning about text and form features that rasterization does not preserve.</p>
      </div>
      <CompressPdfTool />
    </div>
  );
}
