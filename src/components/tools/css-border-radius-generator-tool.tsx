
"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

export default function CssBorderRadiusGeneratorTool() {
  const [linked, setLinked] = useState(true);
  const [all, setAll] = useState(24);
  const [tl, setTl] = useState(24);
  const [tr, setTr] = useState(24);
  const [br, setBr] = useState(24);
  const [bl, setBl] = useState(24);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [copied, setCopied] = useState(false);

  const values = useMemo(
    () => (linked ? [all, all, all, all] : [tl, tr, br, bl]),
    [linked, all, tl, tr, br, bl],
  );

  const css = `border-radius: ${values
    .map((value) => `${value}${unit}`)
    .join(" ")};`;

  function updateCorner(index: number, value: number) {
    const setters = [setTl, setTr, setBr, setBl];
    setters[index](value);
    setCopied(false);
  }

  function reset() {
    setLinked(true);
    setAll(24);
    setTl(24);
    setTr(24);
    setBr(24);
    setBl(24);
    setUnit("px");
    setCopied(false);
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const corners = [
    { label: "Top-left", value: tl },
    { label: "Top-right", value: tr },
    { label: "Bottom-right", value: br },
    { label: "Bottom-left", value: bl },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Border radius settings
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Link all corners for uniform rounding, or customize each corner
              independently.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} />
            Reset
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            <input
              type="checkbox"
              checked={linked}
              onChange={(event) => {
                setLinked(event.target.checked);
                setCopied(false);
              }}
              className="h-4 w-4 accent-violet-600"
            />
            Link all corners
          </label>

          <div className="flex items-center gap-2">
            <label
              htmlFor="radius-unit"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Unit
            </label>
            <select
              id="radius-unit"
              value={unit}
              onChange={(event) => {
                setUnit(event.target.value as "px" | "%");
                setCopied(false);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="px">Pixels (px)</option>
              <option value="%">Percent (%)</option>
            </select>
          </div>
        </div>

        {linked ? (
          <div className="mt-5">
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
              <span>All corners</span>
              <span className="font-mono text-violet-600 dark:text-violet-300">
                {all}
                {unit}
              </span>
            </label>

            <input
              aria-label="All corners radius"
              type="range"
              min="0"
              max={unit === "%" ? 50 : 200}
              value={all}
              onChange={(event) => {
                setAll(Number(event.target.value));
                setCopied(false);
              }}
              className="mt-3 w-full accent-violet-600"
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {corners.map((corner, index) => (
              <div key={corner.label}>
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200">
                  <span>{corner.label}</span>
                  <span className="font-mono text-violet-600 dark:text-violet-300">
                    {corner.value}
                    {unit}
                  </span>
                </label>

                <input
                  aria-label={`${corner.label} radius`}
                  type="range"
                  min="0"
                  max={unit === "%" ? 50 : 200}
                  value={corner.value}
                  onChange={(event) =>
                    updateCorner(index, Number(event.target.value))
                  }
                  className="mt-3 w-full accent-violet-600"
                />
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Percent values are relative to the element&apos;s dimensions. Very
          large values may be normalized by the browser.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Live preview
        </h2>

        <div className="mt-4 flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-950">
          <div
            className="flex h-44 w-64 max-w-full items-center justify-center border-4 border-violet-300 bg-gradient-to-br from-violet-100 to-sky-100 text-center text-sm font-semibold text-slate-700 shadow-lg dark:border-violet-700 dark:from-violet-950 dark:to-sky-950 dark:text-slate-100"
            style={{
              borderRadius: values.map((value) => `${value}${unit}`).join(" "),
            }}
          >
            Your rounded element
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            CSS code
          </h3>

          <button
            type="button"
            onClick={() => void copyCss()}
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied CSS" : "Copy CSS"}
          </button>
        </div>

        <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300">
          <code>{css}</code>
        </pre>

        {!copied && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            If clipboard access is blocked, select the CSS above and copy it
            manually.
          </p>
        )}
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        All settings, preview rendering, and CSS generation run locally in your
        browser.
      </p>
    </div>
  );
}
