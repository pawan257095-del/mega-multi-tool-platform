"use client";

import { useMemo, useState } from "react";

function randomToken(length = 12) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(length);
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  }
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export default function DisposableEmailGeneratorTool() {
  const [prefix, setPrefix] = useState("temp");
  const [domain, setDomain] = useState("example.com");
  const [tokenLength, setTokenLength] = useState("10");
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const cleanPrefix = useMemo(() => prefix.toLowerCase().replace(/[^a-z0-9._+-]/g, "").slice(0, 24), [prefix]);
  const validDomain = /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(domain.trim());

  function generate() {
    const size = Math.min(24, Math.max(4, Number.parseInt(tokenLength, 10) || 10));
    const local = `${cleanPrefix ? `${cleanPrefix}.` : ""}${randomToken(size)}`;
    setGenerated(`${local}@${domain.trim().toLowerCase()}`);
    setCopied(false);
  }

  async function copyAddress() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="deg-prefix" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Optional prefix</label>
            <input id="deg-prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} maxLength={32} placeholder="temp" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Letters, numbers, dots, underscores, plus and hyphens are kept.</p>
          </div>
          <div>
            <label htmlFor="deg-domain" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Domain</label>
            <input id="deg-domain" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="example.com" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use a domain you control or a real temporary-mail provider domain.</p>
          </div>
          <div>
            <label htmlFor="deg-length" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Random token length (4–24)</label>
            <input id="deg-length" type="number" min="4" max="24" value={tokenLength} onChange={(e) => setTokenLength(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={generate} disabled={!validDomain} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">Generate address</button>
          <button type="button" onClick={copyAddress} disabled={!generated} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900">Copy address</button>
        </div>
        {!validDomain && <p role="alert" className="mt-3 text-sm text-rose-600 dark:text-rose-400">Enter a valid domain such as example.com.</p>}
        {generated && <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Generated alias</p>
          <p className="mt-2 break-all font-mono text-lg text-slate-900 dark:text-white">{generated}</p>
          {copied && <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">Copied to clipboard.</p>}
        </div>}
      </section>

      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="font-semibold text-amber-950 dark:text-amber-200">Important limitation</h2>
        <p className="mt-2 text-sm leading-6 text-amber-900 dark:text-amber-100">
          This tool generates an address-shaped alias only. It does not create an inbox, receive messages, or make an arbitrary domain accept mail. To receive mail, integrate a legitimate disposable-email provider or configure a domain and mail server you control.
        </p>
      </section>
    </div>
  );
}
