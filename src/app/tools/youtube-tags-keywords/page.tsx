import { getToolMetadata } from "@/lib/seo";
import YoutubeTagsKeywordsTool from "@/components/tools/youtube-tags-keywords-tool";

export const metadata = getToolMetadata("youtube-tags-keywords");

export default function YoutubeTagsKeywordsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">YouTube &amp; Content Creator Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">YouTube Tags / Keywords</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Clean up tags you provide, identify duplicates, and compare keyword phrases with your video title.
        </p>
      </div>
      <YoutubeTagsKeywordsTool />
    </main>
  );
}
