import { getToolMetadata } from "@/lib/seo";
import VideoTrimClipsClient from "@/components/tools/video-trim-clips-client";

export const metadata = getToolMetadata("video-trimmer");

export default function VideoTrimmerPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Video &amp; Audio Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Video Trimmer</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Trim a video by choosing the exact start and end times, preview it, and export the selected segment. Files are processed locally in your browser.</p>
      </div>
      <VideoTrimClipsClient mode="trim" />
    </main>
  );
}
