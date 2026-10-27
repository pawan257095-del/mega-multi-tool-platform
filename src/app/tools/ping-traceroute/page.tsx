import { getToolMetadata } from "@/lib/seo";
import PingTracerouteTool from "@/components/tools/ping-traceroute-tool";

export const metadata = getToolMetadata("ping-traceroute");

export default function PingTraceroutePage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Network &amp; IP Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Ping / Traceroute</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Run a browser-compatible HTTP reachability timing check and review the limitations of system-level ICMP ping and traceroute.</p>
      </div>
      <PingTracerouteTool />
    </main>
  );
}
