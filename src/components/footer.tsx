import Link from "next/link";
import { Box, Heart } from "lucide-react";

export default function Footer() {
  return <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70"><div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><Link href="/" className="inline-flex items-center gap-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 to-blue-700 text-white shadow-sm"><Box size={17}/></span><span className="font-extrabold tracking-tight text-slate-900 dark:text-white">Toolbox<span className="text-blue-600">.</span></span></Link><p className="text-xs text-slate-500 dark:text-slate-400">Free tools for everyday digital work.</p><p className="inline-flex items-center gap-1 text-xs text-slate-400">Made for productivity <Heart size={12} className="fill-rose-400 text-rose-400"/> · © {new Date().getFullYear()} Toolbox</p></div></footer>;
}
