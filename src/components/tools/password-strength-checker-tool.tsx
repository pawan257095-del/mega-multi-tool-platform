"use client";

import { useMemo, useState } from "react";

function evaluate(password: string) {
  if (!password) return { score: 0, label: "Not checked", color: "bg-slate-300", advice: ["Enter a sample password to see a local estimate."] };
  const lower = /[a-z]/.test(password), upper = /[A-Z]/.test(password);
  const digit = /\d/.test(password), symbol = /[^A-Za-z0-9]/.test(password);
  const classes = [lower, upper, digit, symbol].filter(Boolean).length;
  const unique = new Set(password).size;
  const common = /password|qwerty|letmein|admin|welcome|iloveyou|123456|654321|111111|000000/i.test(password);
  const repeated = /(.)\1{3,}/.test(password);
  const sequential = /(abcdefghijklmnopqrstuvwxyz|0123456789|qwertyuiop|asdfghjkl|zxcvbnm)/i.test(password);
  let score = (password.length >= 8 ? 1 : 0) + (password.length >= 12 ? 1 : 0) +
    (password.length >= 16 ? 1 : 0) + (classes >= 2 ? 1 : 0) +
    (classes >= 3 ? 1 : 0) + (classes === 4 ? 1 : 0) +
    (unique >= Math.min(8, password.length) ? 1 : 0);
  if (common) score -= 3;
  if (sequential) score -= 1;
  if (repeated || unique <= Math.max(1, Math.floor(password.length / 3))) score -= 2;
  score = Math.max(0, Math.min(7, score));
  const label = score >= 6 ? "Strong" : score >= 4 ? "Good" : score >= 2 ? "Fair" : "Very weak";
  const color = score >= 6 ? "bg-emerald-500" : score >= 4 ? "bg-lime-500" : score >= 2 ? "bg-amber-500" : "bg-rose-500";
  const advice = [];
  if (password.length < 12) advice.push("Aim for at least 12 characters; longer passphrases are often easier to remember.");
  if (classes < 3) advice.push("Consider a varied passphrase or mix of character types, while prioritizing length and uniqueness.");
  if (common || repeated || sequential) advice.push("Avoid common words, keyboard patterns, sequences, and repeated characters.");
  advice.push("Use a unique password for every account and store it in a reputable password manager.");
  advice.push("Enable multi-factor authentication where available.");
  return { score, label, color, advice };
}

export default function PasswordStrengthCheckerTool() {
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const result = useMemo(() => evaluate(password), [password]);
  const checks = [
    ["At least 12 characters", password.length >= 12],
    ["Uppercase and lowercase letters", /[A-Z]/.test(password) && /[a-z]/.test(password)],
    ["Contains a number", /\d/.test(password)],
    ["Contains a symbol", /[^A-Za-z0-9]/.test(password)],
    ["Avoids long repeated-character runs", !/(.)\1{3,}/.test(password)],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <label htmlFor="psc-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password to check</label>
        <div className="flex gap-2">
          <input id="psc-password" type={visible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" spellCheck={false} placeholder="Enter a sample password" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <button type="button" onClick={() => setVisible(v => !v)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">{visible ? "Hide" : "Show"}</button>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy: this estimate runs in your browser and does not send the entered text to a server. For safety, avoid entering a password you currently use.</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-sm text-slate-500 dark:text-slate-400">Estimated strength</p><h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{result.label}</h2></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{result.score} / 7 points</p>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5" aria-label={`Strength score ${result.score} out of 7`}>
          {Array.from({ length: 7 }, (_, i) => <div key={i} className={`h-2.5 rounded-full ${i < result.score ? result.color : "bg-slate-100 dark:bg-slate-800"}`} />)}
        </div>
        <h3 className="mt-6 text-sm font-semibold text-slate-900 dark:text-white">Checklist</h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {checks.map(([label, passed]) => <li key={label} className="flex items-center gap-2 text-sm"><span className={passed ? "text-emerald-600" : "text-slate-400"}>{passed ? "✓" : "○"}</span><span className="text-slate-700 dark:text-slate-200">{label}</span></li>)}
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">How to improve it</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">{result.advice.map(item => <li key={item}>{item}</li>)}</ul>
      </section>
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">This is a heuristic guide, not a cryptographic audit, breached-password lookup, or reliable crack-time estimate. Prefer long, random, unique passwords or passphrases generated by a password manager.</p>
    </div>
  );
}
