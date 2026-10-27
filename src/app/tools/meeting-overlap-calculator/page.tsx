import { getToolMetadata } from "@/lib/seo";
import MeetingOverlapCalculatorTool from "@/components/tools/meeting-overlap-calculator-tool";

export const metadata = getToolMetadata("meeting-overlap-calculator");

export default function TimeZoneConverterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Productivity &amp; Remote Work Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Meeting Overlap Calculator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Convert a scheduled time between cities, including typical daylight-saving changes.
        </p>
      </div>
      <MeetingOverlapCalculatorTool />
    </main>
  );
}
