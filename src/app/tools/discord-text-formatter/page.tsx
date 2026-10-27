import { getToolMetadata } from "@/lib/seo";
import DiscordTextFormatterTool from "@/components/tools/discord-text-formatter-tool";

export const metadata = getToolMetadata("discord-text-formatter");

export default function DiscordTextFormatterPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-medium text-sky-600">Fun, Gaming &amp; Social Generators</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Discord Text Formatter</h1>
        <p className="mt-3 text-slate-600 dark:text-slate-300">
          Prepare copy-ready Discord messages using familiar Markdown formatting.
        </p>
      </div>
      <DiscordTextFormatterTool />
    </main>
  );
}
