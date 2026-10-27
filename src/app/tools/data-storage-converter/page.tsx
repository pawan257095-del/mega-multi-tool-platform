import { getToolMetadata } from "@/lib/seo";
import DataStorageConverterTool from "@/components/tools/data-storage-converter-tool";

export const metadata = getToolMetadata("data-storage-converter");
export default function DataStorageConverterPage() { return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Unit &amp; Measurement Converters</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Data Storage Converter</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Convert bits, bytes, decimal units and binary units locally in your browser.</p></div><DataStorageConverterTool /></main>; }
