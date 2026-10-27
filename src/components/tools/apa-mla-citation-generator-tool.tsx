"use client";

import { useMemo, useState } from "react";

type Style = "apa" | "mla";
type SourceType = "book" | "journal" | "website";

function clean(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function authorParts(raw: string): string[] {
  return raw.split(";").map(clean).filter(Boolean);
}

function formatApaAuthors(raw: string): string {
  const authors = authorParts(raw);
  if (!authors.length) return "";
  const formatted = authors.map((author) => {
    const pieces = author.split(/\s+/);
    if (pieces.length === 1) return pieces[0];
    const surname = pieces.pop()!;
    const initials = pieces.map((part) => `${part[0]?.toUpperCase() ?? ""}.`).join(" ");
    return `${surname}, ${initials}`;
  });
  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  if (formatted.length <= 20) return `${formatted.slice(0, -1).join(", ")}, & ${formatted[formatted.length - 1]}`;
  return `${formatted.slice(0, 19).join(", ")}, … ${formatted[formatted.length - 1]}`;
}

function formatMlaAuthors(raw: string): string {
  const authors = authorParts(raw);
  if (!authors.length) return "";
  if (authors.length === 1) {
    const parts = authors[0].split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts.pop()!;
    return `${last}, ${parts.join(" ")}`;
  }
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`;
  const parts = authors[0].split(/\s+/);
  const last = parts.pop()!;
  return `${last}, ${parts.join(" ")}, et al.`;
}

function sentenceCase(value: string): string {
  const text = clean(value);
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}

function titleCaseMla(value: string): string {
  const minor = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on", "or", "per", "the", "to", "up", "via", "with"]);
  return clean(value).split(" ").map((word, index) => {
    if (index > 0 && minor.has(word.toLowerCase())) return word.toLowerCase();
    return word ? word[0].toUpperCase() + word.slice(1) : word;
  }).join(" ");
}

function punctuation(value: string): string {
  const v = clean(value);
  if (!v) return "";
  return /[.!?]$/.test(v) ? v : `${v}.`;
}

export default function ApaMlaCitationGeneratorTool() {
  const [style, setStyle] = useState<Style>("apa");
  const [sourceType, setSourceType] = useState<SourceType>("website");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [container, setContainer] = useState("");
  const [publisher, setPublisher] = useState("");
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [url, setUrl] = useState("");
  const [accessDate, setAccessDate] = useState("");
  const [doi, setDoi] = useState("");

  const citations = useMemo(() => {
    const apaAuthors = formatApaAuthors(authors);
    const mlaAuthors = formatMlaAuthors(authors);
    const safeYear = clean(year) || "n.d.";
    const cleanTitle = clean(title);
    const cleanContainer = clean(container);
    const cleanPublisher = clean(publisher);
    const cleanUrl = clean(url);
    const cleanDoi = clean(doi);
    const cleanVolume = clean(volume);
    const cleanIssue = clean(issue);
    const cleanPages = clean(pages);

    let apa = "";
    let mla = "";
    if (sourceType === "book") {
      apa = [
        apaAuthors,
        `(${safeYear}).`,
        cleanTitle ? `${cleanTitle}.` : "",
        cleanPublisher ? `${cleanPublisher}.` : "",
        cleanDoi ? cleanDoi.startsWith("http") ? cleanDoi : `https://doi.org/${cleanDoi}` : "",
      ].filter(Boolean).join(" ");
      mla = [
        mlaAuthors ? `${mlaAuthors}.` : "",
        cleanTitle ? `${titleCaseMla(cleanTitle)}.` : "",
        cleanPublisher ? `${cleanPublisher},` : "",
        safeYear !== "n.d." ? `${safeYear}.` : "",
        cleanDoi ? cleanDoi.startsWith("http") ? cleanDoi : `https://doi.org/${cleanDoi}.` : "",
      ].filter(Boolean).join(" ").replace(/,\s+\./g, ".");
    } else if (sourceType === "journal") {
      const apaJournal = [
        cleanContainer ? `${cleanContainer},` : "",
        cleanVolume ? cleanIssue ? `${cleanVolume}(${cleanIssue}),` : `${cleanVolume},` : "",
        cleanPages ? `${cleanPages}.` : "",
      ].filter(Boolean).join(" ");
      const mlaJournal = [
        cleanContainer ? `${cleanContainer},` : "",
        cleanVolume ? `vol. ${cleanVolume},` : "",
        cleanIssue ? `no. ${cleanIssue},` : "",
        safeYear !== "n.d." ? `${safeYear},` : "",
        cleanPages ? `pp. ${cleanPages}.` : "",
      ].filter(Boolean).join(" ").replace(/,\s+\./g, ".");
      apa = [apaAuthors, `(${safeYear}).`, cleanTitle ? `${sentenceCase(cleanTitle)}.` : "", apaJournal, cleanDoi ? cleanDoi.startsWith("http") ? cleanDoi : `https://doi.org/${cleanDoi}` : ""].filter(Boolean).join(" ");
      mla = [mlaAuthors ? `${mlaAuthors}.` : "", cleanTitle ? `"${titleCaseMla(cleanTitle)}."` : "", mlaJournal, cleanDoi ? cleanDoi.startsWith("http") ? `${cleanDoi}.` : `https://doi.org/${cleanDoi}.` : ""].filter(Boolean).join(" ");
    } else {
      const apaDate = safeYear === "n.d." ? "(n.d.)." : `(${safeYear}).`;
      apa = [
        apaAuthors,
        apaDate,
        cleanTitle ? `${sentenceCase(cleanTitle)}.` : "",
        cleanContainer ? `${cleanContainer}.` : "",
        cleanUrl || cleanDoi ? (cleanDoi ? cleanDoi.startsWith("http") ? cleanDoi : `https://doi.org/${cleanDoi}` : cleanUrl) : "",
      ].filter(Boolean).join(" ");
      mla = [
        mlaAuthors ? `${mlaAuthors}.` : "",
        cleanTitle ? `"${titleCaseMla(cleanTitle)}."` : "",
        cleanContainer ? `${cleanContainer},` : "",
        cleanPublisher ? `${cleanPublisher},` : "",
        safeYear !== "n.d." ? `${safeYear},` : "",
        cleanUrl || cleanDoi ? `${cleanDoi ? cleanDoi.startsWith("http") ? cleanDoi : `https://doi.org/${cleanDoi}` : cleanUrl}.` : "",
        accessDate ? `Accessed ${clean(accessDate)}.` : "",
      ].filter(Boolean).join(" ").replace(/,\s+\./g, ".");
    }

    const firstAuthor = authorParts(authors)[0] || "Author";
    const apaSurname = firstAuthor.split(/\s+/).slice(-1)[0].replace(/[.,]/g, "");
    const mlaSurname = firstAuthor.split(/\s+/).slice(-1)[0].replace(/[.,]/g, "");
    const inTextApa = `(${apaSurname}, ${safeYear})`;
    const inTextMla = `(${mlaSurname}${pages ? ` ${cleanPages}` : ""})`;
    return { apa: punctuation(apa), mla: punctuation(mla), inTextApa, inTextMla };
  }, [style, sourceType, authors, year, title, container, publisher, volume, issue, pages, url, accessDate, doi]);

  const reference = style === "apa" ? citations.apa : citations.mla;
  const inText = style === "apa" ? citations.inTextApa : citations.inTextMla;
  const inputClass = "w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700";
  const labelClass = "mb-1.5 block text-sm font-medium";

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); } catch { /* Keep output selectable if clipboard is unavailable. */ }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-semibold">Source details</h2>
          <p className="mt-1 text-sm text-slate-500">Use semicolons between multiple author names. Enter author names as First Last.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="citation-style">Citation style</label>
            <select id="citation-style" value={style} onChange={(e) => setStyle(e.target.value as Style)} className={inputClass}>
              <option value="apa">APA 7th edition</option><option value="mla">MLA 9th edition</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="citation-source-type">Source type</label>
            <select id="citation-source-type" value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)} className={inputClass}>
              <option value="website">Web page</option><option value="book">Book</option><option value="journal">Journal article</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="citation-authors">Author(s)</label>
          <input id="citation-authors" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="e.g. Ada Lovelace; Alan Turing" className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="citation-year">Publication year</label>
            <input id="citation-year" value={year} onChange={(e) => setYear(e.target.value)} placeholder="e.g. 2024" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="citation-title">Title</label>
            <input id="citation-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Source title" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="citation-container">{sourceType === "journal" ? "Journal name" : "Website / container title"}</label>
          <input id="citation-container" value={container} onChange={(e) => setContainer(e.target.value)} placeholder={sourceType === "journal" ? "e.g. Journal of Computing" : "e.g. Example Organization"} className={inputClass} />
        </div>
        {sourceType !== "journal" && (
          <div>
            <label className={labelClass} htmlFor="citation-publisher">Publisher (optional)</label>
            <input id="citation-publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} placeholder="Publisher name" className={inputClass} />
          </div>
        )}
        {sourceType === "journal" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label className={labelClass} htmlFor="citation-volume">Volume</label><input id="citation-volume" value={volume} onChange={(e) => setVolume(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass} htmlFor="citation-issue">Issue</label><input id="citation-issue" value={issue} onChange={(e) => setIssue(e.target.value)} className={inputClass} /></div>
            <div><label className={labelClass} htmlFor="citation-pages">Pages</label><input id="citation-pages" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="12–24" className={inputClass} /></div>
          </div>
        )}
        {sourceType !== "book" && (
          <div>
            <label className={labelClass} htmlFor="citation-url">URL</label>
            <input id="citation-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" className={inputClass} />
          </div>
        )}
        {sourceType === "website" && (
          <div>
            <label className={labelClass} htmlFor="citation-access-date">Access date (mainly for MLA when needed)</label>
            <input id="citation-access-date" value={accessDate} onChange={(e) => setAccessDate(e.target.value)} placeholder="e.g. 25 Oct. 2026" className={inputClass} />
          </div>
        )}
        <div>
          <label className={labelClass} htmlFor="citation-doi">DOI (optional)</label>
          <input id="citation-doi" value={doi} onChange={(e) => setDoi(e.target.value)} placeholder="10.xxxx/example or https://doi.org/…" className={inputClass} />
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Reference entry</h2><p className="text-sm text-slate-500">{style === "apa" ? "APA 7th edition (basic format)" : "MLA 9th edition (basic format)"}</p></div>
            <button type="button" onClick={() => copy(reference)} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Copy</button>
          </div>
          <p className="min-h-28 whitespace-pre-wrap break-words text-sm leading-7">{reference || "Add source details to generate a citation."}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="text-lg font-semibold">In-text citation</h2><p className="text-sm text-slate-500">Basic parenthetical form</p></div>
            <button type="button" onClick={() => copy(inText)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">Copy</button>
          </div>
          <p className="font-mono text-lg">{inText}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
          <strong>Check before submitting:</strong> This generator creates a basic draft from the details you enter. It does not verify source metadata or cover every citation edge case. Review the official APA or MLA handbook and your institution’s requirements.
        </div>
      </section>
    </div>
  );
}
