import { getToolMetadata } from "@/lib/seo";
import VideoCompressorTool from "@/components/tools/video-compressor-tool";

export const metadata = getToolMetadata("video-compressor");

export default function VideoCompressorPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Video &amp; Audio Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Video Compressor</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Reduce MP4 file size by adjusting resolution and video quality. Processing happens in your browser; your video is not uploaded to this app&apos;s server.</p>
      </div>
      <VideoCompressorTool />
    </main>
  );
}
