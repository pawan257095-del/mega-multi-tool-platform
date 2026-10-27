
"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";

type Effect = "fade" | "pulse" | "bounce" | "slide" | "spin" | "zoom";
type Timing =
  | "ease"
  | "linear"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "cubic-bezier(0.68, -0.55, 0.27, 1.55)";
type Direction = "normal" | "reverse" | "alternate" | "alternate-reverse";
type FillMode = "none" | "forwards" | "backwards" | "both";

const defaults = {
  effect: "bounce" as Effect,
  duration: 1.2,
  delay: 0,
  iterations: 1,
  infinite: false,
  timing: "ease-in-out" as Timing,
  direction: "normal" as Direction,
  fill: "both" as FillMode,
};

const keyframes: Record<Effect, string> = {
  fade: `@keyframes generated-animation {
  from { opacity: 0; }
  to { opacity: 1; }
}`,
  pulse: `@keyframes generated-animation {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.12); }
}`,
  bounce: `@keyframes generated-animation {
  0%, 100% { transform: translateY(0); }
  35% { transform: translateY(-32px); }
  55% { transform: translateY(0); }
  72% { transform: translateY(-12px); }
  88% { transform: translateY(0); }
}`,
  slide: `@keyframes generated-animation {
  from { transform: translateX(-70px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}`,
  spin: `@keyframes generated-animation {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`,
  zoom: `@keyframes generated-animation {
  from { transform: scale(0.65); opacity: 0.25; }
  to { transform: scale(1); opacity: 1; }
}`,
};

export default function CssAnimationGeneratorTool() {
  const [values, setValues] = useState(defaults);
  const [copied, setCopied] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const css = `${keyframes[values.effect]}

.animated-element {
  animation-name: generated-animation;
  animation-duration: ${values.duration}s;
  animation-delay: ${values.delay}s;
  animation-timing-function: ${values.timing};
  animation-iteration-count: ${values.infinite ? "infinite" : values.iterations};
  animation-direction: ${values.direction};
  animation-fill-mode: ${values.fill};
}`;

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
    setReplayKey((value) => value + 1);
  }

  async function copyCss() {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const labelClass =
    "text-sm font-medium text-slate-700 dark:text-slate-200";

  const selectClass =
    "mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100";

  const rangeClass = "mt-3 w-full accent-violet-600";

  const animationStyle = {
    animationName: "generated-animation",
    animationDuration: `${values.duration}s`,
    animationDelay: `${values.delay}s`,
    animationTimingFunction: values.timing,
    animationIterationCount: values.infinite
      ? ("infinite" as const)
      : values.iterations,
    animationDirection: values.direction,
    animationFillMode: values.fill,
    animationPlayState: "running" as const,
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Animation controls
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Choose an effect and customize how it plays.
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

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="animation-effect" className={labelClass}>
              Keyframe effect
            </label>
            <select
              id="animation-effect"
              className={selectClass}
              value={values.effect}
              onChange={(event) =>
                update("effect", event.target.value as Effect)
              }
            >
              {(
                ["fade", "pulse", "bounce", "slide", "spin", "zoom"] as Effect[]
              ).map((option) => (
                <option key={option} value={option}>
                  {option[0].toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="animation-timing" className={labelClass}>
              Timing function
            </label>
            <select
              id="animation-timing"
              className={selectClass}
              value={values.timing}
              onChange={(event) =>
                update("timing", event.target.value as Timing)
              }
            >
              {(
                [
                  "ease",
                  "linear",
                  "ease-in",
                  "ease-out",
                  "ease-in-out",
                  "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
                ] as Timing[]
              ).map((option) => (
                <option key={option} value={option}>
                  {option ===
                  "cubic-bezier(0.68, -0.55, 0.27, 1.55)"
                    ? "Spring-like cubic-bezier"
                    : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="animation-direction" className={labelClass}>
              Direction
            </label>
            <select
              id="animation-direction"
              className={selectClass}
              value={values.direction}
              onChange={(event) =>
                update("direction", event.target.value as Direction)
              }
            >
              {(
                [
                  "normal",
                  "reverse",
                  "alternate",
                  "alternate-reverse",
                ] as Direction[]
              ).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="animation-fill" className={labelClass}>
              Fill mode
            </label>
            <select
              id="animation-fill"
              className={selectClass}
              value={values.fill}
              onChange={(event) =>
                update("fill", event.target.value as FillMode)
              }
            >
              {(["none", "forwards", "backwards", "both"] as FillMode[]).map(
                (option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label htmlFor="animation-duration" className={labelClass}>
              Duration{" "}
              <span className="font-mono text-violet-600 dark:text-violet-300">
                {values.duration.toFixed(1)}s
              </span>
            </label>
            <input
              id="animation-duration"
              className={rangeClass}
              type="range"
              min="0.2"
              max="5"
              step="0.1"
              value={values.duration}
              onChange={(event) =>
                update("duration", Number(event.target.value))
              }
            />
          </div>

          <div>
            <label htmlFor="animation-delay" className={labelClass}>
              Delay{" "}
              <span className="font-mono text-violet-600 dark:text-violet-300">
                {values.delay.toFixed(1)}s
              </span>
            </label>
            <input
              id="animation-delay"
              className={rangeClass}
              type="range"
              min="0"
              max="3"
              step="0.1"
              value={values.delay}
              onChange={(event) =>
                update("delay", Number(event.target.value))
              }
            />
          </div>

          <div>
            <label htmlFor="animation-iterations" className={labelClass}>
              Iterations{" "}
              <span className="font-mono text-violet-600 dark:text-violet-300">
                {values.iterations}
              </span>
            </label>
            <input
              id="animation-iterations"
              className={rangeClass}
              type="range"
              min="1"
              max="10"
              value={values.iterations}
              disabled={values.infinite}
              onChange={(event) =>
                update("iterations", Number(event.target.value))
              }
            />
          </div>

          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-3 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                className="h-4 w-4 accent-violet-600"
                checked={values.infinite}
                onChange={(event) =>
                  update("infinite", event.target.checked)
                }
              />
              Loop infinitely
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Live preview
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The preview restarts when you change an animation setting.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReplayKey((value) => value + 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
          >
            Replay preview
          </button>
        </div>

        <style>{keyframes[values.effect]}</style>

        <div className="mt-5 flex min-h-64 items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-950">
          <div
            key={`${replayKey}-${values.effect}-${values.duration}-${values.delay}-${values.timing}-${values.direction}-${values.fill}-${values.infinite}-${values.iterations}`}
            style={animationStyle}
            className="flex h-28 w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-3xl font-black text-white shadow-xl"
          >
            CSS
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
        Preview and CSS generation run locally in your browser. No data is
        uploaded. Some animations may be affected by your operating system&apos;s
        reduced-motion preferences.
      </p>
    </div>
  );
}
