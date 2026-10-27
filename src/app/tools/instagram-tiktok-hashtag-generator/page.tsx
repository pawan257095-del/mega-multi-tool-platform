import { getToolMetadata } from "@/lib/seo";
import InstagramTikTokHashtagGeneratorTool from "@/components/tools/instagram-tiktok-hashtag-generator-tool";

export const metadata = getToolMetadata("instagram-tiktok-hashtag-generator");

export default function InstagramTikTokHashtagGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">YouTube &amp; Content Creator Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Instagram / TikTok Hashtag Generator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Build a reusable hashtag set for your topic, then copy or download it for your social post.
        </p>
      </div>
      <InstagramTikTokHashtagGeneratorTool />
    </main>
  );
}
