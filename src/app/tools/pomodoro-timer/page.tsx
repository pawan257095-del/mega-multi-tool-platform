import { getToolMetadata } from "@/lib/seo";
import PomodoroTimerTool from "@/components/tools/pomodoro-timer-tool";

export const metadata = getToolMetadata("pomodoro-timer");

export default function TimeZoneConverterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Productivity &amp; Remote Work Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Convert a scheduled time between cities, including typical daylight-saving changes.
        </p>
      </div>
      <PomodoroTimerTool />
    </main>
  );
}
