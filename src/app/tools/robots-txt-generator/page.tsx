import { getToolMetadata } from "@/lib/seo";
import RobotsTxtGeneratorTool from "@/components/tools/robots-txt-generator-tool";

export const metadata = getToolMetadata("robots-txt-generator");

export default function RobotsTxtGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">SEO &amp; Webmaster Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">robots.txt Generator</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Build a copy-ready robots.txt file with common crawler directives. The file is generated locally in your browser.</p>
      </div>
      <RobotsTxtGeneratorTool />
    </main>
  );
}
