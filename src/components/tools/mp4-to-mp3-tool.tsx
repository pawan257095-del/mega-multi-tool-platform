"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileVideo, LoaderCircle, Music2, RefreshCw, Upload } from "lucide-react";

const inputClass = "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const MAX_FILE_BYTES = 500 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
}

export default function Mp4ToMp3Tool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitrate, setBitrate] = useState("192k");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputName, setOutputName] = useState("audio.mp3");
  const [outputBytes, setOutputBytes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputUrlRef = useRef("");

  useEffect(() => () => { if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current); }, []);

  function clearOutput() {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = "";
    setOutputUrl(""); setOutputBytes(0); setProgress(0);
  }

  function chooseFile(next: File | undefined) {
    setError(""); setStatus(""); clearOutput();
    if (!next) return;
    if (!/\.mp4$/i.test(next.name) && next.type !== "video/mp4") {
      setFile(null); setError("Choose an MP4 video file."); if (inputRef.current) inputRef.current.value = ""; return;
    }
    if (next.size > MAX_FILE_BYTES) {
      setFile(null); setError("This browser tool accepts files up to 500 MB. Try a smaller video."); if (inputRef.current) inputRef.current.value = ""; return;
    }
    if (next.size === 0) { setFile(null); setError("The selected file is empty."); return; }
    setFile(next); setOutputName(`${next.name.replace(/\.mp4$/i, "") || "audio"}.mp3`);
  }

  async function convert() {
    if (!file || busy) return;
    setBusy(true); setError(""); setStatus("Loading the in-browser conversion engine…"); setProgress(0); clearOutput();
    let ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
    try {
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
      ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => {
        if (/error|invalid|failed/i.test(message)) setStatus(message.slice(0, 180));
      });
      ffmpeg.on("progress", ({ progress: ratio }) => setProgress(Math.min(99, Math.max(0, Math.round(ratio * 100)))));
      const cdnBases = [
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd",
        "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd",
      ];
      let loaded = false;
      let loadError: unknown;
      for (const base of cdnBases) {
        try {
          setStatus("Loading the media engine…");
          const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript");
          const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm");
          await ffmpeg.load({ coreURL, wasmURL });
          loaded = true;
          break;
        } catch (error) {
          loadError = error;
        }
      }
      if (!loaded) throw new Error(`Could not load the media engine from either CDN. Check your internet connection or browser extensions and retry. ${loadError instanceof Error ? loadError.message : ""}`);
      setStatus("Preparing video…");
      const inputName = "source.mp4", resultName = "converted.mp3";
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      setStatus("Extracting audio and encoding MP3…");
      await ffmpeg.exec(["-i", inputName, "-vn", "-codec:a", "libmp3lame", "-b:a", bitrate, "-map_metadata", "-1", resultName]);
      const data = await ffmpeg.readFile(resultName);
      if (typeof data === "string" || data.byteLength === 0) throw new Error("The conversion returned an empty audio file. This video may not contain a supported audio track.");
      const bytes = new Uint8Array(data as Uint8Array);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob); outputUrlRef.current = url; setOutputUrl(url); setOutputBytes(blob.size); setProgress(100); setStatus("Conversion complete. Your MP3 is ready to download.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Conversion failed.";
      setError(/memory|out of memory/i.test(message) ? "The video may be too large for available browser memory. Try a smaller MP4." : `Could not convert this file. ${message.slice(0, 220)}`);
      setStatus("");
    } finally {
      if (ffmpeg) { try { await ffmpeg.terminate(); } catch { /* Worker may already have exited. */ } }
      setBusy(false);
    }
  }

  function reset() {
    if (busy) return;
    clearOutput(); setFile(null); setError(""); setStatus(""); setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><FileVideo size={22} /></span>
          <div><h2 className="font-semibold text-slate-900 dark:text-white">Select an MP4 video</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">The conversion engine downloads on first use (about tens of megabytes). Keep this tab open while converting.</p></div>
        </div>
        <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="mp4-file">MP4 file (maximum 500 MB)</label>
        <input ref={inputRef} id="mp4-file" type="file" accept="video/mp4,.mp4" disabled={busy} onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
        <label htmlFor="mp4-file" className={`mt-2 flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/70 px-4 py-5 text-center transition hover:border-violet-500 hover:bg-violet-50 focus-within:ring-2 focus-within:ring-violet-500 dark:border-violet-800 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 ${busy ? "pointer-events-none opacity-60" : ""}`}><span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"><Upload size={20}/></span><span className="text-sm font-semibold text-violet-800 dark:text-violet-200">{file ? "Choose a different MP4 video" : "Tap here to upload an MP4 video"}</span><span className="mt-1 text-xs text-slate-600 dark:text-slate-300">Click to browse files · MP4 only · Up to 500 MB</span></label>
        {file && <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><FileVideo className="shrink-0 text-violet-600" size={22} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{file.name}</p><p className="text-xs text-slate-500">{formatBytes(file.size)}</p></div></div>}
        <div className="mt-5 max-w-xs"><label htmlFor="mp3-bitrate" className="text-sm font-medium text-slate-700 dark:text-slate-200">MP3 bitrate</label><select id="mp3-bitrate" value={bitrate} disabled={busy} onChange={(event) => setBitrate(event.target.value)} className={inputClass}><option value="128k">128 kbps — smaller file</option><option value="192k">192 kbps — balanced</option><option value="256k">256 kbps — higher quality</option><option value="320k">320 kbps — highest listed bitrate</option></select></div>
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={convert} disabled={!file || busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Music2 size={17} />} {busy ? "Converting…" : "Convert to MP3"}</button><button type="button" onClick={reset} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw size={16} /> Reset</button></div>
        {busy && <div className="mt-5 space-y-2" role="status" aria-live="polite"><div className="flex justify-between gap-3 text-sm text-slate-600 dark:text-slate-300"><span>{status}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} /></div></div>}
        {!busy && status && outputUrl && <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={17} />{status}</p>}
        {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
      </div>
      {outputUrl && <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20 sm:p-6"><div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><Music2 size={22} /></span><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900 dark:text-white">Your MP3 is ready</h2><p className="mt-1 break-all text-sm text-slate-600 dark:text-slate-300">{outputName} · {formatBytes(outputBytes)}</p><audio controls preload="metadata" src={outputUrl} className="mt-4 w-full" /><a href={outputUrl} download={outputName} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={17} /> Download MP3</a></div></div></div>}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Notes:</strong> Conversion uses FFmpeg WebAssembly loaded from a public CDN and may use substantial RAM and CPU. Browser compatibility and available memory vary. Only convert media you own or have permission to use.</div>
    </section>
  );
}
