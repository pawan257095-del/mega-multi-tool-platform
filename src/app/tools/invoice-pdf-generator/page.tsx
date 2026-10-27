import { getToolMetadata } from "@/lib/seo";
import InvoicePdfGeneratorTool from "@/components/tools/invoice-pdf-generator-tool";

export const metadata = getToolMetadata("invoice-pdf-generator");
export default function InvoicePdfGeneratorPage() { return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Financial &amp; Business Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Invoice PDF Generator</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Create an invoice with seller and customer details, line items, tax, discount, and a downloadable PDF. All invoice data stays in your browser.</p></div><InvoicePdfGeneratorTool /></main>; }
