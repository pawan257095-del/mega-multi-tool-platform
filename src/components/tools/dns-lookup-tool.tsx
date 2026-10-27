
"use client";

import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Search,
} from "lucide-react";
import { useState } from "react";

type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "TXT"
  | "CAA"
  | "SOA";

type DnsAnswer = {
  name?: string;
  type?: number;
  TTL?: number;
  data?: string;
};

type DnsResponse = {
  Status?: number;
  TC?: boolean;
  RD?: boolean;
  RA?: boolean;
  AD?: boolean;
  CD?: boolean;
  Question?: { name?: string; type?: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
  Comment?: string;
};

type QueryResult = {
  type: RecordType;
  answers: DnsAnswer[];
  status: number;
  message?: string;
};

const RECORD_TYPES: RecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "CAA",
  "SOA",
];

const STATUS_LABELS: Record<number, string> = {
  0: "NOERROR",
  1: "FORMERR",
  2: "SERVFAIL",
  3: "NXDOMAIN",
  4: "NOTIMP",
  5: "REFUSED",
};

function normalizeDomain(value: string) {
  let candidate = value.trim();

  if (!candidate) {
    throw new Error("Enter a domain name, such as example.com.");
  }

  if (!candidate.includes("://")) {
    candidate = `https://${candidate}`;
  }

  let hostname = "";

  try {
    hostname = new URL(candidate).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    throw new Error("Enter a valid domain name, such as example.com.");
  }

  if (
    !hostname ||
    hostname.length > 253 ||
    !hostname.includes(".") ||
    hostname
      .split(".")
      .some(
        (label) =>
          !/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(label),
      )
  ) {
    throw new Error(
      "Enter a valid domain name. IP addresses and local hostnames are not supported here.",
    );
  }

  return hostname;
}

async function queryDns(
  domain: string,
  type: RecordType,
): Promise<QueryResult> {
  const url = new URL("https://dns.google/resolve");

  url.searchParams.set("name", domain);
  url.searchParams.set("type", type);

  const response = await fetch(url.toString(), {
    headers: { Accept: "application/dns-json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`${type} query returned HTTP ${response.status}`);
  }

  const data = (await response.json()) as DnsResponse;

  return {
    type,
    answers: data.Answer || [],
    status: typeof data.Status === "number" ? data.Status : -1,
    message: data.Comment,
  };
}

export default function DnsLookupTool() {
  const [input, setInput] = useState("example.com");
  const [domain, setDomain] = useState("");
  const [selected, setSelected] = useState<RecordType[]>([
    "A",
    "AAAA",
    "CNAME",
    "MX",
    "NS",
    "TXT",
  ]);
  const [results, setResults] = useState<QueryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function toggleType(type: RecordType) {
    setSelected((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  async function lookup() {
    let normalized = "";

    try {
      normalized = normalizeDomain(input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Enter a valid domain.",
      );
      setResults([]);
      return;
    }

    if (selected.length === 0) {
      setError("Select at least one DNS record type.");
      return;
    }

    setDomain(normalized);
    setLoading(true);
    setError("");
    setCopied(false);
    setResults([]);

    try {
      const settled = await Promise.allSettled(
        selected.map((type) => queryDns(normalized, type)),
      );

      const next: QueryResult[] = settled.map((item, index) =>
        item.status === "fulfilled"
          ? item.value
          : {
              type: selected[index],
              answers: [],
              status: -1,
              message:
                item.reason instanceof Error
                  ? item.reason.message
                  : "Query failed",
            },
      );

      if (next.every((item) => item.status === -1)) {
        throw new Error(
          "DNS queries could not be completed. Check your connection or try again later.",
        );
      }

      setResults(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "DNS lookup failed. Check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const summary = results
    .map((result) => {
      const lines = [
        `${result.type} — ${
          STATUS_LABELS[result.status] ||
          (result.status === -1
            ? "QUERY ERROR"
            : `DNS status ${result.status}`)
        }`,
      ];

      if (result.answers.length) {
        lines.push(
          ...result.answers.map(
            (answer) =>
              `  ${answer.data || "(empty)"}${
                typeof answer.TTL === "number"
                  ? ` (TTL ${answer.TTL}s)`
                  : ""
              }`,
          ),
        );
      } else {
        lines.push(`  ${result.message || "No records returned"}`);
      }

      return lines.join("\n");
    })
    .join("\n\n");

  async function copyResults() {
    try {
      await navigator.clipboard.writeText(
        `DNS lookup for ${domain}\n\n${summary}`,
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError(
        "Clipboard access was blocked. Select and copy the results manually.",
      );
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            DNS record lookup
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Choose record types and query public DNS data for a domain or
            website URL.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            void lookup();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <label className="sr-only" htmlFor="dns-domain">
            Domain name
          </label>
          <input
            id="dns-domain"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="example.com"
            autoComplete="url"
            className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-950"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Search size={17} />
            )}
            {loading ? "Querying DNS…" : "Look up DNS"}
          </button>
        </form>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Record types
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {RECORD_TYPES.map((type) => (
              <label
                key={type}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                  selected.includes(type)
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
                    : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(type)}
                  onChange={() => toggleType(type)}
                  className="accent-emerald-600"
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        {error && (
          <div
            role="alert"
            className="mt-4 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/70 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  DNS results
                </p>
                <h3 className="mt-1 break-all text-xl font-bold text-slate-900 dark:text-white">
                  {domain}
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Queried through Google Public DNS over HTTPS
                </p>
              </div>
              <button
                type="button"
                onClick={() => void copyResults()}
                className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy results"}
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {results.map((result) => (
                <article
                  key={result.type}
                  className="min-w-0 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {result.type} records
                    </h4>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        result.status === 0 && result.answers.length
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                          : result.status === 3
                            ? "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {STATUS_LABELS[result.status] ||
                        (result.status === -1 ? "Query error" : "No data")}
                    </span>
                  </div>

                  {result.answers.length ? (
                    <ul className="mt-3 space-y-3">
                      {result.answers.map((answer, index) => (
                        <li
                          key={`${result.type}-${index}`}
                          className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60"
                        >
                          <p className="break-all font-mono text-sm text-slate-800 dark:text-slate-200">
                            {answer.data || "(empty record)"}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                            <span>
                              TTL:{" "}
                              {typeof answer.TTL === "number"
                                ? `${answer.TTL}s`
                                : "Not provided"}
                            </span>
                            {answer.name && (
                              <span className="break-all">
                                Name: {answer.name}
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {result.message ||
                        (result.status === 3
                          ? "The domain name does not exist (NXDOMAIN), or this response indicates no such name."
                          : result.status === 0
                            ? "No records of this type were returned."
                            : STATUS_LABELS[result.status]
                              ? `DNS response: ${STATUS_LABELS[result.status]}.`
                              : "No records returned for this query.")}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <a
              href="https://dns.google/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-300"
            >
              About Google Public DNS <ExternalLink size={15} />
            </a>
          </div>
        )}

        {!results.length && !loading && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 px-5 py-9 text-center dark:border-slate-700">
            <Globe2 className="mx-auto text-slate-400" size={30} />
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
              DNS records will appear here
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Try example.com to see common DNS record types.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="font-semibold">Data availability and privacy</p>
        <p className="mt-1">
          Queries are sent to Google Public DNS over HTTPS. Results reflect
          that resolver&apos;s response and may differ from authoritative DNS
          or other resolvers because of caching, propagation, DNSSEC,
          split-horizon setups, or provider policy. DNS records can contain
          operational information, so query only domains you are authorized
          to inspect.
        </p>
      </div>
    </section>
  );
}
