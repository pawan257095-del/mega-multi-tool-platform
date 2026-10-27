import { getToolMetadata } from "@/lib/seo";
import MD5SHA256HashGeneratorTool from "@/components/tools/md5-sha256-hash-generator-tool";

export const metadata = getToolMetadata("md5-sha256-hash-generator");

export default function MD5SHA256HashGeneratorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-400">Developer &amp; Coding Tools · Milestone 57</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">MD5 / SHA-256 Hash Generator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Generate hexadecimal hashes from text with MD5 or SHA-256. Processing happens in your browser; MD5 is provided only for legacy compatibility, not security.</p>
    </div>
    <MD5SHA256HashGeneratorTool />
  </div>;
}
