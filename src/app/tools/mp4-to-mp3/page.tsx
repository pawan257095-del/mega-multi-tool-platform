import { getToolMetadata } from "@/lib/seo";
import Mp4ToMp3Tool from "@/components/tools/mp4-to-mp3-tool";

export const metadata = getToolMetadata("mp4-to-mp3");

export default function Mp4ToMp3Page() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8 max-w-3xl">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Video &amp; Audio Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">MP4 to MP3 Converter</h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">Extract the audio track from an MP4 video and save it as an MP3. Conversion runs in your browser using FFmpeg WebAssembly; the video is not uploaded to our server.</p>
      </div>
      <Mp4ToMp3Tool />
    </main>
  );
}
