import Link from "next/link";
import { Command } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white"><Command size={15} aria-hidden="true" /></span>
          toolbox<span className="text-violet-600 dark:text-violet-400">.</span>
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400">Built to make everyday digital tasks simpler.</p>
        <p className="text-xs text-slate-400">© {new Date().getFullYear()} Toolbox · Starter version</p>
      </div>
    </footer>
  );
}
