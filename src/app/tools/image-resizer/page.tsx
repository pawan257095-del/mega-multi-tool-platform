import { getToolMetadata } from "@/lib/seo";
import ImageResizerTool from "@/components/tools/image-resizer-tool";

export const metadata = getToolMetadata("image-resizer");

export default function ImageResizerPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600 dark:text-pink-400">Image &amp; Design Tools · Tool 18</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Image Resizer</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Resize images by pixel dimensions, preserve the original aspect ratio when desired, and download the result. Processing happens locally in your browser.</p>
      </div>
      <ImageResizerTool />
    </div>
  );
}
