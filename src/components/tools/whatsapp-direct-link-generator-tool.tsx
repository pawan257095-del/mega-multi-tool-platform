"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, MessageCircle, RotateCcw } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

function normalizePhone(value: string) {
  return value.replace(/[\s().-]/g, "").replace(/^\+/, "");
}

export default function WhatsAppDirectLinkGeneratorTool() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("Hi! I would like to know more.");
  const [includeMessage, setIncludeMessage] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const normalized = useMemo(() => normalizePhone(phone), [phone]);
  const validPhone = /^\d{7,15}$/.test(normalized) && !/^0+$/.test(normalized);
  const link = useMemo(() => {
    if (!validPhone) return "";
    const base = `https://wa.me/${normalized}`;
    return includeMessage && message.trim() ? `${base}?text=${encodeURIComponent(message.trim())}` : base;
  }, [normalized, validPhone, includeMessage, message]);

  function copyLink() {
    setError("");
    if (!link) { setError("Enter a valid international phone number using country code, without the leading +."); return; }
    if (!navigator.clipboard?.writeText) { setError("Clipboard access is unavailable. You can select and copy the generated link manually."); return; }
    navigator.clipboard.writeText(link).then(() => setCopied(true)).catch(() => setError("Could not copy automatically. Select the generated link and copy it manually."));
  }

  function openWhatsApp() {
    setError("");
    if (!link) { setError("Enter a valid international phone number first."); return; }
    window.open(link, "_blank", "noopener,noreferrer");
  }

  function reset() {
    setPhone(""); setMessage("Hi! I would like to know more."); setIncludeMessage(true); setError(""); setCopied(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.85fr)]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><MessageCircle size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Build your chat link</h2><p className="text-sm text-slate-500 dark:text-slate-400">Generate a WhatsApp Click to Chat URL.</p></div></div>
        <div><label htmlFor="wa-phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Phone number with country code</label><input id="wa-phone" className={inputClass} value={phone} onChange={(e) => { setPhone(e.target.value); setCopied(false); setError(""); }} placeholder="e.g. +91 98765 43210" inputMode="tel" autoComplete="tel" /><p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">Include the country calling code. Spaces, +, hyphens and parentheses are removed automatically. Use digits only in the final international number; do not include a local trunk prefix.</p></div>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"><input type="checkbox" checked={includeMessage} onChange={(e) => { setIncludeMessage(e.target.checked); setCopied(false); }} /> Add a prefilled message</label>
        {includeMessage && <div><label htmlFor="wa-message" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Message</label><textarea id="wa-message" className={`${inputClass} min-h-32 resize-y`} value={message} onChange={(e) => { setMessage(e.target.value); setCopied(false); }} maxLength={2000} placeholder="Write the message that should appear in the chat" /><p className="mt-1 text-right text-xs text-slate-500">{message.length}/2000</p></div>}
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={copyLink} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"><Copy size={16} /> Copy link</button><button type="button" onClick={openWhatsApp} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><ExternalLink size={16} /> Open WhatsApp</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        {copied && <p role="status" className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={15} /> Link copied to clipboard.</p>}
      </div>
      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Generated link</h2><span className={`rounded-full px-2 py-1 text-xs font-semibold ${validPhone ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>{validPhone ? "Ready" : "Waiting for number"}</span></div><div className="break-all rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">{link || "https://wa.me/COUNTRYCODENUMBER"}</div>{validPhone && <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Number detected: {normalized}. Verify the country code and digits before sharing.</p>}</div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">How it works</h3><ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-5 text-slate-600 dark:text-slate-300"><li>Enter the recipient’s number with its international calling code.</li><li>Optionally add a message that will be prefilled in the chat.</li><li>Copy the link or open it to continue in WhatsApp or WhatsApp Web.</li></ol><p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">This tool only builds a URL. It does not send messages, verify that the number has WhatsApp, or store the number/message. Make sure you have permission to contact the recipient.</p></div>
      </div>
    </section>
  );
}
