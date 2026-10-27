"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileAudio, LoaderCircle, Music2, Play, RefreshCw, Scissors, Square, Upload } from "lucide-react";

const inputClass = "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const MAX_FILE_BYTES = 100 * 1024 * 1024;

type AudioBufferLike = AudioBuffer;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.00";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds - minutes * 60;
  return `${minutes}:${remaining.toFixed(2).padStart(5, "0")}`;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
}

function encodeWav(buffer: AudioBufferLike, startSeconds: number, endSeconds: number) {
  const sampleRate = buffer.sampleRate;
  const start = Math.max(0, Math.min(buffer.length, Math.floor(startSeconds * sampleRate)));
  const end = Math.max(start + 1, Math.min(buffer.length, Math.floor(endSeconds * sampleRate)));
  const frameCount = end - start;
  const channels = Math.min(buffer.numberOfChannels, 2);
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const dataSize = frameCount * blockAlign;
  const bytes = new ArrayBuffer(44 + dataSize);
  const view = new DataView(bytes);
  const writeText = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
  writeText(0, "RIFF"); view.setUint32(4, 36 + dataSize, true); writeText(8, "WAVE");
  writeText(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, channels, true); view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); writeText(36, "data"); view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let frame = start; frame < end; frame++) {
    for (let channel = 0; channel < channels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[frame]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += bytesPerSample;
    }
  }
  return new Blob([bytes], { type: "audio/wav" });
}

export default function AudioTrimmerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("0");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [outputBytes, setOutputBytes] = useState(0);
  const [outputDuration, setOutputDuration] = useState(0);
  const [playingTrim, setPlayingTrim] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBufferLike | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const outputUrlRef = useRef("");
  const sourceUrlRef = useRef("");

  useEffect(() => () => {
    sourceRef.current?.stop();
    if (audioContextRef.current && audioContextRef.current.state !== "closed") void audioContextRef.current.close();
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
  }, []);

  function stopPreview() {
    if (sourceRef.current) {
      sourceRef.current.onended = null;
      try { sourceRef.current.stop(); } catch { /* Already stopped. */ }
      sourceRef.current.disconnect(); sourceRef.current = null;
    }
    setPlayingTrim(false);
  }

  function clearOutput() {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = ""; setOutputUrl(""); setOutputBytes(0); setOutputDuration(0);
  }

  async function chooseFile(next?: File) {
    setError(""); setStatus(""); stopPreview(); clearOutput(); bufferRef.current = null;
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current); sourceUrlRef.current = ""; setSourceUrl("");
    setFile(null); setDuration(0); setStart("0"); setEnd("0");
    if (!next) return;
    if (next.size === 0) { setError("The selected file is empty."); return; }
    if (next.size > MAX_FILE_BYTES) { setError("This browser tool accepts audio files up to 100 MB. Try a smaller file."); return; }
    if (!next.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|oga|flac|webm)$/i.test(next.name)) { setError("Choose a supported audio file, such as MP3, WAV, M4A, OGG, FLAC or WebM audio."); return; }
    setBusy(true); setStatus("Reading audio locally…");
    try {
      const AudioContextConstructor = window.AudioContext;
      const context = new AudioContextConstructor();
      audioContextRef.current = context;
      const decoded = await context.decodeAudioData(await next.arrayBuffer());
      bufferRef.current = decoded; setFile(next); const sourceUrlNext = URL.createObjectURL(next); sourceUrlRef.current = sourceUrlNext; setSourceUrl(sourceUrlNext); setDuration(decoded.duration); setStart("0"); setEnd(decoded.duration.toFixed(2));
      setStatus("Audio loaded. Choose the start and end times for your clip.");
    } catch {
      setError("This audio format could not be decoded by your browser. Try converting it to WAV or MP3 first.");
      setStatus("");
    } finally { setBusy(false); }
  }

  function validateSelection() {
    const from = Number(start), to = Number(end);
    if (!bufferRef.current || !Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to <= from || to > duration) {
      setError(`Enter a valid range: start must be at least 0, end must be greater than start and no more than ${duration.toFixed(2)} seconds.`); return null;
    }
    if (to - from < 0.05) { setError("Choose a clip at least 0.05 seconds long."); return null; }
    return { from, to };
  }

  async function previewTrim() {
    setError("");
    const range = validateSelection(); if (!range || !bufferRef.current) return;
    stopPreview();
    try {
      const context = audioContextRef.current;
      if (!context) throw new Error("Audio context is unavailable.");
      if (context.state === "suspended") await context.resume();
      const source = context.createBufferSource(); source.buffer = bufferRef.current; source.connect(context.destination);
      source.onended = () => { if (sourceRef.current === source) { sourceRef.current = null; setPlayingTrim(false); } };
      sourceRef.current = source; setPlayingTrim(true); source.start(0, range.from, range.to - range.from);
    } catch (caught) { setPlayingTrim(false); setError(caught instanceof Error ? caught.message : "Could not preview this selection."); }
  }

  function exportTrim() {
    setError(""); const range = validateSelection(); const buffer = bufferRef.current;
    if (!range || !buffer || !file) return;
    try {
      stopPreview(); clearOutput();
      const blob = encodeWav(buffer, range.from, range.to);
      const url = URL.createObjectURL(blob); outputUrlRef.current = url;
      setOutputUrl(url); setOutputBytes(blob.size); setOutputDuration(range.to - range.from);
      setStatus("Trim complete. Your WAV clip is ready to preview and download.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Could not export the selected audio."); }
  }

  function reset() {
    stopPreview(); clearOutput(); bufferRef.current = null; if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current); sourceUrlRef.current = ""; setSourceUrl(""); setFile(null); setDuration(0); setStart("0"); setEnd("0"); setError(""); setStatus("");
    if (inputRef.current) inputRef.current.value = "";
  }

  const selectedDuration = Number(end) - Number(start);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Scissors size={22} /></span>
          <div><h2 className="font-semibold text-slate-900 dark:text-white">Choose an audio file</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">Trim music, voice recordings or sound effects into a short clip or ringtone. The file stays in your browser.</p></div>
        </div>
        <label htmlFor="audio-trimmer-file" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200">Audio file (maximum 100 MB)</label>
        <input ref={inputRef} id="audio-trimmer-file" type="file" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm" disabled={busy} onChange={(event) => void chooseFile(event.target.files?.[0])} className="sr-only" />
        <label htmlFor="audio-trimmer-file" className={`mt-2 flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/70 px-4 py-5 text-center transition hover:border-violet-500 hover:bg-violet-50 focus-within:ring-2 focus-within:ring-violet-500 dark:border-violet-800 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 ${busy ? "pointer-events-none opacity-60" : ""}`}><span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"><Upload size={20}/></span><span className="text-sm font-semibold text-violet-800 dark:text-violet-200">{file ? "Choose a different audio file" : "Tap here to upload an audio file"}</span><span className="mt-1 text-xs text-slate-600 dark:text-slate-300">Click to browse files · MP3, WAV, M4A and more · Up to 100 MB</span></label>
        {file && <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><FileAudio className="shrink-0 text-violet-600" size={22} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{file.name}</p><p className="text-xs text-slate-500">{formatBytes(file.size)} · {formatTime(duration)}</p></div></div>}
        {file && <>
          <audio controls preload="metadata" src={sourceUrl} className="mt-4 w-full" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="trim-start" className="text-sm font-medium text-slate-700 dark:text-slate-200">Start time (seconds)</label><input id="trim-start" type="number" min="0" max={duration} step="0.01" value={start} onChange={(event) => { setStart(event.target.value); setError(""); clearOutput(); }} className={inputClass} /></div>
            <div><label htmlFor="trim-end" className="text-sm font-medium text-slate-700 dark:text-slate-200">End time (seconds)</label><input id="trim-end" type="number" min="0" max={duration} step="0.01" value={end} onChange={(event) => { setEnd(event.target.value); setError(""); clearOutput(); }} className={inputClass} /></div>
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><div className="flex items-center justify-between gap-3 text-sm"><span className="text-slate-600 dark:text-slate-300">Selected clip length</span><strong className="text-slate-900 dark:text-white">{Number.isFinite(selectedDuration) && selectedDuration > 0 ? formatTime(selectedDuration) : "—"}</strong></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600" style={{ width: `${duration > 0 && selectedDuration > 0 ? Math.min(100, selectedDuration / duration * 100) : 0}%`, marginLeft: `${duration > 0 ? Math.max(0, Math.min(100, Number(start) / duration * 100)) : 0}%` }} /></div><p className="mt-2 text-xs text-slate-500">Use decimal seconds for precise trimming (for example, 12.5).</p></div>
        </>}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={() => void previewTrim()} disabled={!file || busy || playingTrim} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Play size={16} /> Preview selection</button>
          <button type="button" onClick={stopPreview} disabled={!playingTrim} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Square size={15} /> Stop preview</button>
          <button type="button" onClick={exportTrim} disabled={!file || busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"><Scissors size={17} /> Export trimmed WAV</button>
          <button type="button" onClick={reset} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw size={16} /> Reset</button>
        </div>
        {busy && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><LoaderCircle size={16} className="animate-spin" />{status || "Loading audio…"}</p>}
        {!busy && status && !error && <p role="status" className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={17} />{status}</p>}
        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
      </div>
      {outputUrl && <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20 sm:p-6"><div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><Music2 size={22} /></span><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900 dark:text-white">Your trimmed clip is ready</h2><p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">{file?.name.replace(/\.[^.]+$/, "") || "audio"}-trimmed.wav · {formatTime(outputDuration)} · {formatBytes(outputBytes)}</p><audio controls preload="metadata" src={outputUrl} className="mt-4 w-full" /><a href={outputUrl} download={`${file?.name.replace(/\.[^.]+$/, "") || "audio"}-trimmed.wav`} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={17} /> Download WAV</a></div></div></div>}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Compatibility:</strong> Audio decoding depends on the browser and the source codec. Export is uncompressed PCM WAV (up to stereo), not MP3. Very long audio may use substantial memory. Trim only media you own or have permission to edit.</div>
    </section>
  );
}
