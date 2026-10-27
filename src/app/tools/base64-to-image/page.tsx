import { getToolMetadata } from "@/lib/seo";
import Base64ToImageTool from "@/components/tools/base64-to-image-tool";

export const metadata = getToolMetadata("base64-to-image");

export default function Base64ToImagePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Image &amp; Design Tools · Tool 24</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Base64 to Image Converter</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Paste a Base64 string or image data URL, preview the decoded image, and download it. Processing stays in your browser.</p>
      </div>
      <Base64ToImageTool />
    </div>
  );
}
