"use client";

import { useMemo, useState } from "react";

type Method = "lmp" | "conception";

function parseDate(value: string): Date | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(date);
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()) -
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())) / 86400000);
}

export default function PregnancyDueDateCalculatorTool() {
  const [method, setMethod] = useState<Method>("lmp");
  const [dateValue, setDateValue] = useState("");
  const [cycleLength, setCycleLength] = useState("28");
  const [asOfValue, setAsOfValue] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });

  const result = useMemo(() => {
    const inputDate = parseDate(dateValue);
    const asOf = parseDate(asOfValue);
    const cycle = Number(cycleLength);
    if (!inputDate || !asOf || inputDate.getTime() > asOf.getTime()) return null;
    if (method === "lmp" && (!Number.isInteger(cycle) || cycle < 20 || cycle > 45)) return null;

    // Standard estimate: 280 days from LMP; conception estimate adds 266 days.
    const dueDate = method === "lmp"
      ? addDays(inputDate, 280 + (cycle - 28))
      : addDays(inputDate, 266);
    const gestationalStart = method === "lmp" ? inputDate : addDays(inputDate, -14);
    const elapsed = daysBetween(gestationalStart, asOf);
    if (elapsed < 0) return null;
    return {
      dueDate,
      weeks: Math.floor(elapsed / 7),
      days: elapsed % 7,
      daysRemaining: daysBetween(asOf, dueDate),
      elapsed,
    };
  }, [method, dateValue, cycleLength, asOfValue]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="pregnancy-method">Calculation method</label>
          <select id="pregnancy-method" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={method} onChange={(e) => { setMethod(e.target.value as Method); setDateValue(""); }}>
            <option value="lmp">First day of last menstrual period (LMP)</option>
            <option value="conception">Known / estimated conception date</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="pregnancy-date">{method === "lmp" ? "First day of last menstrual period" : "Conception date"}</label>
          <input id="pregnancy-date" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="date" value={dateValue} max={asOfValue || undefined} onChange={(e) => setDateValue(e.target.value)} />
          <p className="mt-1 text-xs text-muted-foreground">{method === "lmp" ? "Standard estimate is 280 days from LMP." : "The calculator estimates 266 days from conception."}</p>
        </div>
        {method === "lmp" && <div>
          <label className="block text-sm font-medium" htmlFor="cycle-length">Typical menstrual cycle length (20–45 days)</label>
          <input id="cycle-length" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="20" max="45" step="1" value={cycleLength} onChange={(e) => setCycleLength(e.target.value)} />
          <p className="mt-1 text-xs text-muted-foreground">Used to adjust the estimate from the standard 28-day cycle.</p>
        </div>}
        <div>
          <label className="block text-sm font-medium" htmlFor="pregnancy-asof">Calculate gestational age as of</label>
          <input id="pregnancy-asof" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="date" value={asOfValue} onChange={(e) => setAsOfValue(e.target.value)} />
        </div>
      </section>

      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter a valid date that is not in the future, a valid calculation date, and (for LMP) a cycle length from 20 to 45 days.</p>
      ) : (
        <section className="space-y-3">
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Estimated due date</p>
            <p className="mt-2 text-2xl font-semibold">{formatDate(result.dueDate)}</p>
            <p className="mt-2 text-sm text-muted-foreground">An estimate, not a prediction of the exact birth date.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated gestational age</p><p className="mt-2 text-2xl font-semibold">{result.weeks} weeks, {result.days} days</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Days until estimated due date</p><p className="mt-2 text-2xl font-semibold">{result.daysRemaining < 0 ? `${Math.abs(result.daysRemaining)} days past estimate` : `${result.daysRemaining} days`}</p></div>
          </div>
        </section>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Health note:</strong> This calculator provides a rough date estimate using standard calendar rules. Cycle variation, uncertain dates, and individual circumstances can change the result. An ultrasound and advice from a qualified pregnancy-care professional may provide a more accurate assessment. Do not use this estimate for medical decisions or to determine whether a pregnancy is healthy.
      </aside>
    </div>
  );
}
