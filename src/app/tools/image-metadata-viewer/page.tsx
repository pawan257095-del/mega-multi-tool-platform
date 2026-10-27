import { getToolMetadata } from "@/lib/seo";
import ImageMetadataViewerTool from "@/components/tools/image-metadata-viewer-tool";

export const metadata = getToolMetadata("image-metadata-viewer");

export default function ImageMetadataViewerPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Image &amp; Design Tools · Tool 25</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Image Metadata Viewer</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Inspect image dimensions, format, file size, and common EXIF details without uploading the image.</p></div>
    <ImageMetadataViewerTool />
  </div>;
}
