import { getToolMetadata } from "@/lib/seo";
import TemperatureConverterTool from "@/components/tools/temperature-converter-tool";

export const metadata = getToolMetadata("temperature-converter");
export default function TemperatureConverterPage() { return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Unit &amp; Measurement Converters</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Temperature Converter</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Convert Celsius, Fahrenheit, Kelvin and Rankine instantly, entirely in your browser.</p></div><TemperatureConverterTool /></main>; }
