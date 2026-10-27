import { getToolMetadata } from "@/lib/seo";
import ProfessionalResumeBuilderTool from "@/components/tools/professional-resume-builder-tool";

export const metadata = getToolMetadata("professional-resume-builder");

export default function ProfessionalResumeBuilderPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="tool-page-hero mb-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-blue-600">Education &amp; Student Tools</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Professional Resume Builder</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Choose one of 20 professional templates, fill in a guided resume form, and export a downloadable PDF. Your information stays in your browser.</p>
      </div>
      <ProfessionalResumeBuilderTool />
    </main>
  );
}
