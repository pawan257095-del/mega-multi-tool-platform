import { getToolMetadata } from "@/lib/seo";
import HtpasswdGeneratorTool from "@/components/tools/htpasswd-generator-tool";

export const metadata = getToolMetadata("htpasswd-generator");

export default function HtpasswdGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Security &amp; Privacy Tools</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Htpasswd Generator</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">Generate a password-file entry for Apache Basic Authentication. Live hashing is performed by a server-side route, not by exposing credentials in a URL.</p>
      </div>
      <HtpasswdGeneratorTool />
    </main>
  );
}
