import { getToolMetadata } from "@/lib/seo";
import ApaMlaCitationGeneratorTool from "@/components/tools/apa-mla-citation-generator-tool";

export const metadata = getToolMetadata("apa-mla-citation-generator");

export default function ApaMlaCitationGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education & Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">APA/MLA Citation Generator</h1>
        <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-400">
          Create a starting citation for a book, journal article, or web page. Select a style, enter source details, and copy the reference or in-text citation.
        </p>
      </div>
      <ApaMlaCitationGeneratorTool />
    </main>
  );
}
