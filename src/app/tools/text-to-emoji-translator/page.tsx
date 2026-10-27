import { getToolMetadata } from "@/lib/seo";
import TextToEmojiTranslatorTool from "@/components/tools/text-to-emoji-translator-tool";

export const metadata = getToolMetadata("text-to-emoji-translator");

export default function TextToEmojiTranslatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">AI & Trendy Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Text-to-Emoji Translator</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Make messages more expressive by adding emojis to common words and phrases. Adjust the density and tone to fit your message.
        </p>
      </div>
      <TextToEmojiTranslatorTool />
    </main>
  );
}
