import { getToolMetadata } from "@/lib/seo";
import PdfToImageTool from "@/components/tools/pdf-to-image-tool";

export const metadata = getToolMetadata("pdf-to-image");

export default function PdfToImagePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">PDF Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">PDF to JPG Converter</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Render each PDF page as a JPG image and download pages individually. Processing happens locally in your browser; your PDF is not uploaded to our server.</p>
      </div>
      <PdfToImageTool />
    </div>
  );
}
