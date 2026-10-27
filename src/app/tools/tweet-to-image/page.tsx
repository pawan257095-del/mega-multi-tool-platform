import { getToolMetadata } from "@/lib/seo";
import TweetToImageTool from "@/components/tools/tweet-to-image-tool";

export const metadata = getToolMetadata("tweet-to-image");

export default function TweetToImagePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-sky-600 dark:text-sky-400">Social Media &amp; Marketing Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Tweet-to-Image</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Design a shareable post card with editable profile details, color themes, and locally generated PNG export.</p>
      </div>
      <TweetToImageTool />
    </main>
  );
}
