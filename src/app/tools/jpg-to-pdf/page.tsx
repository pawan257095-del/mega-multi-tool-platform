import { getToolMetadata } from "@/lib/seo";
import JpgToPdfTool from "@/components/tools/jpg-to-pdf-tool";

export const metadata = getToolMetadata("jpg-to-pdf");

export default function JpgToPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">PDF Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">JPG to PDF Converter</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Combine JPG or PNG images into a PDF. Processing happens locally in your browser; images are not uploaded to our server.</p>
      </div>
      <JpgToPdfTool />
    </div>
  );
}
