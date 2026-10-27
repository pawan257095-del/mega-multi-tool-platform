"use client";

import { useEffect, useRef, useState } from "react";
import { AlarmClock, Flag, Pause, Play, RotateCcw, Timer, Watch } from "lucide-react";

type Mode = "stopwatch" | "countdown";
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
function formatTime(ms: number, tenths = true) {
  const safe = Math.max(0, Math.floor(ms));
  const totalTenths = Math.floor(safe / 100);
  const minutes = Math.floor(totalTenths / 600);
  const seconds = Math.floor(totalTenths / 10) % 60;
  const tenth = totalTenths % 10;
  const hours = Math.floor(minutes / 60);
  const mm = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(seconds).padStart(2, "0")}${tenths ? `.${tenth}` : ""}`;
}

export default function StopwatchCountdownTimerTool() {
  const [mode, setMode] = useState<Mode>("stopwatch");
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [minutesText, setMinutesText] = useState("5");
  const [secondsText, setSecondsText] = useState("0");
  const [countdownRemaining, setCountdownRemaining] = useState(300_000);
  const [laps, setLaps] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const startedAtRef = useRef<number | null>(null);
  const baseElapsedRef = useRef(0);
  const deadlineRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    const update = () => {
      if (mode === "stopwatch") {
        const startedAt = startedAtRef.current;
        if (startedAt !== null) setElapsed(baseElapsedRef.current + (Date.now() - startedAt));
      } else {
        const deadline = deadlineRef.current;
        if (deadline !== null) {
          const remaining = Math.max(0, deadline - Date.now());
          setCountdownRemaining(remaining);
          if (remaining <= 0) {
            setRunning(false);
            deadlineRef.current = null;
            setMessage("Countdown finished.");
          }
        }
      }
    };
    update();
    const id = window.setInterval(update, 50);
    return () => window.clearInterval(id);
  }, [running, mode]);

  const display = mode === "stopwatch" ? elapsed : countdownRemaining;
  const inputDuration = () => {
    const mins = Number(minutesText), secs = Number(secondsText);
    if (!Number.isInteger(mins) || mins < 0 || mins > 1439) throw new Error("Minutes must be a whole number between 0 and 1,439.");
    if (!Number.isInteger(secs) || secs < 0 || secs > 59) throw new Error("Seconds must be a whole number between 0 and 59.");
    const duration = (mins * 60 + secs) * 1000;
    if (duration < 1000) throw new Error("Set a countdown of at least one second.");
    return duration;
  };

  function startPause() {
    setError(""); setMessage("");
    if (running) {
      if (mode === "stopwatch") {
        const startedAt = startedAtRef.current;
        if (startedAt !== null) baseElapsedRef.current += Date.now() - startedAt;
        startedAtRef.current = null;
        setElapsed(baseElapsedRef.current);
      } else {
        const deadline = deadlineRef.current;
        if (deadline !== null) setCountdownRemaining(Math.max(0, deadline - Date.now()));
        deadlineRef.current = null;
      }
      setRunning(false); setMessage("Timer paused."); return;
    }
    if (mode === "stopwatch") {
      startedAtRef.current = Date.now();
      baseElapsedRef.current = elapsed;
      setRunning(true); setMessage("Stopwatch running.");
    } else {
      let remaining = countdownRemaining;
      if (remaining <= 0) {
        try { remaining = inputDuration(); setCountdownRemaining(remaining); }
        catch (e) { setError(e instanceof Error ? e.message : "Enter a valid duration."); return; }
      }
      deadlineRef.current = Date.now() + remaining;
      setRunning(true); setMessage("Countdown running.");
    }
  }

  function reset() {
    setRunning(false); startedAtRef.current = null; deadlineRef.current = null; baseElapsedRef.current = 0;
    setElapsed(0); setLaps([]); setMessage(""); setError("");
    try { setCountdownRemaining(inputDuration()); } catch { setCountdownRemaining(300_000); }
  }

  function chooseMode(next: Mode) {
    setRunning(false); startedAtRef.current = null; deadlineRef.current = null; baseElapsedRef.current = 0;
    setMode(next); setElapsed(0); setLaps([]); setError(""); setMessage("");
    if (next === "countdown") {
      try { setCountdownRemaining(inputDuration()); } catch { setCountdownRemaining(300_000); }
    }
  }

  function setCountdownFromFields() {
    setError(""); setMessage("");
    try {
      const duration = inputDuration();
      setRunning(false); deadlineRef.current = null; setCountdownRemaining(duration); setMessage("Countdown duration updated.");
    } catch (e) { setError(e instanceof Error ? e.message : "Enter a valid duration."); }
  }

  function addLap() {
    if (!running || mode !== "stopwatch") return;
    const startedAt = startedAtRef.current;
    const current = startedAt === null ? elapsed : baseElapsedRef.current + (Date.now() - startedAt);
    setElapsed(current); setLaps((prev) => [current, ...prev]); setMessage(`Lap ${laps.length + 1} recorded.`);
  }

  async function copyTime() {
    try { await navigator.clipboard.writeText(formatTime(display, false)); setMessage("Time copied to clipboard."); }
    catch { setMessage(`Current time: ${formatTime(display, false)}. Clipboard access was blocked; copy it manually.`); }
  }

  return <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => chooseMode("stopwatch")} aria-pressed={mode === "stopwatch"} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${mode === "stopwatch" ? "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><Watch size={17}/> Stopwatch</button>
        <button type="button" onClick={() => chooseMode("countdown")} aria-pressed={mode === "countdown"} className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold ${mode === "countdown" ? "border-violet-600 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`}><AlarmClock size={17}/> Countdown</button>
      </div>
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-10 text-center dark:border-slate-700 dark:bg-slate-950/60">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{mode === "stopwatch" ? "Elapsed time" : countdownRemaining <= 0 ? "Time is up" : "Time remaining"}</p>
        <p aria-live="off" className={`mt-3 font-mono text-4xl font-bold tracking-tight tabular-nums sm:text-6xl ${mode === "countdown" && countdownRemaining === 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>{formatTime(display)}</p>
        <p className="mt-3 text-xs text-slate-500">{running ? "Running" : display > 0 && (elapsed > 0 || countdownRemaining !== 300_000) ? "Paused / ready" : "Ready"}</p>
      </div>
      {mode === "countdown" && <div className="mt-5 grid grid-cols-2 gap-3"><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minutes<input type="number" min="0" max="1439" step="1" value={minutesText} disabled={running} onChange={(e) => setMinutesText(e.target.value)} className={inputClass}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-300">Seconds<input type="number" min="0" max="59" step="1" value={secondsText} disabled={running} onChange={(e) => setSecondsText(e.target.value)} className={inputClass}/></label><button type="button" disabled={running} onClick={setCountdownFromFields} className="col-span-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200">Set countdown</button></div>}
      <div className="mt-5 grid grid-cols-2 gap-3"><button type="button" onClick={startPause} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700">{running ? <><Pause size={17}/> Pause</> : <><Play size={17}/> {mode === "stopwatch" && elapsed > 0 ? "Resume" : mode === "countdown" && countdownRemaining > 0 && countdownRemaining !== 300_000 ? "Start / Resume" : "Start"}</>}</button><button type="button" onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={16}/> Reset</button></div>
      {mode === "stopwatch" && <button type="button" disabled={!running} onClick={addLap} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"><Flag size={16}/> Record lap</button>}
      <button type="button" onClick={copyTime} className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Copy displayed time</button>
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {message && <p role="status" className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">{message}</p>}
      <p className="mt-4 text-xs leading-5 text-slate-500">Timing uses the device clock and updates while this page is open. Browser throttling, device sleep, or leaving the page can affect visual updates; this is not a certified timing instrument.</p>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Lap history</h2><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">{laps.length} lap{laps.length === 1 ? "" : "s"}</span></div>
      {mode !== "stopwatch" ? <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50"><AlarmClock size={30} className="text-slate-400"/><p className="mt-3 text-sm text-slate-500">Switch to Stopwatch to record lap splits.</p></div> : !laps.length ? <div className="mt-5 flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/50"><Timer size={30} className="text-slate-400"/><p className="mt-3 text-sm text-slate-500">Start the stopwatch and record laps to see them here.</p></div> : <ol className="mt-5 max-h-[28rem] space-y-2 overflow-auto">{laps.map((lap, index) => <li key={`${index}-${lap}`} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 dark:border-slate-700"><span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lap {laps.length - index}</span><span className="font-mono text-lg font-semibold tabular-nums text-slate-900 dark:text-white">{formatTime(lap)}</span></li>)}</ol>}
    </section>
  </div>;
}
