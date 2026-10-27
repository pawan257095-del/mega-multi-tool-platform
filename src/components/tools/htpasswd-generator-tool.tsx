"use client";

import { useState } from "react";

type HashMode = "bcrypt" | "sha1" | "md5";

export default function HtpasswdGeneratorTool() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<HashMode>("bcrypt");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError("");
    setResult("");
    setCopied(false);
    if (!username.trim() || username.includes(":") || /[\r\n]/.test(username)) {
      setError("Enter a username without colons or line breaks.");
      return;
    }
    if (!password) {
      setError("Enter a password to hash.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/htpasswd-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, mode }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || "Hash generation is not available.");
      setResult(String(payload.entry || ""));
      if (!payload.entry) throw new Error("The server did not return a generated entry.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate the entry.");
    } finally {
      setLoading(false);
    }
  }

  async function copyResult() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
    } catch {
      setError("Clipboard access failed. Select and copy the generated entry manually.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="htp-username" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Username</label>
            <input id="htp-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" placeholder="alice" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="htp-mode" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Hash format</label>
            <select id="htp-mode" value={mode} onChange={(e) => setMode(e.target.value as HashMode)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white">
              <option value="bcrypt">bcrypt (recommended)</option>
              <option value="sha1">SHA-1 crypt format (legacy)</option>
              <option value="md5">APR1-MD5 (legacy)</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label htmlFor="htp-password" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Password</label>
          <div className="flex gap-2">
            <input id="htp-password" type={visible ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Enter a strong password" className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
            <button type="button" onClick={() => setVisible(v => !v)} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">{visible ? "Hide" : "Show"}</button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={generate} disabled={loading || !username.trim() || !password} className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Generating…" : "Generate htpasswd entry"}</button>
          <button type="button" onClick={() => { setUsername(""); setPassword(""); setResult(""); setError(""); setCopied(false); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200">Clear</button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">{error}</p>}
        {result && <div className="mt-5 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <label htmlFor="htp-result" className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Generated entry</label>
          <textarea id="htp-result" value={result} readOnly rows={3} className="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white" />
          <button type="button" onClick={copyResult} className="mt-3 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Copy entry</button>
          {copied && <span className="ml-3 text-sm text-emerald-600 dark:text-emerald-400">Copied.</span>}
        </div>}
      </section>
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="font-semibold text-amber-950 dark:text-amber-200">Security notes</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-amber-900 dark:text-amber-100">
          <li>Hashing is performed by the server using bcrypt (cost 12), Apache SHA format, or APR1-MD5. The password is sent only in the HTTPS POST body to your own server; never deploy this tool without HTTPS.</li>
          <li>Never put passwords in URLs, logs, source code, or public repositories.</li>
          <li>SHA-1 crypt and APR1-MD5 are legacy formats; use bcrypt where your Apache setup supports it.</li>
          <li>Use HTTPS and protect the generated file and server configuration.</li>
        </ul>
      </section>
    </div>
  );
}
