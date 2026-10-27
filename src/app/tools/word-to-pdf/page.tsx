import { getToolMetadata } from "@/lib/seo";
import WordToPdfTool from "@/components/tools/word-to-pdf-tool";

export const metadata = getToolMetadata("word-to-pdf");

export default function WordToPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">PDF Tools · Tool 10</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Word to PDF</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Create a PDF from the text in a DOCX document. Files are processed locally; complex formatting and embedded media are not preserved in this prototype.</p>
      </div>
      <WordToPdfTool />
    </div>
  );
}
