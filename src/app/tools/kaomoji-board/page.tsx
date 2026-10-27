import { getToolMetadata } from "@/lib/seo";
import KaomojiBoardTool from "@/components/tools/kaomoji-board-tool";

export const metadata = getToolMetadata("kaomoji-board");

export default function KaomojiBoardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Fun, Gaming &amp; Social Generators</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Kaomoji Board</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Browse Japanese-style text faces for happy, cute, loving, sad, and playful moods.
        </p>
      </div>
      <KaomojiBoardTool />
    </main>
  );
}
