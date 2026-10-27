"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "focus" | "shortBreak" | "longBreak";

const PHASE_LABELS: Record<Phase, string> = {
  focus: "Focus session",
  shortBreak: "Short break",
  longBreak: "Long break",
};

const PHASE_COLORS: Record<Phase, string> = {
  focus: "bg-indigo-600",
  shortBreak: "bg-emerald-600",
  longBreak: "bg-sky-600",
};

function formatTime(totalSeconds: number) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PomodoroTimerTool() {
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  const [phase, setPhase] = useState<Phase>("focus");
  const [completedSessions, setCompletedSessions] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const endTimeRef = useRef<number | null>(null);
  const remainingRef = useRef(25 * 60);
  const phaseRef = useRef<Phase>("focus");
  const completedRef = useRef(0);

  const durationFor = useCallback((target: Phase, focus = focusMinutes, shortBreak = shortBreakMinutes, longBreak = longBreakMinutes) => {
    if (target === "focus") return focus * 60;
    if (target === "shortBreak") return shortBreak * 60;
    return longBreak * 60;
  }, [focusMinutes, shortBreakMinutes, longBreakMinutes]);

  const notify = useCallback((title: string, body: string) => {
    if (notificationsEnabled && typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  }, [notificationsEnabled]);

  const moveToPhase = useCallback((nextPhase: Phase, nextRemaining?: number) => {
    const next = nextRemaining ?? durationFor(nextPhase);
    phaseRef.current = nextPhase;
    remainingRef.current = next;
    endTimeRef.current = null;
    setPhase(nextPhase);
    setRemainingSeconds(next);
    setIsRunning(false);
    setMessage(`${PHASE_LABELS[nextPhase]} ready. Press Start when you're ready.`);
  }, [durationFor]);

  const completeCurrentPhase = useCallback(() => {
    const current = phaseRef.current;
    if (current === "focus") {
      const nextCompleted = completedRef.current + 1;
      completedRef.current = nextCompleted;
      setCompletedSessions(nextCompleted);
      notify("Focus session complete", `Great work! You have completed ${nextCompleted} focus session${nextCompleted === 1 ? "" : "s"}.`);
      const nextPhase: Phase = nextCompleted % sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak";
      moveToPhase(nextPhase);
    } else {
      notify("Break complete", "Your break is over. Ready for another focus session?");
      moveToPhase("focus");
    }
  }, [moveToPhase, notify, sessionsBeforeLongBreak]);

  useEffect(() => {
    if (!isRunning) return;
    if (endTimeRef.current === null) {
      endTimeRef.current = Date.now() + remainingRef.current * 1000;
    }
    const interval = window.setInterval(() => {
      const end = endTimeRef.current;
      if (end === null) return;
      const nextRemaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      remainingRef.current = nextRemaining;
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) {
        window.clearInterval(interval);
        endTimeRef.current = null;
        completeCurrentPhase();
      }
    }, 250);
    return () => window.clearInterval(interval);
  }, [isRunning, completeCurrentPhase]);

  useEffect(() => {
    if (phase === "focus") remainingRef.current = remainingSeconds;
  }, [remainingSeconds, phase]);

  const start = () => {
    if (remainingRef.current <= 0) remainingRef.current = durationFor(phase);
    endTimeRef.current = Date.now() + remainingRef.current * 1000;
    setRemainingSeconds(remainingRef.current);
    setIsRunning(true);
    setMessage(`${PHASE_LABELS[phase]} in progress. Stay focused!`);
  };

  const pause = () => {
    if (endTimeRef.current !== null) {
      remainingRef.current = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setRemainingSeconds(remainingRef.current);
    }
    endTimeRef.current = null;
    setIsRunning(false);
    setMessage("Timer paused. Resume whenever you're ready.");
  };

  const reset = () => {
    endTimeRef.current = null;
    remainingRef.current = durationFor(phase);
    setRemainingSeconds(remainingRef.current);
    setIsRunning(false);
    setMessage("Timer reset.");
  };

  const skip = () => {
    if (phase === "focus") {
      const nextPhase: Phase = (completedSessions + 1) % sessionsBeforeLongBreak === 0 ? "longBreak" : "shortBreak";
      moveToPhase(nextPhase);
    } else {
      moveToPhase("focus");
    }
  };

  const updateDuration = (which: Phase, value: number) => {
    const safeValue = Math.min(120, Math.max(1, value || 1));
    if (which === "focus") setFocusMinutes(safeValue);
    if (which === "shortBreak") setShortBreakMinutes(safeValue);
    if (which === "longBreak") setLongBreakMinutes(safeValue);
    if (phase === which && !isRunning) {
      remainingRef.current = safeValue * 60;
      setRemainingSeconds(safeValue * 60);
    }
  };

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      setMessage("This browser does not support notifications.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      setMessage("Browser notifications enabled for this page.");
    } else {
      setNotificationsEnabled(false);
      setMessage("Notifications were not enabled. You can still use the timer normally.");
    }
  };

  const totalSeconds = durationFor(phase);
  const progress = Math.min(100, Math.max(0, ((totalSeconds - remainingSeconds) / Math.max(1, totalSeconds)) * 100));

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pomodoro Timer</p>
            <h2 className="mt-1 text-2xl font-bold">{PHASE_LABELS[phase]}</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Work in focused intervals, then take a deliberate break. Your timer runs in this browser tab.
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold text-white ${PHASE_COLORS[phase]}`}>
            {isRunning ? "Running" : "Paused"}
          </span>
        </div>

        <div className="mx-auto mt-8 max-w-md text-center">
          <div className="font-mono text-6xl font-bold tracking-tight tabular-nums sm:text-7xl" aria-live="off">
            {formatTime(remainingSeconds)}
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
            <div className={`h-full transition-[width] duration-200 ${PHASE_COLORS[phase]}`} style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{Math.round(progress)}% elapsed</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {!isRunning ? (
              <button type="button" onClick={start} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                Start
              </button>
            ) : (
              <button type="button" onClick={pause} className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90">
                Pause
              </button>
            )}
            <button type="button" onClick={reset} className="rounded-xl border border-border px-5 py-3 font-semibold hover:bg-muted">Reset</button>
            <button type="button" onClick={skip} className="rounded-xl border border-border px-5 py-3 font-semibold hover:bg-muted">Skip phase</button>
          </div>
          <p className="mt-4 min-h-5 text-sm text-muted-foreground" role="status">{message}</p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-semibold">Timer settings</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choose a duration between 1 and 120 minutes. Changes apply when the selected phase is not running.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm font-medium">
              Focus (min)
              <input type="number" min={1} max={120} value={focusMinutes} disabled={isRunning && phase === "focus"} onChange={(e) => updateDuration("focus", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Short break
              <input type="number" min={1} max={120} value={shortBreakMinutes} disabled={isRunning && phase === "shortBreak"} onChange={(e) => updateDuration("shortBreak", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Long break
              <input type="number" min={1} max={120} value={longBreakMinutes} disabled={isRunning && phase === "longBreak"} onChange={(e) => updateDuration("longBreak", Number(e.target.value))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" />
            </label>
          </div>
          <label className="mt-4 block text-sm font-medium">
            Focus sessions before long break
            <select value={sessionsBeforeLongBreak} onChange={(e) => setSessionsBeforeLongBreak(Math.min(12, Math.max(2, Number(e.target.value))))} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2">
              {[2, 3, 4, 5, 6, 8, 10, 12].map((count) => <option key={count} value={count}>{count} sessions</option>)}
            </select>
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-lg font-semibold">Session progress</h3>
          <p className="mt-1 text-sm text-muted-foreground">Completed focus sessions in this visit.</p>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-5xl font-bold tabular-nums">{completedSessions}</span>
            <span className="pb-1 text-sm text-muted-foreground">completed focus sessions</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: sessionsBeforeLongBreak }, (_, index) => (
              <span key={index} className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${index < completedSessions % sessionsBeforeLongBreak ? "border-emerald-600 bg-emerald-600 text-white" : "border-border text-muted-foreground"}`}>
                {index + 1}
              </span>
            ))}
          </div>
          <button type="button" onClick={enableNotifications} className="mt-6 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-muted">
            {notificationsEnabled ? "Notifications enabled" : "Enable browser notifications"}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">Notifications are optional and require browser permission. Keep this page open; browser power-saving may affect timing in the background.</p>
        </div>
      </section>
    </div>
  );
}
