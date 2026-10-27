import { getToolMetadata } from "@/lib/seo";
import TextToSlugConverterTool from "@/components/tools/text-to-slug-converter-tool";

export const metadata = getToolMetadata("text-to-slug-converter");

export default function TextToSlugConverterPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Text &amp; Content Tools · Milestone 45</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Text to Slug Converter</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Turn titles and phrases into readable, URL-friendly slugs. Choose a separator, normalize accents, and preview the result instantly. Your text stays in this browser.</p>
      </div>
      <TextToSlugConverterTool />
    </div>
  );
}
