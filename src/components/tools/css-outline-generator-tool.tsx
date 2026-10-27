
"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

const defaults = {
  width: 4,
  style: "solid",
  color: "#8b5cf6",
  offset: 5,
  radius: 16,
};

type OutlineStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge"
  | "inset"
  | "outset";

export default function CssOutlineGeneratorTool() {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);

  const css = `.outlined-element {\n  outline: ${values.width}px ${values.style} ${values.color};\n  outline-offset: ${values.offset}px;\n  border-radius: ${values.radius}px;\n}`;

  function update<K extends keyof typeof defaults>(
    key: K,
    value: (typeof defaults)[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setCopied(false);
  }

  function reset() {
    setValues(defaults);
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

  const controls: {
    key: "width" | "offset" | "radius";
    label: string;
    min: number;
    max: number;
    unit: string;
  }[] = [
    { key: "width", label: "Outline width", min: 0, max: 20, unit: "px" },
    { key: "offset", label: "Outline offset", min: -10, max: 30, unit: "px" },
    {
      key: "radius",
      label: "Preview corner radius",
      min: 0,
      max: 48,
      unit: "px",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Outline controls
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Change the outline appearance and spacing around the sample
              element.
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw size={15} /> Reset
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {controls.map((item) => (
            <div key={item.key}>
              <label
                htmlFor={`outline-${item.key}`}
                className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-200"
              >
                <span>{item.label}</span>
                <span className="font-mono text-violet-600 dark:text-violet-300">
                  {values[item.key]}
                  {item.unit}
                </span>
              </label>

              <input
                id={`outline-${item.key}`}
                className="mt-3 w-full accent-violet-600"
                type="range"
                min={item.min}
                max={item.max}
                value={values[item.key]}
                onChange={(e) =>
                  update(item.key, Number(e.target.value))
                }
              />
            </div>
          ))}

          <div>
            <label
              htmlFor="outline-style"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Outline style
            </label>

            <select
              id="outline-style"
              value={values.style}
              onChange={(e) =>
                update("style", e.target.value as OutlineStyle)
              }
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              {(
                [
                  "solid",
                  "dashed",
                  "dotted",
                  "double",
                  "groove",
                  "ridge",
                  "inset",
                  "outset",
                ] as OutlineStyle[]
              ).map((style) => (
                <option key={style} value={style}>
                  {style}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="outline-color"
              className="text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Outline color
            </label>

            <div className="mt-3 flex items-center gap-3">
              <input
                id="outline-color"
                aria-label="Outline color"
                type="color"
                value={values.color}
                onChange={(e) => update("color", e.target.value)}
                className="h-11 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"
              />

              <input
                aria-label="Outline HEX color"
                value={values.color}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) {
                    update("color", e.target.value);
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 font-mono text-sm uppercase text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                maxLength={7}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Live preview
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          The outline sits outside the element&apos;s border and does not take
          up layout space.
        </p>

        <div className="mt-8 flex min-h-64 items-center justify-center overflow-auto rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 dark:border-slate-700 dark:bg-slate-950">
          <div
            style={{
              outline: `${values.width}px ${values.style} ${values.color}`,
              outlineOffset: `${values.offset}px`,
              borderRadius: `${values.radius}px`,
            }}
            className="flex min-h-36 w-full max-w-md items-center justify-center border border-slate-200 bg-white px-5 py-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                Outline Preview
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Adjust the controls to try different styles.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Generated CSS
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
      </section>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        All preview and CSS generation runs locally in your browser. No data is
        uploaded.
      </p>
    </div>
  );
}
