import { getToolMetadata } from "@/lib/seo";
import WhoisLookupTool from "@/components/tools/whois-lookup-tool";

export const metadata = getToolMetadata("whois-lookup");

export default function WhoisLookupPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Network &amp; IP Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">WHOIS Lookup</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Check public domain registration data, including registrar, registration and expiration dates, domain status, and nameservers when the registry provides them.</p>
      </div>
      <WhoisLookupTool />
    </main>
  );
}
