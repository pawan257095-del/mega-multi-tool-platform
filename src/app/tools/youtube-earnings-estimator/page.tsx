import { getToolMetadata } from "@/lib/seo";
import YoutubeEarningsEstimatorTool from "@/components/tools/youtube-earnings-estimator-tool";
export const metadata = getToolMetadata("youtube-earnings-estimator");
export default function YoutubeEarningsEstimatorPage(){ return <main className="mx-auto w-full max-w-4xl px-4 py-10"><div className="tool-page-hero mb-6"><p className="text-sm font-medium text-sky-600">YouTube &amp; Content Creator Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight">YouTube Earnings Estimator</h1><p className="mt-3 text-slate-600 dark:text-slate-300">Estimate potential ad revenue from views and RPM, or estimate views needed to reach a revenue target.</p></div><YoutubeEarningsEstimatorTool /></main>; }
