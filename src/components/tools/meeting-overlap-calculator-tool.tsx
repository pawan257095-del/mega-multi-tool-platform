"use client";

import { useMemo, useState } from "react";

type Participant = {
  id: string;
  name: string;
  timeZone: string;
  start: string;
  end: string;
  days: number[];
};

const WEEKDAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

const TIME_ZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "New York (ET)" },
  { value: "America/Chicago", label: "Chicago (CT)" },
  { value: "America/Denver", label: "Denver (MT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PT)" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris / Central Europe" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Singapore", label: "Singapore" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const DEFAULT_PARTICIPANTS: Participant[] = [
  { id: "p1", name: "New York", timeZone: "America/New_York", start: "09:00", end: "17:00", days: [1, 2, 3, 4, 5] },
  { id: "p2", name: "London", timeZone: "Europe/London", start: "09:00", end: "17:00", days: [1, 2, 3, 4, 5] },
  { id: "p3", name: "India", timeZone: "Asia/Kolkata", start: "09:00", end: "17:00", days: [1, 2, 3, 4, 5] },
];

function minutesFromTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function offsetAt(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const label = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = label.match(/GMT([+-])(\d{1,2})(?::?(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3] ?? 0));
}

function zonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekdayMap[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function zonedWallTimeToUtc(dateText: string, timeText: string, timeZone: string) {
  const [year, month, day] = dateText.split("-").map(Number);
  const [hours, minutes] = timeText.split(":").map(Number);
  const targetWallAsUtc = Date.UTC(year, month - 1, day, hours, minutes);
  let candidate = targetWallAsUtc;
  for (let i = 0; i < 4; i += 1) {
    const offset = offsetAt(new Date(candidate), timeZone);
    const next = targetWallAsUtc - offset * 60_000;
    if (next === candidate) break;
    candidate = next;
  }
  return new Date(candidate);
}

function formatInZone(date: Date, timeZone: string, options: Intl.DateTimeFormatOptions = {}) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    ...options,
  }).format(date);
}

function formatOffset(date: Date, timeZone: string) {
  const minutes = offsetAt(date, timeZone);
  const sign = minutes < 0 ? "−" : "+";
  const absolute = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function MeetingOverlapCalculatorTool() {
  const [date, setDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [participants, setParticipants] = useState<Participant[]>(DEFAULT_PARTICIPANTS);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => {
    if (!date || participants.length === 0) return [];
    const first = participants[0];
    const firstStart = minutesFromTime(first.start);
    const firstEnd = minutesFromTime(first.end);
    if (firstEnd <= firstStart) return [];
    const firstStartUtc = zonedWallTimeToUtc(date, first.start, first.timeZone).getTime();
    const firstEndUtc = zonedWallTimeToUtc(date, first.end, first.timeZone).getTime();
    const rangeStart = firstStartUtc - 24 * 60 * 60 * 1000;
    const rangeEnd = firstEndUtc + 24 * 60 * 60 * 1000;
    const matches: { start: Date; end: Date; local: Record<string, { start: string; end: string; offset: string }> }[] = [];
    const step = 15 * 60 * 1000;
    const start = Math.ceil(rangeStart / step) * step;
    for (let candidate = start; candidate + durationMinutes * 60_000 <= rangeEnd; candidate += step) {
      const meetingStart = new Date(candidate);
      const meetingEnd = new Date(candidate + durationMinutes * 60_000);
      const valid = participants.every((participant) => {
        const localStart = zonedDateParts(meetingStart, participant.timeZone);
        const localEnd = zonedDateParts(new Date(meetingEnd.getTime() - 60_000), participant.timeZone);
        if (!participant.days.includes(localStart.weekday) || localStart.weekday !== localEnd.weekday) return false;
        const startMinute = localStart.hour * 60 + localStart.minute;
        const endMinute = localEnd.hour * 60 + localEnd.minute;
        const workStart = minutesFromTime(participant.start);
        const workEnd = minutesFromTime(participant.end);
        return startMinute >= workStart && endMinute <= workEnd;
      });
      if (valid) {
        const local: Record<string, { start: string; end: string; offset: string }> = {};
        participants.forEach((participant) => {
          local[participant.id] = {
            start: formatInZone(meetingStart, participant.timeZone),
            end: formatInZone(meetingEnd, participant.timeZone),
            offset: formatOffset(meetingStart, participant.timeZone),
          };
        });
        matches.push({ start: meetingStart, end: meetingEnd, local });
      }
    }
    // Collapse consecutive 15-minute starts into distinct contiguous windows.
    const unique: typeof matches = [];
    for (const match of matches) {
      if (unique.length === 0 || match.start.getTime() - unique[unique.length - 1].start.getTime() > step) unique.push(match);
    }
    return matches.length ? matches : unique;
  }, [date, durationMinutes, participants]);

  const filteredResults = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return results;
    return results.filter((result) => participants.some((participant) => {
      const local = result.local[participant.id];
      return participant.name.toLowerCase().includes(needle) || (local?.start ?? "").toLowerCase().includes(needle);
    }));
  }, [results, participants, search]);

  const updateParticipant = (id: string, field: keyof Participant, value: string | number | number[]) => {
    setParticipants((current) => current.map((participant) => participant.id === id ? { ...participant, [field]: value } : participant));
  };

  const addParticipant = () => {
    setParticipants((current) => [...current, {
      id: makeId(),
      name: `Participant ${current.length + 1}`,
      timeZone: "Asia/Kolkata",
      start: "09:00",
      end: "17:00",
      days: [1, 2, 3, 4, 5],
    }]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants((current) => current.filter((participant) => participant.id !== id));
  };

  const toggleDay = (id: string, day: number) => {
    setParticipants((current) => current.map((participant) => {
      if (participant.id !== id) return participant;
      const days = participant.days.includes(day) ? participant.days.filter((item) => item !== day) : [...participant.days, day];
      return { ...participant, days };
    }));
  };

  const copyResults = async () => {
    const lines = [
      `Meeting overlap options for ${date} (${durationMinutes} minutes)`,
      ...filteredResults.slice(0, 50).map((result) => [
        `UTC: ${formatInZone(result.start, "UTC")} – ${formatInZone(result.end, "UTC")}`,
        ...participants.map((participant) => `${participant.name}: ${result.local[participant.id]?.start} – ${result.local[participant.id]?.end} (${result.local[participant.id]?.offset})`),
      ].join(" | ")),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
    } catch {
      // Clipboard can be blocked on insecure origins; the results remain visible.
    }
  };

  const validParticipants = participants.every((participant) =>
    participant.name.trim() &&
    participant.days.length > 0 &&
    minutesFromTime(participant.end) > minutesFromTime(participant.start)
  );
  const visibleResults = showAll ? filteredResults : filteredResults.slice(0, 12);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="text-xl font-bold">Meeting Overlap Calculator</h2>
        <p className="mt-1 text-sm text-muted-foreground">Find possible meeting starts that fit everyone’s working hours across time zones.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">
            Meeting date (based on first participant’s local date)
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" />
          </label>
          <label className="block text-sm font-medium">
            Meeting duration
            <select value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              {[15, 30, 45, 60, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes < 60 ? `${minutes} minutes` : `${minutes / 60} hour${minutes === 60 ? "" : "s"}`}</option>)}
            </select>
          </label>
        </div>

        <div className="mt-6 space-y-4">
          {participants.map((participant, index) => (
            <div key={participant.id} className="rounded-xl border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold">Participant {index + 1}</h3>
                <button type="button" onClick={() => removeParticipant(participant.id)} disabled={participants.length <= 1} className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-40">Remove</button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-sm font-medium">
                  Name / city
                  <input value={participant.name} maxLength={60} onChange={(event) => updateParticipant(participant.id, "name", event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" />
                </label>
                <label className="block text-sm font-medium">
                  Time zone
                  <select value={participant.timeZone} onChange={(event) => updateParticipant(participant.id, "timeZone", event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2">
                    {TIME_ZONES.map((zone) => <option key={zone.value} value={zone.value}>{zone.label}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium">
                  Workday starts
                  <input type="time" value={participant.start} onChange={(event) => updateParticipant(participant.id, "start", event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" />
                </label>
                <label className="block text-sm font-medium">
                  Workday ends
                  <input type="time" value={participant.end} onChange={(event) => updateParticipant(participant.id, "end", event.target.value)} className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" />
                </label>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium">Working days</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAYS.map((day) => (
                    <button key={day.value} type="button" aria-pressed={participant.days.includes(day.value)} onClick={() => toggleDay(participant.id, day.value)} className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${participant.days.includes(day.value) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"}`}>
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addParticipant} disabled={participants.length >= 12} className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Add participant ({participants.length}/12)</button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold">Possible meeting windows</h3>
            <p className="mt-1 text-sm text-muted-foreground">Options are sampled in 15-minute increments and shown in each participant’s local time.</p>
          </div>
          <button type="button" onClick={() => { void copyResults(); }} disabled={!results.length} className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-muted disabled:opacity-50">Copy results</button>
        </div>
        {!validParticipants ? (
          <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">Check that every participant has a name, at least one working day, and an end time later than the start time. Overnight work shifts are not supported.</p>
        ) : results.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">No overlap found for these working hours and duration. Try a shorter meeting or adjust a workday.</p>
        ) : (
          <>
            <p className="mt-4 text-sm font-medium">{results.length} candidate start time{results.length === 1 ? "" : "s"} found (15-minute increments).</p>
            <label className="mt-3 block max-w-sm text-sm font-medium">
              Filter by participant or local-time text
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. London or 10:00" className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <div className="mt-4 space-y-3">
              {visibleResults.map((result) => (
                <div key={result.start.toISOString()} className="rounded-xl border border-border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold">UTC: {formatInZone(result.start, "UTC")} – {formatInZone(result.end, "UTC")}</span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{durationMinutes} min</span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {participants.map((participant) => (
                      <div key={participant.id} className="rounded-lg bg-muted/50 p-3">
                        <p className="text-sm font-semibold">{participant.name}</p>
                        <p className="mt-1 text-sm">{result.local[participant.id]?.start}</p>
                        <p className="text-sm text-muted-foreground">to {result.local[participant.id]?.end}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{result.local[participant.id]?.offset}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {filteredResults.length > 12 && (
              <button type="button" onClick={() => setShowAll((current) => !current)} className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted">
                {showAll ? "Show fewer" : `Show all ${filteredResults.length} options`}
              </button>
            )}
          </>
        )}
        <p className="mt-5 text-xs text-muted-foreground">Time-zone offsets are calculated using the browser’s IANA time-zone database, including common daylight-saving rules. Historical or future rule changes, ambiguous daylight-saving transitions, and unusual work schedules may require manual verification. The meeting date is interpreted in the first participant’s time zone.</p>
      </section>
    </div>
  );
}
