import { getToolMetadata } from "@/lib/seo";
import StopwatchCountdownTimerTool from "@/components/tools/stopwatch-countdown-timer-tool";

export const metadata = getToolMetadata("stopwatch-countdown-timer");

export default function StopwatchCountdownTimerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Calculators & Daily Utilities</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Stopwatch / Countdown Timer</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Track elapsed time with lap splits or set a countdown for focused work, workouts and everyday tasks. Everything runs in this browser tab.</p>
      </div>
      <StopwatchCountdownTimerTool />
    </main>
  );
}
