import { getToolMetadata } from "@/lib/seo";
import BackgroundRemoverTool from "@/components/tools/background-remover-tool";

export const metadata = getToolMetadata("background-remover");

export default function BackgroundRemoverPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Image &amp; Design Tools · Tool 21</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Background Remover</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Remove the background from a photo and download a transparent PNG. The image is processed in your browser; model files may need to download the first time.</p>
      </div>
      <BackgroundRemoverTool />
    </div>
  );
}
