import { getToolMetadata } from "@/lib/seo";
import GamertagGeneratorTool from "@/components/tools/gamertag-generator-tool";

export const metadata = getToolMetadata("gamertag-generator");

export default function GamertagGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Fun, Gaming &amp; Social Generators</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Gamertag Generator</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Create gaming username ideas with your own base word and preferred style.
        </p>
      </div>
      <GamertagGeneratorTool />
    </main>
  );
}
