"use client";

import { useState } from "react";
import { AlertCircle, Check, Copy, ExternalLink, Globe2, LoaderCircle, Search } from "lucide-react";

type RdapEvent = { eventAction?: string; eventDate?: string };
type RdapEntity = { roles?: string[]; vcardArray?: unknown[]; handle?: string };
type RdapNameserver = { ldhName?: string };
type RdapRecord = {
  ldhName?: string;
  handle?: string;
  status?: string[];
  events?: RdapEvent[];
  nameservers?: RdapNameserver[];
  entities?: RdapEntity[];
  port43?: string;
  notices?: { title?: string; description?: string[]; links?: { value?: string; href?: string }[] }[];
  links?: { rel?: string; href?: string }[];
};

function getVcardValue(entity: RdapEntity): string {
  const vcard = entity.vcardArray;
  if (!Array.isArray(vcard) || !Array.isArray(vcard[1])) return "";
  const entries = vcard[1] as unknown[][];
  for (const entry of entries) {
    if ((entry[0] === "fn" || entry[0] === "org") && typeof entry[3] === "string") return entry[3];
    if ((entry[0] === "fn" || entry[0] === "org") && Array.isArray(entry[3])) return entry[3].filter(Boolean).join(" ");
  }
  return "";
}

function formatDate(value?: string) {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function normalizeDomain(value: string) {
  let candidate = value.trim();
  if (!candidate) throw new Error("Enter a domain name, such as example.com.");
  if (!candidate.includes("://")) candidate = `https://${candidate}`;
  let hostname = "";
  try { hostname = new URL(candidate).hostname.toLowerCase().replace(/\.$/, ""); }
  catch { throw new Error("Enter a valid domain name, such as example.com."); }
  if (!hostname || hostname.includes(" ") || !hostname.includes(".") || hostname.length > 253 || hostname.split(".").some((label) => !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label))) {
    throw new Error("Enter a valid domain name without a path or query string.");
  }
  return hostname;
}

export default function WhoisLookupTool() {
  const [input, setInput] = useState("example.com");
  const [domain, setDomain] = useState("");
  const [record, setRecord] = useState<RdapRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function lookup() {
    let normalized = "";
    try { normalized = normalizeDomain(input); }
    catch (err) { setError(err instanceof Error ? err.message : "Enter a valid domain."); setRecord(null); return; }
    setLoading(true); setError(""); setCopied(false); setRecord(null); setDomain(normalized);
    try {
      const response = await fetch(`https://rdap.org/domain/${encodeURIComponent(normalized)}`, { headers: { Accept: "application/rdap+json, application/json" }, cache: "no-store" });
      if (response.status === 404) throw new Error("No RDAP registration record was found for this domain. It may be unregistered or the registry may not support RDAP.");
      if (!response.ok) throw new Error(`The domain registry lookup returned HTTP ${response.status}. Try again later or use the registry's official lookup service.`);
      const data = await response.json() as RdapRecord & { errorCode?: number; title?: string; description?: string[] };
      if (!data.ldhName && !data.handle && !Array.isArray(data.events)) throw new Error(data.title || "The lookup provider returned an unexpected response.");
      setRecord(data);
    } catch (err) {
      setError(err instanceof Error ? `${err.message} Some domains or networks may block public RDAP requests.` : "Could not complete the domain lookup. Check your connection and try again.");
    } finally { setLoading(false); }
  }

  const registrarEntity = record?.entities?.find((entity) => entity.roles?.includes("registrar"));
  const registrar = registrarEntity ? getVcardValue(registrarEntity) || registrarEntity.handle || "Registrar details not provided" : "Not provided by registry";
  const eventDate = (action: string) => record?.events?.find((event) => event.eventAction?.toLowerCase() === action)?.eventDate;
  const summary = record ? [
    `Domain: ${record.ldhName || domain}`,
    `Registrar: ${registrar}`,
    `Created: ${formatDate(eventDate("registration"))}`,
    `Updated: ${formatDate(eventDate("last changed"))}`,
    `Expires: ${formatDate(eventDate("expiration"))}`,
    `Status: ${(record.status || []).join(", ") || "Not provided"}`,
    `Nameservers: ${(record.nameservers || []).map((ns) => ns.ldhName).filter(Boolean).join(", ") || "Not provided"}`,
  ].join("\n") : "";

  async function copySummary() {
    try { await navigator.clipboard.writeText(summary); setCopied(true); window.setTimeout(() => setCopied(false), 1600); }
    catch { setError("Clipboard access was blocked. You can select and copy the displayed details manually."); }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Domain registration lookup</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Query public RDAP registration data for a domain. You can enter a domain or a full website URL.</p>
        </div>
        <form onSubmit={(event) => { event.preventDefault(); void lookup(); }} className="flex flex-col gap-3 sm:flex-row">
          <label className="sr-only" htmlFor="whois-domain">Domain name</label>
          <input id="whois-domain" value={input} onChange={(event) => setInput(event.target.value)} placeholder="example.com" autoComplete="url" className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950" />
          <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? <LoaderCircle size={17} className="animate-spin" /> : <Search size={17} />}{loading ? "Looking up…" : "Look up domain"}
          </button>
        </form>
        {error && <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{error}</span></div>}
        {record && <div className="mt-6 space-y-4">
          <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-5 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Domain record</p><h3 className="mt-1 break-all text-2xl font-bold text-slate-900 dark:text-white">{record.ldhName || domain}</h3></div>
            <button type="button" onClick={copySummary} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? "Copied" : "Copy summary"}</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2"><Info label="Registrar" value={registrar} /><Info label="Created" value={formatDate(eventDate("registration"))} /><Info label="Last updated" value={formatDate(eventDate("last changed"))} /><Info label="Expiration" value={formatDate(eventDate("expiration"))} /><Info label="Registry / domain handle" value={record.handle || "Not provided"} /><Info label="Registry WHOIS server" value={record.port43 || "Not provided"} /></div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h4 className="text-sm font-semibold text-slate-900 dark:text-white">Domain status</h4>{record.status?.length ? <div className="mt-3 flex flex-wrap gap-2">{record.status.map((status) => <span key={status} className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-200">{status}</span>)}</div> : <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Status not provided.</p>}</div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h4 className="text-sm font-semibold text-slate-900 dark:text-white">Nameservers</h4>{record.nameservers?.length ? <ul className="mt-3 space-y-2">{record.nameservers.map((ns, index) => <li key={`${ns.ldhName || "ns"}-${index}`} className="break-all font-mono text-sm text-slate-700 dark:text-slate-300">{ns.ldhName || "Unspecified nameserver"}</li>)}</ul> : <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Nameserver details not provided.</p>}</div>
          {record.links?.find((link) => link.rel === "self" || link.href)?.href && <a href={record.links.find((link) => link.rel === "self" || link.href)?.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:underline dark:text-violet-300">Open source RDAP record <ExternalLink size={15} /></a>}
        </div>}
        {!record && !loading && <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-9 text-center dark:border-slate-700"><Globe2 className="mx-auto text-slate-400" size={30} /><p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Domain registration details will appear here</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Try example.com to see the kind of information public registries may return.</p></div>}
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><p className="font-semibold">Data availability and privacy</p><p className="mt-1">This tool uses a public RDAP service; the domain you search is sent to that service. RDAP availability and fields vary by registry. Registrant contact details are often redacted for privacy, and dates or status values may be missing. This is a registration lookup, not a guarantee of domain ownership or legal rights.</p></div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p></div>;
}
