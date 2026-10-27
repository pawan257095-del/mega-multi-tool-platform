import { getToolMetadata } from "@/lib/seo";
import StrongPasswordGeneratorTool from "@/components/tools/strong-password-generator-tool";

export const metadata = getToolMetadata("strong-password-generator");

export default function StrongPasswordGeneratorPage() {
  return <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-7 sm:px-6 lg:px-8 lg:pt-10">
    <div className="tool-page-hero mb-7">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-600 dark:text-violet-400">Calculators &amp; Daily Utilities · Milestone 68</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Strong Password Generator</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">Generate random passwords with configurable length and character sets. Passwords are created in your browser and are not sent to a server.</p>
    </div>
    <StrongPasswordGeneratorTool />
  </div>;
}
