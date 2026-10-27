import { getToolMetadata } from "@/lib/seo";
import XmlSitemapGeneratorTool from "@/components/tools/xml-sitemap-generator-tool";

export const metadata = getToolMetadata("xml-sitemap-generator");

export default function XmlSitemapGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">SEO &amp; Webmaster Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">XML Sitemap Generator</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Create a copy-ready XML sitemap for canonical, publicly accessible URLs on your website. Everything is generated locally in your browser.</p>
      </div>
      <XmlSitemapGeneratorTool />
    </main>
  );
}
