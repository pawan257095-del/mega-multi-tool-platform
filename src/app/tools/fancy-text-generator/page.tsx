import { getToolMetadata } from "@/lib/seo";
import FancyTextGeneratorTool from "@/components/tools/fancy-text-generator-tool";

export const metadata = getToolMetadata("fancy-text-generator");

export default function FancyTextGeneratorPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Text &amp; Content Tools · Milestone 47</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Fancy Text Generator</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Turn ordinary text into decorative Unicode styles for bios, captions, usernames, and messages. No custom font installation required.</p>
      </div>
      <FancyTextGeneratorTool />
    </div>
  );
}
