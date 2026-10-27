"use client";

import dynamic from "next/dynamic";

type Props = { mode: "trim" | "clips" };

// FFmpeg and browser media APIs are only needed after the user interacts.
// Keep this tool out of server-side prerendering to avoid worker/macro errors.
const VideoTrimClipsTool = dynamic(() => import("@/components/tools/video-trim-clips-tool"), {
  ssr: false,
  loading: () => (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300" aria-live="polite">
      Loading video tool…
    </section>
  ),
});

export default function VideoTrimClipsClient({ mode }: Props) {
  return <VideoTrimClipsTool mode={mode} />;
}
