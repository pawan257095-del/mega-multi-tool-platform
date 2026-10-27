"use client";

import { useMemo, useState } from "react";

const zones: { label: string; zone: string }[] = [
  { label: "New Delhi, India", zone: "Asia/Kolkata" },
  { label: "London, United Kingdom", zone: "Europe/London" },
  { label: "New York, USA", zone: "America/New_York" },
  { label: "Los Angeles, USA", zone: "America/Los_Angeles" },
  { label: "Chicago, USA", zone: "America/Chicago" },
  { label: "Toronto, Canada", zone: "America/Toronto" },
  { label: "Vancouver, Canada", zone: "America/Vancouver" },
  { label: "Paris, France", zone: "Europe/Paris" },
  { label: "Berlin, Germany", zone: "Europe/Berlin" },
  { label: "Dubai, UAE", zone: "Asia/Dubai" },
  { label: "Singapore", zone: "Asia/Singapore" },
  { label: "Tokyo, Japan", zone: "Asia/Tokyo" },
  { label: "Sydney, Australia", zone: "Australia/Sydney" },
  { label: "Auckland, New Zealand", zone: "Pacific/Auckland" },
  { label: "São Paulo, Brazil", zone: "America/Sao_Paulo" },
  { label: "Johannesburg, South Africa", zone: "Africa/Johannesburg" },
  { label: "UTC", zone: "UTC" },
];

function formatDateTime(value: string, zone: string, includeZone = true): string {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZoneName: includeZone ? "short" : undefined,
  }).format(date);
}

function getOffset(date: Date, zone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    timeZoneName: "longOffset",
    hour: "2-digit",
  }).formatToParts(date);
  return parts.find((part) => part.type === "timeZoneName")?.value.replace("GMT", "UTC") ?? "UTC";
}

function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function TimeZoneConverterTool() {
  const [dateTime, setDateTime] = useState(() => toLocalInputValue(new Date()));
  const [sourceZone, setSourceZone] = useState("Asia/Kolkata");
  const [targetZone, setTargetZone] = useState("America/New_York");
  const [copyStatus, setCopyStatus] = useState("");

  const converted = useMemo(() => {
    if (!dateTime) return null;
    const [datePart, timePart] = dateTime.split("T");
    if (!datePart || !timePart) return null;
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;

    // Interpret the input wall-clock time in the selected source zone.
    // Iterative Intl-based offset correction handles ordinary DST offsets without external APIs.
    const desiredUTC = Date.UTC(year, month - 1, day, hour, minute);
    let instant = desiredUTC;
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: sourceZone, year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    });
    for (let i = 0; i < 4; i++) {
      const parts = Object.fromEntries(formatter.formatToParts(new Date(instant)).map((part) => [part.type, part.value]));
      const observedUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
      const correction = desiredUTC - observedUTC;
      instant += correction;
      if (correction === 0) break;
    }
    const resultDate = new Date(instant);
    const sourceFormatted = formatDateTime(resultDate.toISOString(), sourceZone);
    const targetFormatted = formatDateTime(resultDate.toISOString(), targetZone);
    return {
      instant: resultDate,
      sourceFormatted,
      targetFormatted,
      sourceOffset: getOffset(resultDate, sourceZone),
      targetOffset: getOffset(resultDate, targetZone),
    };
  }, [dateTime, sourceZone, targetZone]);

  async function copyResult() {
    if (!converted) return;
    const text = `Time Zone Conversion\n${zones.find((z) => z.zone === sourceZone)?.label ?? sourceZone}: ${converted.sourceFormatted} (${converted.sourceOffset})\n${zones.find((z) => z.zone === targetZone)?.label ?? targetZone}: ${converted.targetFormatted} (${converted.targetOffset})\nUTC instant: ${converted.instant.toISOString()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Conversion copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Select the conversion text and copy it manually.");
    }
  }

  function swapZones() {
    setSourceZone(targetZone);
    setTargetZone(sourceZone);
    setCopyStatus("");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Convert a date and time</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose a source time zone and a destination. The entered clock time is interpreted in the source zone.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tz-datetime" className="mb-1 block text-sm font-medium">Date and time in source zone</label>
            <input id="tz-datetime" type="datetime-local" value={dateTime} onChange={(e) => { setDateTime(e.target.value); setCopyStatus(""); }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
          </div>
          <div className="flex items-end">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Daylight-saving rules are supplied by the browser’s IANA time-zone database. Times inside DST transition gaps or repeated hours can be ambiguous.</p>
          </div>
          <div>
            <label htmlFor="tz-source" className="mb-1 block text-sm font-medium">From</label>
            <select id="tz-source" value={sourceZone} onChange={(e) => { setSourceZone(e.target.value); setCopyStatus(""); }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              {zones.map((zone) => <option key={zone.zone} value={zone.zone}>{zone.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="tz-target" className="mb-1 block text-sm font-medium">To</label>
            <select id="tz-target" value={targetZone} onChange={(e) => { setTargetZone(e.target.value); setCopyStatus(""); }}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              {zones.map((zone) => <option key={zone.zone} value={zone.zone}>{zone.label}</option>)}
            </select>
          </div>
        </div>
        <button type="button" onClick={swapZones} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium dark:border-slate-600">⇄ Swap time zones</button>
      </section>

      {converted && <section className="rounded-xl border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950/30" aria-live="polite">
        <h3 className="font-semibold">Converted time</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{zones.find((z) => z.zone === sourceZone)?.label}</p>
            <p className="mt-2 text-xl font-bold">{converted.sourceFormatted}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{converted.sourceOffset}</p>
          </div>
          <div className="rounded-lg border border-sky-200 bg-white p-4 dark:border-sky-900 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{zones.find((z) => z.zone === targetZone)?.label}</p>
            <p className="mt-2 text-xl font-bold">{converted.targetFormatted}</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{converted.targetOffset}</p>
          </div>
        </div>
        <p className="mt-3 break-all text-xs text-slate-500 dark:text-slate-400">UTC instant: {converted.instant.toISOString()}</p>
        <button type="button" onClick={() => void copyResult()} className="mt-4 rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700">Copy conversion</button>
        {copyStatus && <p role="status" className="mt-3 text-sm text-slate-600 dark:text-slate-300">{copyStatus}</p>}
      </section>}
    </div>
  );
}
