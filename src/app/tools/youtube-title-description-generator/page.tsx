import { getToolMetadata } from "@/lib/seo";
import YoutubeTitleDescriptionGeneratorTool from "@/components/tools/youtube-title-description-generator-tool";

export const metadata = getToolMetadata("youtube-title-description-generator");

export default function YoutubeTitleDescriptionGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">YouTube &amp; Content Creator Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">YouTube Title / Description Generator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Create customizable title ideas and a description draft, then review it before publishing.
        </p>
      </div>
      <YoutubeTitleDescriptionGeneratorTool />
    </main>
  );
}
