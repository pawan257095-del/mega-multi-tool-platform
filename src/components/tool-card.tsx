"use client";

import {
  ArrowUpRight, Search, Braces, CalendarDays, Timer, FileImage, FileSpreadsheet, FileText, Images, Layers, Palette, Pipette, ShieldCheck, Unlock, Square, MousePointerClick, Type, Move3D, SlidersHorizontal, Scan, Grid3X3, Film, ArrowLeftRight, Link2, Sparkles, Volume2, Code2, Percent, Globe2, Activity, Network,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Tool } from "@/data/tools";

const iconMap: Record<string, LucideIcon> = {
  "file-image": FileImage,
  "file-text": FileText,
  "file-spreadsheet": FileSpreadsheet,
  "calendar-days": CalendarDays,
  timer: Timer,
  braces: Braces,
  "code-2": Code2,
  images: Images,
  "shield-check": ShieldCheck,
  unlock: Unlock,
  palette: Palette,
  pipette: Pipette,
  layers: Layers,
  square: Square,
  "mouse-pointer-click": MousePointerClick,
  type: Type,
  "move-3d": Move3D,
  "sliders-horizontal": SlidersHorizontal,
  scan: Scan,
  "grid-3x3": Grid3X3,
  film: Film,
  "arrow-left-right": ArrowLeftRight,
  "link-2": Link2,
  sparkles: Sparkles,
  "volume-2": Volume2,
  percent: Percent,
  search: Search,
  "globe-2": Globe2,
  activity: Activity,
  network: Network,
};

const accentStyles: Record<string, { icon: string; ring: string }> = {
  violet: { icon: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300", ring: "group-hover:border-violet-200 dark:group-hover:border-violet-900" },
  blue: { icon: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300", ring: "group-hover:border-blue-200 dark:group-hover:border-blue-900" },
  amber: { icon: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300", ring: "group-hover:border-amber-200 dark:group-hover:border-amber-900" },
  emerald: { icon: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", ring: "group-hover:border-emerald-200 dark:group-hover:border-emerald-900" },
  rose: { icon: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300", ring: "group-hover:border-rose-200 dark:group-hover:border-rose-900" },
  pink: { icon: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300", ring: "group-hover:border-pink-200 dark:group-hover:border-pink-900" },
};

export default function ToolCard({ tool }: { tool: Tool }) {
  const route = ({ "jpg-to-pdf": "/tools/jpg-to-pdf", "pdf-to-image": "/tools/pdf-to-image", "merge-pdf": "/tools/merge-pdf", "split-pdf": "/tools/split-pdf", "compress-pdf": "/tools/compress-pdf", "rotate-pdf": "/tools/rotate-pdf", "protect-pdf": "/tools/protect-pdf", "unlock-pdf": "/tools/unlock-pdf", "pdf-text-extractor": "/tools/pdf-text-extractor", "word-counter": "/tools/word-counter", "case-converter": "/tools/case-converter", "remove-extra-spaces-line-breaks": "/tools/remove-extra-spaces-line-breaks", "lorem-ipsum-generator": "/tools/lorem-ipsum-generator", "text-to-slug-converter": "/tools/text-to-slug-converter", "find-and-replace": "/tools/find-and-replace", "fancy-text-generator": "/tools/fancy-text-generator", "text-to-speech": "/tools/text-to-speech", "json-formatter": "/tools/json-formatter", "xml-json-converter": "/tools/xml-json-converter", "html-css-js-minifier": "/tools/html-css-js-minifier", "html-css-js-beautifier": "/tools/html-css-js-beautifier", "url-encoder-decoder": "/tools/url-encoder-decoder", "uuid-guid-generator": "/tools/uuid-guid-generator", "md5-sha256-hash-generator": "/tools/md5-sha256-hash-generator", "meta-tag-generator": "/tools/meta-tag-generator", "xml-sitemap-generator": "/tools/xml-sitemap-generator", "keyword-density-checker": "/tools/keyword-density-checker", "open-graph-generator": "/tools/open-graph-generator", "youtube-thumbnail-downloader": "/tools/youtube-thumbnail-downloader", "age-calculator": "/tools/age-calculator", "emi-loan-calculator": "/tools/emi-loan-calculator", "bmi-calculator": "/tools/bmi-calculator", "percentage-discount-calculator": "/tools/percentage-discount-calculator", "strong-password-generator": "/tools/strong-password-generator", "random-number-name-picker": "/tools/random-number-name-picker", "stopwatch-countdown-timer": "/tools/stopwatch-countdown-timer", "mp4-to-mp3": "/tools/mp4-to-mp3", "audio-trimmer-ringtone-maker": "/tools/audio-trimmer-ringtone-maker", "video-compressor": "/tools/video-compressor", "video-trimmer": "/tools/video-trimmer", "smart-video-clip-generator": "/tools/smart-video-clip-generator", "what-is-my-ip": "/tools/what-is-my-ip", "whois-lookup": "/tools/whois-lookup", "dns-lookup": "/tools/dns-lookup", "ping-traceroute": "/tools/ping-traceroute", "mac-address-vendor-lookup": "/tools/mac-address-vendor-lookup", "ssl-certificate-checker": "/tools/ssl-certificate-checker", "real-time-currency-converter": "/tools/real-time-currency-converter", "gst-vat-calculator": "/tools/gst-vat-calculator", "crypto-to-fiat-converter": "/tools/crypto-to-fiat-converter", "invoice-pdf-generator": "/tools/invoice-pdf-generator", "salary-income-tax-calculator": "/tools/salary-income-tax-calculator", "length-distance-converter": "/tools/length-distance-converter", "weight-converter": "/tools/weight-converter", "temperature-converter": "/tools/temperature-converter", "data-storage-converter": "/tools/data-storage-converter", "time-converter": "/tools/time-converter", "sip-mutual-fund-calculator": "/tools/sip-mutual-fund-calculator", "robots-txt-generator": "/tools/robots-txt-generator", "qr-generator-scanner": "/tools/qr-generator-scanner", "base64-encoder-decoder": "/tools/base64-encoder-decoder", "pdf-to-word": "/tools/pdf-to-word", "word-to-pdf": "/tools/word-to-pdf", "pdf-to-excel": "/tools/pdf-to-excel", "excel-to-pdf": "/tools/excel-to-pdf", "pdf-to-powerpoint": "/tools/pdf-to-powerpoint", "powerpoint-to-pdf": "/tools/powerpoint-to-pdf", "image-compressor": "/tools/image-compressor", "image-resizer": "/tools/image-resizer", "image-cropper": "/tools/image-cropper", "image-converter": "/tools/image-converter", "background-remover": "/tools/background-remover", "image-watermark": "/tools/image-watermark", "image-to-base64": "/tools/image-to-base64", "base64-to-image": "/tools/base64-to-image", "image-metadata-viewer": "/tools/image-metadata-viewer", "hex-rgb-converter": "/tools/hex-rgb-converter", "color-picker-from-image": "/tools/color-picker-from-image", "color-palette-generator": "/tools/color-palette-generator", "gradient-generator": "/tools/gradient-generator", "dummy-image-generator": "/tools/dummy-image-generator", "font-pairing-generator": "/tools/font-pairing-generator", "whatsapp-direct-link-generator": "/tools/whatsapp-direct-link-generator", "youtube-tag-extractor": "/tools/youtube-tag-extractor", "tweet-to-image": "/tools/tweet-to-image", "utm-builder": "/tools/utm-builder",
  "social-media-character-counter": "/tools/social-media-character-counter",
  "password-strength-checker": "/tools/password-strength-checker",
  "data-breach-checker": "/tools/data-breach-checker",
  "disposable-email-generator": "/tools/disposable-email-generator",
  "htpasswd-generator": "/tools/htpasswd-generator",
  "ai-summarizer": "/tools/ai-summarizer",
  "grammar-spell-checker": "/tools/grammar-spell-checker",
  "prompt-generator": "/tools/prompt-generator",
  "text-to-emoji-translator": "/tools/text-to-emoji-translator",
  "professional-resume-builder": "/tools/professional-resume-builder",
  "cgpa-gpa-calculator": "/tools/cgpa-gpa-calculator",
  "apa-mla-citation-generator": "/tools/apa-mla-citation-generator",
  "text-comparison-plagiarism-helper": "/tools/text-comparison-plagiarism-helper",
  "word-unscrambler-anagram-solver": "/tools/word-unscrambler-anagram-solver",
  "percentage-difference-calculator": "/tools/percentage-difference-calculator",
  "calorie-macros-calculator": "/tools/calorie-macros-calculator",
  "pregnancy-due-date-calculator": "/tools/pregnancy-due-date-calculator",
  "bmr-calculator": "/tools/bmr-calculator",
  "ideal-weight-calculator": "/tools/ideal-weight-calculator",
  "water-intake-calculator": "/tools/water-intake-calculator",
  "payment-fee-calculator": "/tools/payment-fee-calculator",
  "profit-margin-markup-calculator": "/tools/profit-margin-markup-calculator",
  "roi-calculator": "/tools/roi-calculator",
  "barcode-generator": "/tools/barcode-generator",
  "cpm-calculator": "/tools/cpm-calculator",
  "youtube-earnings-estimator": "/tools/youtube-earnings-estimator",
  "youtube-tags-keywords": "/tools/youtube-tags-keywords",
  "youtube-title-description-generator": "/tools/youtube-title-description-generator",
  "twitch-overlay-resizer": "/tools/twitch-overlay-resizer",
  "instagram-tiktok-hashtag-generator": "/tools/instagram-tiktok-hashtag-generator",
  "gamertag-generator": "/tools/gamertag-generator",
  "discord-text-formatter": "/tools/discord-text-formatter",
  "kaomoji-board": "/tools/kaomoji-board",
  "love-calculator": "/tools/love-calculator",
  "zodiac-calculator": "/tools/zodiac-calculator",
  "time-zone-converter": "/tools/time-zone-converter",
  "pomodoro-timer": "/tools/pomodoro-timer",
  "browser-notepad-local-save": "/tools/browser-notepad-local-save",
  "meeting-overlap-calculator": "/tools/meeting-overlap-calculator",
  "svg-png-converter": "/tools/svg-png-converter", "css-box-shadow-generator": "/tools/css-box-shadow-generator", "css-border-radius-generator": "/tools/css-border-radius-generator", "css-button-generator": "/tools/css-button-generator", "css-text-shadow-generator": "/tools/css-text-shadow-generator", "css-transform-generator": "/tools/css-transform-generator", "css-filter-generator": "/tools/css-filter-generator", "css-flexbox-playground": "/tools/css-flexbox-playground", "css-grid-playground": "/tools/css-grid-playground", "css-animation-generator": "/tools/css-animation-generator", "css-outline-generator": "/tools/css-outline-generator" } as Record<string, string>)[tool.id] ?? null;
  const Icon = iconMap[tool.icon] ?? FileText;
  const style = accentStyles[tool.accent] ?? accentStyles.violet;

  return (
    <article className={`group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${style.ring}`}>
      <div className="flex items-start justify-between gap-4">
        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${style.icon}`}>
          <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
        </span>
        <ArrowUpRight size={18} className="mt-1 text-slate-300 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-600 dark:text-slate-600 dark:group-hover:text-violet-400" aria-hidden="true" />
      </div>
      <div className="mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold tracking-tight text-slate-900 dark:text-white">{tool.name}</h3>
          {tool.popular && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Popular</span>}
        </div>
        <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500 dark:text-slate-400">{tool.description}</p>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{tool.category}</span>
        {route ? (
          <a
            href={route}
            onClick={(event) => {
              // Preserve browser-native modified clicks (new tab/window, downloads, etc.).
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              // Force a full document navigation for the normal click path. This avoids
              // relying on client-side route interception for these tool pages.
              event.preventDefault();
              window.location.assign(route);
            }}
            className="relative z-10 inline-flex min-h-8 items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
          >Open tool <ArrowUpRight size={14} aria-hidden="true" /></a>
        ) : (
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Planned</span>
        )}
      </div>
    </article>
  );
}
