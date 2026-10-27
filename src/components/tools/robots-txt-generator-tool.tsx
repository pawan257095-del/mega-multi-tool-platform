
"use client";

import { useMemo, useState } from "react";
import { Check, Clipboard, Download, RotateCcw } from "lucide-react";

type Rule = { path: string; enabled: boolean };

const defaultDisallow: Rule[] = [
  { path: "/admin/", enabled: true },
  { path: "/private/", enabled: true },
  { path: "/search/", enabled: false },
];

const defaultAllow: Rule[] = [{ path: "/", enabled: false }];

export default function RobotsTxtGeneratorTool() {
  const [userAgent, setUserAgent] = useState("*");
  const [disallow, setDisallow] = useState<Rule[]>(defaultDisallow);
  const [allow, setAllow] = useState<Rule[]>(defaultAllow);
  const [sitemap, setSitemap] = useState(
    "https://example.com/sitemap.xml",
  );
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const output = useMemo(() => {
    const lines = [`User-agent: ${userAgent.trim() || "*"}`];
    const clean = (value: string) => value.trim().replace(/[\r\n]/g, "");

    disallow
      .filter((rule) => rule.enabled && clean(rule.path))
      .forEach((rule) => lines.push(`Disallow: ${clean(rule.path)}`));

    allow
      .filter((rule) => rule.enabled && clean(rule.path))
      .forEach((rule) => lines.push(`Allow: ${clean(rule.path)}`));

    if (crawlDelay.trim()) {
      lines.push(`Crawl-delay: ${crawlDelay.trim()}`);
    }

    if (sitemap.trim()) {
      if (lines.length > 1) lines.push("");
      lines.push(`Sitemap: ${clean(sitemap)}`);
    }

    return lines.join("\n") + "\n";
  }, [userAgent, disallow, allow, sitemap, crawlDelay]);

  async function copyOutput() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setError("");
    } catch {
      setError(
        "Clipboard access was blocked. Select the generated text and copy it manually.",
      );
    }
  }

  function download() {
    const url = URL.createObjectURL(
      new Blob([output], { type: "text/plain;charset=utf-8" }),
    );

    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    a.click();

    URL.revokeObjectURL(url);
  }

  function reset() {
    setUserAgent("*");
    setDisallow(defaultDisallow);
    setAllow(defaultAllow);
    setSitemap("https://example.com/sitemap.xml");
    setCrawlDelay("");
    setCopied(false);
    setError("");
  }

  function updateRule(
    kind: "allow" | "disallow",
    index: number,
    patch: Partial<Rule>,
  ) {
    const setter = kind === "allow" ? setAllow : setDisallow;

    setter((items) =>
      items.map((item, i) =>
        i === index ? { ...item, ...patch } : item,
      ),
    );

    setCopied(false);
  }

  function addRule(kind: "allow" | "disallow") {
    const setter = kind === "allow" ? setAllow : setDisallow;

    setter((items) => [...items, { path: "", enabled: true }]);
    setCopied(false);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

  const labelClass =
    "block text-sm font-medium text-slate-700 dark:text-slate-300";

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Crawler rules
          </h2>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <RotateCcw size={13} /> Reset
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className={labelClass}>
            User-agent
            <input
              className={inputClass}
              value={userAgent}
              onChange={(e) => {
                setUserAgent(e.target.value.replace(/[\r\n]/g, ""));
                setCopied(false);
              }}
              placeholder="* or Googlebot"
            />
            <span className="mt-1 block text-xs font-normal text-slate-500">
              Use * to apply rules to all compliant crawlers.
            </span>
          </label>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Disallow paths
              </h3>

              <button
                type="button"
                onClick={() => addRule("disallow")}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
              >
                + Add path
              </button>
            </div>

            <div className="grid gap-2">
              {disallow.map((rule, i) => (
                <div key={`d-${i}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      updateRule("disallow", i, {
                        enabled: e.target.checked,
                      })
                    }
                    aria-label={`Enable disallow path ${i + 1}`}
                  />

                  <input
                    className={`${inputClass} mt-0`}
                    value={rule.path}
                    onChange={(e) =>
                      updateRule("disallow", i, {
                        path: e.target.value,
                      })
                    }
                    placeholder="/private/"
                    aria-label={`Disallow path ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Allow paths
              </h3>

              <button
                type="button"
                onClick={() => addRule("allow")}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold dark:border-slate-700"
              >
                + Add path
              </button>
            </div>

            <div className="grid gap-2">
              {allow.map((rule, i) => (
                <div key={`a-${i}`} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) =>
                      updateRule("allow", i, {
                        enabled: e.target.checked,
                      })
                    }
                    aria-label={`Enable allow path ${i + 1}`}
                  />

                  <input
                    className={`${inputClass} mt-0`}
                    value={rule.path}
                    onChange={(e) =>
                      updateRule("allow", i, {
                        path: e.target.value,
                      })
                    }
                    placeholder="/public/"
                    aria-label={`Allow path ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <label className={labelClass}>
            Sitemap URL (optional)
            <input
              className={inputClass}
              type="url"
              value={sitemap}
              onChange={(e) => {
                setSitemap(e.target.value);
                setCopied(false);
              }}
              placeholder="https://example.com/sitemap.xml"
            />
          </label>

          <label className={labelClass}>
            Crawl-delay in seconds (optional)
            <input
              className={inputClass}
              inputMode="numeric"
              value={crawlDelay}
              onChange={(e) => {
                setCrawlDelay(e.target.value.replace(/[^0-9.]/g, ""));
                setCopied(false);
              }}
              placeholder="Leave blank unless needed"
            />
          </label>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
          robots.txt requests crawler behavior; it does not secure private
          content or guarantee that a page won&apos;t be indexed. Crawl-delay
          support varies by crawler. Test rules before publishing.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Generated robots.txt
          </h2>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {output.split("\n").filter(Boolean).length} directives
          </span>
        </div>

        <textarea
          aria-label="Generated robots.txt"
          readOnly
          value={output}
          className="mt-4 min-h-[28rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyOutput()}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            {copied ? <Check size={15} /> : <Clipboard size={15} />}
            {copied ? "Copied" : "Copy robots.txt"}
          </button>

          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
          >
            <Download size={15} /> Download robots.txt
          </button>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
          <strong>Publishing tip:</strong> upload the downloaded file to your
          website&apos;s root path, for example{" "}
          <code>https://example.com/robots.txt</code>. Check your site&apos;s
          actual paths and sitemap URL first.
        </div>
      </section>
    </div>
  );
}
