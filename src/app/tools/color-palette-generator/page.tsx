import { getToolMetadata } from "@/lib/seo";
import ColorPaletteGeneratorTool from "@/components/tools/color-palette-generator-tool";

export const metadata = getToolMetadata("color-palette-generator");
export default function ColorPaletteGeneratorPage() { return <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8"><div className="tool-page-hero mb-6"><p className="text-sm font-semibold text-violet-600 dark:text-violet-400">UI/UX &amp; Web Design Tools</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Color Palette Generator</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">Create complementary, analogous, triadic or monochromatic color palettes from any HEX color.</p></div><ColorPaletteGeneratorTool /></main>; }
