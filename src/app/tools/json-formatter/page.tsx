import { getToolMetadata } from "@/lib/seo";
import JsonFormatterTool from "@/components/tools/json-formatter-tool";

export const metadata = getToolMetadata("json-formatter");

export default function JsonFormatterPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Developer &amp; Coding Tools · Milestone 49</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">JSON Formatter &amp; Validator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Validate JSON, format it with readable indentation, or minify it for compact transfer. Your data is processed locally in this browser.</p>
    </div>
    <JsonFormatterTool />
  </div>;
}
