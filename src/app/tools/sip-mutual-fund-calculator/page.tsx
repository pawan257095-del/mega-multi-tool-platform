import { getToolMetadata } from "@/lib/seo";
import SipMutualFundCalculatorTool from "@/components/tools/sip-mutual-fund-calculator-tool";

export const metadata = getToolMetadata("sip-mutual-fund-calculator");
export default function SipMutualFundCalculatorPage() { return <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Financial &amp; Business Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SIP / Mutual Fund Calculator</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Estimate potential growth from recurring monthly investments, with optional annual SIP step-ups. Results are illustrative and returns are not guaranteed.</p></div><SipMutualFundCalculatorTool /></main>; }
