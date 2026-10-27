import { getToolMetadata } from "@/lib/seo";
import TimeZoneConverterTool from "@/components/tools/time-zone-converter-tool";

export const metadata = getToolMetadata("time-zone-converter");

export default function TimeZoneConverterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Productivity &amp; Remote Work Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Time Zone Converter</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Convert a scheduled time between cities, including typical daylight-saving changes.
        </p>
      </div>
      <TimeZoneConverterTool />
    </main>
  );
}
