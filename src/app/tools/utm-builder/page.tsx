import { getToolMetadata } from "@/lib/seo";
import UTMBuilderTool from "@/components/tools/utm-builder-tool";

export const metadata = getToolMetadata("utm-builder");

export default function UTMBuilderPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Social Media &amp; Marketing Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">UTM Builder</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Create campaign tracking links for analytics using standard UTM parameters and optional custom query values.</p>
      </div>
      <UTMBuilderTool />
    </main>
  );
}
