import { getToolMetadata } from "@/lib/seo";
import ImageCropperTool from "@/components/tools/image-cropper-tool";

export const metadata = getToolMetadata("image-cropper");

export default function ImageCropperPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pink-600 dark:text-pink-400">Image &amp; Design Tools · Tool 19</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Image Cropper</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Crop JPG, PNG, and WebP images using pixel controls and common aspect-ratio presets. Processing happens locally in your browser.</p>
      </div>
      <ImageCropperTool />
    </div>
  );
}
