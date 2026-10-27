import { getToolMetadata } from "@/lib/seo";
import CssTextShadowGeneratorTool from "@/components/tools/css-text-shadow-generator-tool";

export const metadata = getToolMetadata("css-text-shadow-generator");

export default function CssTextShadowGeneratorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Image &amp; Design Tools · Tool 32</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">CSS Text Shadow Generator</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Tune text-shadow offsets, blur, color, and opacity, preview the result live, and copy ready-to-use CSS.</p></div>
    <CssTextShadowGeneratorTool />
  </div>;
}
