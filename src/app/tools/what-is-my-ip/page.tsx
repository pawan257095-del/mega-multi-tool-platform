import { getToolMetadata } from "@/lib/seo";
import WhatIsMyIpTool from "@/components/tools/what-is-my-ip-tool";

export const metadata = getToolMetadata("what-is-my-ip");

export default function WhatIsMyIpPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-400">Network &amp; IP Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">What Is My IP?</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Find the public IP address visible to an external IP lookup service. Location details are approximate and may reflect your VPN or internet provider.
        </p>
      </div>
      <WhatIsMyIpTool />
    </main>
  );
}
