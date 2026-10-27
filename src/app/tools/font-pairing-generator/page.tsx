import { getToolMetadata } from "@/lib/seo";
import FontPairingGeneratorTool from "@/components/tools/font-pairing-generator-tool";

export const metadata = getToolMetadata("font-pairing-generator");

export default function FontPairingGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">UI/UX &amp; Web Design Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Font Pairing Generator</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Discover heading and body font combinations, test your own sample text, and copy CSS for your project.</p>
      </div>
      <FontPairingGeneratorTool />
    </main>
  );
}
