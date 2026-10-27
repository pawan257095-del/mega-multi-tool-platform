import { getToolMetadata } from "@/lib/seo";
import CssBoxShadowGeneratorTool from "@/components/tools/css-box-shadow-generator-tool";

export const metadata = getToolMetadata("css-box-shadow-generator");
export default function CssBoxShadowGeneratorPage() { return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-violet-600 dark:text-violet-400">UI/UX &amp; Web Design Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">CSS Box Shadow / Border Radius Generator</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Tune shadow offsets, blur, spread, opacity, inset and rounded corners with a live preview.</p></div><CssBoxShadowGeneratorTool /></main>; }
