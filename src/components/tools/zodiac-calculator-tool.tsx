"use client";

import { useMemo, useState } from "react";

type ZodiacSign = {
  name: string;
  symbol: string;
  start: string;
  end: string;
  element: string;
  description: string;
};

const signs: ZodiacSign[] = [
  { name: "Capricorn", symbol: "♑", start: "12-22", end: "01-19", element: "Earth", description: "Traditionally associated with patience, discipline, and long-term goals." },
  { name: "Aquarius", symbol: "♒", start: "01-20", end: "02-18", element: "Air", description: "Traditionally associated with originality, curiosity, and independent thinking." },
  { name: "Pisces", symbol: "♓", start: "02-19", end: "03-20", element: "Water", description: "Traditionally associated with imagination, empathy, and creativity." },
  { name: "Aries", symbol: "♈", start: "03-21", end: "04-19", element: "Fire", description: "Traditionally associated with initiative, energy, and boldness." },
  { name: "Taurus", symbol: "♉", start: "04-20", end: "05-20", element: "Earth", description: "Traditionally associated with steadiness, comfort, and persistence." },
  { name: "Gemini", symbol: "♊", start: "05-21", end: "06-20", element: "Air", description: "Traditionally associated with adaptability, conversation, and curiosity." },
  { name: "Cancer", symbol: "♋", start: "06-21", end: "07-22", element: "Water", description: "Traditionally associated with care, intuition, and a sense of home." },
  { name: "Leo", symbol: "♌", start: "07-23", end: "08-22", element: "Fire", description: "Traditionally associated with warmth, confidence, and self-expression." },
  { name: "Virgo", symbol: "♍", start: "08-23", end: "09-22", element: "Earth", description: "Traditionally associated with observation, organization, and practicality." },
  { name: "Libra", symbol: "♎", start: "09-23", end: "10-22", element: "Air", description: "Traditionally associated with balance, diplomacy, and aesthetics." },
  { name: "Scorpio", symbol: "♏", start: "10-23", end: "11-21", element: "Water", description: "Traditionally associated with intensity, focus, and transformation." },
  { name: "Sagittarius", symbol: "♐", start: "11-22", end: "12-21", element: "Fire", description: "Traditionally associated with exploration, optimism, and a love of learning." },
];

function getSign(date: string): ZodiacSign | null {
  if (!date) return null;
  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return signs.find((sign) => {
    if (sign.name === "Capricorn") return key >= "12-22" || key <= "01-19";
    return key >= sign.start && key <= sign.end;
  }) ?? null;
}

function prettyDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long", day: "numeric", timeZone: "UTC",
  });
}

export default function ZodiacCalculatorTool() {
  const [birthDate, setBirthDate] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const sign = useMemo(() => getSign(birthDate), [birthDate]);
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  async function copyResult() {
    if (!sign || !birthDate) return;
    const text = `${sign.symbol} ${sign.name} (${prettyDate(sign.start) } – ${prettyDate(sign.end)})\nElement: ${sign.element}\n${sign.description}\nWestern sun-sign dates are approximate and for entertainment only.`;
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Zodiac result copied.");
    } catch {
      setCopyStatus("Clipboard access was blocked. Select the result text and copy it manually.");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Find your sun sign</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Choose your birth date to find its commonly used Western zodiac sun sign.
        </p>
        <div className="mt-5 max-w-sm">
          <label htmlFor="zodiac-birth-date" className="mb-1 block text-sm font-medium">Date of birth</label>
          <input id="zodiac-birth-date" type="date" value={birthDate} max={todayISO} onChange={(e) => { setBirthDate(e.target.value); setCopyStatus(""); }}
            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" />
        </div>
      </section>

      {sign && birthDate && <section className="rounded-xl border border-violet-200 bg-violet-50 p-6 dark:border-violet-900 dark:bg-violet-950/30" aria-live="polite">
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-5">
          <div className="text-6xl" aria-hidden="true">{sign.symbol}</div>
          <div className="mt-3 sm:mt-0">
            <p className="text-sm font-medium text-violet-700 dark:text-violet-300">Your Western zodiac sun sign</p>
            <h3 className="mt-1 text-3xl font-bold">{sign.name}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{prettyDate(sign.start)} – {prettyDate(sign.end)} · {sign.element} element</p>
            <p className="mt-4 text-sm leading-6">{sign.description}</p>
          </div>
        </div>
        <div className="mt-5 flex justify-center sm:justify-start">
          <button type="button" onClick={() => void copyResult()} className="rounded-lg border border-violet-300 bg-white px-4 py-2 text-sm font-semibold text-violet-700 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-300">Copy result</button>
        </div>
        {copyStatus && <p role="status" className="mt-3 text-center text-sm text-slate-600 dark:text-slate-300 sm:text-left">{copyStatus}</p>}
      </section>}

      <aside className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
        <p className="font-semibold">About this result</p>
        <p className="mt-1">This tool uses common approximate Western tropical zodiac date ranges. Dates can vary slightly by source and year, especially near sign boundaries; a precise astrological chart may require birth time and location. Zodiac descriptions are traditional cultural interpretations, not scientifically validated personality assessments.</p>
      </aside>
    </div>
  );
}
