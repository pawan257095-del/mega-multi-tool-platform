
"use client";

import { useState } from "react";
import {
  AlertCircle,
  Copy,
  ExternalLink,
  LoaderCircle,
  Search,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";

type CertificateRecord = {
  id: number;
  issuer_name?: string;
  common_name?: string;
  name_value?: string;
  not_before?: string;
  not_after?: string;
};

function normalizeDomain(value: string) {
  let input = value.trim();

  if (!input) return "";

  try {
    if (!/^https?:\/\//i.test(input)) {
      input = `https://${input}`;
    }

    return new URL(input).hostname.toLowerCase().replace(/\.$/, "");
  } catch {
    return "";
  }
}

function dateLabel(value?: string) {
  if (!value) return "Not provided";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

function validity(record: CertificateRecord) {
  if (!record.not_after) return "Expiration date unavailable";

  const end = new Date(record.not_after).getTime();

  if (!Number.isFinite(end)) {
    return "Expiration date unavailable";
  }

  if (end < Date.now()) {
    return "Expired (according to this transparency record)";
  }

  return `Not expired as of now (about ${Math.ceil(
    (end - Date.now()) / 86400000,
  )} days remaining)`;
}

export default function SSLCertificateCheckerTool() {
  const [domainInput, setDomainInput] = useState("example.com");
  const [domain, setDomain] = useState("");
  const [records, setRecords] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function checkCertificates() {
    const host = normalizeDomain(domainInput);

    setError("");
    setRecords([]);
    setCopied(false);

    if (
      !host ||
      host.includes(" ") ||
      !host.includes(".") ||
      host.length > 253
    ) {
      setError(
        "Enter a valid domain name, such as example.com. Full HTTPS URLs are also accepted.",
      );
      return;
    }

    setDomain(host);
    setLoading(true);

    try {
      const response = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(host)}&output=json`,
        { cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error(
          `Certificate transparency service returned HTTP ${response.status}.`,
        );
      }

      const payload: unknown = await response.json();

      if (!Array.isArray(payload)) {
        throw new Error("The service returned an unexpected response.");
      }

      const seen = new Set<string>();

      const parsed = (payload as CertificateRecord[])
        .filter(
          (item) =>
            item &&
            typeof item === "object" &&
            Number.isFinite(Number(item.id)),
        )
        .filter((item) => {
          const key = `${item.id}|${item.not_after ?? ""}`;

          if (seen.has(key)) return false;

          seen.add(key);
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.not_before ?? 0).getTime() -
            new Date(a.not_before ?? 0).getTime(),
        )
        .slice(0, 30);

      setRecords(parsed);

      if (!parsed.length) {
        setError(
          "No certificate-transparency records were returned. This does not prove the domain has no active certificate.",
        );
      }
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "The lookup request failed.";

      setError(
        `Certificate lookup failed: ${message} Your network or the external service may block the request; try again later.`,
      );
    } finally {
      setLoading(false);
    }
  }

  const summary = records.length
    ? `Certificate transparency records for ${domain}\n\n${records
        .map(
          (record, index) =>
            `${index + 1}. Common name: ${record.common_name ?? "Not provided"}\nIssuer: ${record.issuer_name ?? "Not provided"}\nValid from: ${dateLabel(record.not_before)}\nValid until: ${dateLabel(record.not_after)}\nStatus estimate: ${validity(record)}\ncrt.sh record: https://crt.sh/?id=${record.id}`,
        )
        .join("\n\n")}`
    : "";

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setError(
        "Clipboard access was blocked. Select and copy the results manually.",
      );
    }
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <label
          htmlFor="ssl-domain"
          className="block text-sm font-semibold text-slate-800 dark:text-slate-100"
        >
          Domain or website URL
        </label>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="ssl-domain"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void checkCertificates();
            }}
            placeholder="example.com"
            className="min-h-11 flex-1 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-emerald-900"
          />

          <button
            type="button"
            onClick={() => void checkCertificates()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Search size={17} />
            )}
            {loading ? "Checking…" : "Check certificates"}
          </button>
        </div>

        <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Uses public certificate-transparency logs via crt.sh. The domain is
          sent to that third-party service.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {records.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className="mt-0.5 text-emerald-700 dark:text-emerald-300"
              />

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  {records.length} recent record
                  {records.length === 1 ? "" : "s"} for {domain}
                </h2>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                  Showing up to 30 records, newest first.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void copySummary()}
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-white px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
            >
              <Copy size={15} />
              {copied ? "Copied" : "Copy summary"}
            </button>
          </div>

          <div className="grid gap-3">
            {records.map((record) => (
              <article
                key={`${record.id}-${record.not_after ?? "na"}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="break-words font-semibold text-slate-900 dark:text-white">
                      {record.common_name ||
                        record.name_value?.split("\n")[0] ||
                        domain}
                    </h3>

                    <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">
                      Issuer: {record.issuer_name || "Not provided"}
                    </p>
                  </div>

                  <a
                    href={`https://crt.sh/?id=${record.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                  >
                    Open record <ExternalLink size={13} />
                  </a>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Valid from
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {dateLabel(record.not_before)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Valid until
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {dateLabel(record.not_after)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Date-based estimate
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                      {validity(record)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-950 dark:border-sky-900 dark:bg-sky-950/30 dark:text-sky-100">
            <ShieldAlert size={19} className="mt-0.5 shrink-0" />
            <p>
              <strong>Important limitation:</strong> these are
              certificate-transparency records, not a live TLS handshake. This
              browser-only tool cannot reliably verify the site&apos;s current
              certificate chain, hostname match, revocation status, or server
              configuration. Confirm current status with a trusted TLS testing
              service or your server&apos;s certificate tools.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
