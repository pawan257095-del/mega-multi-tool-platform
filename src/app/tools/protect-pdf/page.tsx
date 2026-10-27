import { getToolMetadata } from "@/lib/seo";
import ProtectPdfTool from "@/components/tools/protect-pdf-tool";

export const metadata = getToolMetadata("protect-pdf");

export default function ProtectPdfPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
      <div className="tool-page-hero mb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">PDF Tools · Tool 7</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Protect PDF with Password</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Encrypt a PDF with a password before sharing. Processing happens locally in your browser, and the original file remains unchanged.</p>
      </div>
      <ProtectPdfTool />
    </div>
  );
}
