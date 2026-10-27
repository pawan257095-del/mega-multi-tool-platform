import { getToolMetadata } from "@/lib/seo";
import SocialMediaCharacterCounterTool from "@/components/tools/social-media-character-counter-tool";

export const metadata = getToolMetadata("social-media-character-counter");

export default function SocialMediaCharacterCounterPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Social Media &amp; Marketing Tools</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Social Media Character Counter</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
          Draft a caption and see its character count, word count, hashtags, URLs, and remaining allowance for a selected platform or custom limit.
        </p>
      </div>
      <SocialMediaCharacterCounterTool />
    </main>
  );
}
