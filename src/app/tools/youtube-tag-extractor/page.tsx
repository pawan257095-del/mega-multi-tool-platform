import { getToolMetadata } from "@/lib/seo";
import YouTubeTagExtractorTool from "@/components/tools/youtube-tag-extractor-tool";

export const metadata = getToolMetadata("youtube-tag-extractor");

export default function YouTubeTagExtractorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">Social Media &amp; Marketing Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">YouTube Tag Extractor</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Extract available tag metadata from pasted source, clean a tag list, and copy the results for your workflow.</p>
      </div>
      <YouTubeTagExtractorTool />
    </main>
  );
}
