
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  Copy,
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from "lucide-react";

type VoiceOption = {
  name: string;
  lang: string;
  voiceURI: string;
  default: boolean;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";

const labelClass =
  "mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200";

export default function TextToSpeechTool() {
  const [text, setText] = useState(
    "Hello! Welcome to the text to speech tool. Enter your own text and press Play to hear it read aloud.",
  );
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [status, setStatus] = useState<"idle" | "speaking" | "paused">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const selectedVoice = useMemo(
    () =>
      voices.find((voice) => voice.voiceURI === voiceURI) ??
      voices.find((voice) => voice.default) ??
      voices[0],
    [voices, voiceURI],
  );

  const wordCount = useMemo(
    () => (text.trim() ? text.trim().split(/\s+/u).length : 0),
    [text],
  );

  const loadVoices = useCallback(() => {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    const list = window.speechSynthesis.getVoices().map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      voiceURI: voice.voiceURI,
      default: voice.default,
    }));

    setVoices(list);
    setVoiceURI((current) =>
      current && list.some((voice) => voice.voiceURI === current)
        ? current
        : (list.find((voice) => voice.default)?.voiceURI ??
          list[0]?.voiceURI ??
          ""),
    );
  }, []);

    useEffect(() => {
    let cancelled = false;
    let listenerAdded = false;

    const initializeSpeech = () => {
      if (cancelled) return;

      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        setSpeechSupported(false);
        return;
      }

      setSpeechSupported(true);
      loadVoices();

      window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
      listenerAdded = true;
    };

    const timer = window.setTimeout(initializeSpeech, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);

      if (listenerAdded && "speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          loadVoices,
        );
        window.speechSynthesis.cancel();
      }
    };
  }, [loadVoices]);

  const stop = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    setStatus("idle");
  }, []);

  function speak() {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      setMessage("Text-to-speech is not supported in this browser.");
      return;
    }

    const value = text.trim();

    if (!value) {
      setMessage("Enter some text before playing.");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(value);

    if (selectedVoice) {
      utterance.voice =
        window.speechSynthesis
          .getVoices()
          .find((voice) => voice.voiceURI === selectedVoice.voiceURI) ??
        null;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => {
      setStatus("speaking");
      setMessage("");
    };

    utterance.onend = () => setStatus("idle");

    utterance.onerror = (event) => {
      setStatus("idle");

      if (
        event.error !== "canceled" &&
        event.error !== "interrupted"
      ) {
        setMessage(
          `Speech playback could not start (${event.error}). Try another voice or browser.`,
        );
      }
    };

    window.speechSynthesis.speak(utterance);
    setStatus("speaking");
    setMessage("");
  }

  function pauseOrResume() {
    if (
      typeof window === "undefined" ||
      !("speechSynthesis" in window)
    ) {
      return;
    }

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setStatus("speaking");
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setStatus("paused");
    }
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setMessage(
        "Clipboard access was blocked. Select the text and copy it manually.",
      );
    }
  }

  function reset() {
    stop();
    setText("");
    setRate(1);
    setPitch(1);
    setVolume(1);
    setMessage("");
    setCopied(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your script
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Paste or type up to 10,000 characters.
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

        <label htmlFor="tts-text" className={`${labelClass} mt-5`}>
          Text to read aloud
        </label>

        <textarea
          id="tts-text"
          value={text}
          maxLength={10000}
          onChange={(event) => {
            setText(event.target.value);
            setMessage("");
            setCopied(false);
          }}
          rows={10}
          placeholder="Type or paste your text here…"
          className={`${inputClass} resize-y leading-7`}
        />

        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{text.length.toLocaleString()} / 10,000 characters</span>
          <span>{wordCount.toLocaleString()} words</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={speak}
            disabled={!text.trim() || !speechSupported}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={16} fill="currentColor" />
            Play speech
          </button>

          <button
            type="button"
            onClick={pauseOrResume}
            disabled={status === "idle"}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {status === "paused" ? (
              <Play size={16} />
            ) : (
              <Pause size={16} />
            )}
            {status === "paused" ? "Resume" : "Pause"}
          </button>

          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <Square size={15} />
            Stop
          </button>

          <button
            type="button"
            onClick={copyText}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy text"}
          </button>
        </div>

        {!speechSupported && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          >
            Text-to-speech is not supported in this browser. Try a recent
            version of Chrome, Edge, Safari, or Firefox.
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
          >
            {message}
          </p>
        )}

        <div className="mt-5 rounded-xl bg-violet-50 p-4 dark:bg-violet-950/40">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-900 dark:text-violet-200">
            <Volume2 size={17} />
            Playback status
          </div>
          <p className="mt-1 text-sm text-violet-800 dark:text-violet-300">
            {status === "speaking"
              ? "Speaking…"
              : status === "paused"
                ? "Paused. Resume when you're ready."
                : "Ready to read your text aloud."}
          </p>
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Voice settings
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Available voices depend on your operating system and browser.
          </p>

          <label htmlFor="tts-voice" className={`${labelClass} mt-5`}>
            Voice ({voices.length} available)
          </label>

          <select
            id="tts-voice"
            value={voiceURI}
            onChange={(event) => setVoiceURI(event.target.value)}
            className={inputClass}
            disabled={voices.length === 0}
          >
            {voices.length === 0 ? (
              <option value="">No voices detected yet</option>
            ) : (
              voices.map((voice) => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} — {voice.lang}
                  {voice.default ? " (default)" : ""}
                </option>
              ))
            )}
          </select>

          <button
            type="button"
            onClick={loadVoices}
            className="mt-2 text-xs font-semibold text-violet-700 hover:underline dark:text-violet-300"
          >
            Refresh available voices
          </button>

          <div className="mt-6 space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="tts-rate"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Speech speed
                </label>
                <span className="text-sm tabular-nums text-slate-500">
                  {rate.toFixed(1)}×
                </span>
              </div>
              <input
                id="tts-rate"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Slower</span>
                <span>Faster</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="tts-pitch"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Pitch
                </label>
                <span className="text-sm tabular-nums text-slate-500">
                  {pitch.toFixed(1)}
                </span>
              </div>
              <input
                id="tts-pitch"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(event) => setPitch(Number(event.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Lower</span>
                <span>Higher</span>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="tts-volume"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Volume
                </label>
                <span className="text-sm tabular-nums text-slate-500">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <input
                id="tts-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
                className="w-full accent-violet-600"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>Quiet</span>
                <span>Loud</span>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Important notes
          </h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <li>
              Uses the browser&apos;s built-in speech synthesis; no external
              API key is needed.
            </li>
            <li>
              Voices and language options vary by device. Install or enable
              additional system voices to expand the list.
            </li>
            <li>
              This tool plays speech but does not export an MP3 or WAV
              recording.
            </li>
            <li>
              Playback may be interrupted if you navigate away from this
              page.
            </li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
