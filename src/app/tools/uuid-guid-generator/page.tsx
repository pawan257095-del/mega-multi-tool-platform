import { getToolMetadata } from "@/lib/seo";
import UUIDGUIDGeneratorTool from "@/components/tools/uuid-guid-generator-tool";

export const metadata = getToolMetadata("uuid-guid-generator");

export default function UUIDGUIDGeneratorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Developer &amp; Coding Tools · Milestone 56</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">UUID / GUID Generator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Generate random UUID version 4 identifiers for testing, development, records, and application data. Generation uses your browser&apos;s cryptographic random source.</p>
    </div>
    <UUIDGUIDGeneratorTool />
  </div>;
}
