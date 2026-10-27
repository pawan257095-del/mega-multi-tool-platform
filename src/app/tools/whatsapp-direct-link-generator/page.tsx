import { getToolMetadata } from "@/lib/seo";
import WhatsAppDirectLinkGeneratorTool from "@/components/tools/whatsapp-direct-link-generator-tool";

export const metadata = getToolMetadata("whatsapp-direct-link-generator");

export default function WhatsAppDirectLinkGeneratorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Social Media &amp; Marketing Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">WhatsApp Direct Link Generator</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Create a shareable WhatsApp chat link using an international phone number and an optional prefilled message.</p>
      </div>
      <WhatsAppDirectLinkGeneratorTool />
    </main>
  );
}
