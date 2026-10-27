import { getToolMetadata } from "@/lib/seo";
import MacAddressVendorLookupTool from "@/components/tools/mac-address-vendor-lookup-tool";

export const metadata = getToolMetadata("mac-address-vendor-lookup");

export default function MacAddressVendorLookupPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Network &amp; IP Tools</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">MAC Address Vendor Lookup</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Find the manufacturer associated with a MAC address using its registered OUI/vendor prefix.</p>
      </div>
      <MacAddressVendorLookupTool />
    </main>
  );
}
