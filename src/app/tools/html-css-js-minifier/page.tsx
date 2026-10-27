import { getToolMetadata } from "@/lib/seo";
import HtmlCssJsMinifierTool from "@/components/tools/html-css-js-minifier-tool";

export const metadata = getToolMetadata("html-css-js-minifier");

export default function HtmlCssJsMinifierPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Developer &amp; Coding Tools · Milestone 51</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">HTML / CSS / JavaScript Minifier</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Remove unnecessary whitespace and comments to create a more compact code snippet. Processing stays in your browser.</p>
    </div>
    <HtmlCssJsMinifierTool />
  </div>;
}
