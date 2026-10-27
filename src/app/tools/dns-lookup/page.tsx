import { getToolMetadata } from "@/lib/seo";
import DnsLookupTool from "@/components/tools/dns-lookup-tool";

export const metadata = getToolMetadata("dns-lookup");

export default function DnsLookupPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Network &amp; IP Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">DNS Lookup</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Query public DNS records for a domain using DNS-over-HTTPS. Review address records, mail servers, nameservers, text records and other common record types.</p>
      </div>
      <DnsLookupTool />
    </main>
  );
}
