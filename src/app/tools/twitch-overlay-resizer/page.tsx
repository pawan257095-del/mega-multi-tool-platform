import { getToolMetadata } from "@/lib/seo";
import TwitchOverlayResizerTool from "@/components/tools/twitch-overlay-resizer-tool";

export const metadata = getToolMetadata("twitch-overlay-resizer");

export default function TwitchOverlayResizerPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">YouTube &amp; Content Creator Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Twitch Overlay Resizer</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Resize an overlay image to common streaming canvas sizes with contain, crop, or stretch options.
        </p>
      </div>
      <TwitchOverlayResizerTool />
    </main>
  );
}
