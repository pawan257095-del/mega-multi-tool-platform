import { getToolMetadata } from "@/lib/seo";
import AudioTrimmerTool from "@/components/tools/audio-trimmer-ringtone-maker-tool";

export const metadata = getToolMetadata("audio-trimmer-ringtone-maker");

export default function AudioTrimmerPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Video &amp; Audio Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Audio Trimmer / Ringtone Maker</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Select a section of an audio file, preview the trim, and export the clip as a WAV file. Audio is decoded and processed locally in your browser.</p>
      </div>
      <AudioTrimmerTool />
    </main>
  );
}
