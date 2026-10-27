"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileVideo, LoaderCircle, RefreshCw, Upload, Video } from "lucide-react";

const inputClass = "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const MAX_FILE_BYTES = 300 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"]; let size = bytes / 1024, unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
  return `${size.toFixed(size >= 100 ? 0 : 1)} ${units[unit]}`;
}

export default function VideoCompressorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState("28");
  const [resolution, setResolution] = useState("original");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputName, setOutputName] = useState("compressed.mp4");
  const [outputBytes, setOutputBytes] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const outputUrlRef = useRef("");

  useEffect(() => () => { if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current); }, []);

  function clearOutput() {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = ""; setOutputUrl(""); setOutputBytes(0); setProgress(0);
  }

  function chooseFile(next?: File) {
    setError(""); setStatus(""); clearOutput(); setFile(null);
    if (!next) return;
    if (!next.type.startsWith("video/") && !/\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(next.name)) { setError("Choose a supported video file such as MP4, MOV, WebM, MKV or AVI."); if (inputRef.current) inputRef.current.value = ""; return; }
    if (next.size === 0) { setError("The selected file is empty."); return; }
    if (next.size > MAX_FILE_BYTES) { setError("This browser tool accepts videos up to 300 MB. Try a smaller file to reduce memory use."); if (inputRef.current) inputRef.current.value = ""; return; }
    setFile(next); setOutputName(`${next.name.replace(/\.[^.]+$/, "") || "video"}-compressed.mp4`);
  }

  async function compress() {
    if (!file || busy) return;
    setBusy(true); setError(""); setStatus("Loading the in-browser video engine…"); setProgress(0); clearOutput();
    let ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
    try {
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
      ffmpeg = new FFmpeg();
      ffmpeg.on("log", ({ message }) => { if (/error|invalid|failed/i.test(message)) setStatus(message.slice(0, 160)); });
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
      const inputName = `input${file.name.match(/\.[^.]+$/)?.[0] ?? ".mp4"}`;
      const outputFile = "compressed.mp4";
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const crf = Number(quality);
      const args = ["-i", inputName, "-map", "0:v:0", "-map", "0:a?", "-c:v", "libx264", "-preset", "veryfast", "-crf", String(crf), "-c:a", "aac", "-b:a", "128k"];
      if (resolution !== "original") args.push("-vf", `scale='min(${resolution},iw)':-2`);
      args.push("-movflags", "+faststart", "-y", outputFile);
      setStatus("Compressing video… Keep this tab open. Large videos can take several minutes.");
      await ffmpeg.exec(args);
      const data = await ffmpeg.readFile(outputFile);
      if (typeof data === "string" || data.byteLength === 0) throw new Error("The compressor returned an empty file. The video codec may not be supported.");
      const bytes = new Uint8Array(data as Uint8Array);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "video/mp4" });
      const url = URL.createObjectURL(blob); outputUrlRef.current = url; setOutputUrl(url); setOutputBytes(blob.size); setProgress(100);
      setStatus(blob.size < file.size ? `Compression complete — reduced by ${((1 - blob.size / file.size) * 100).toFixed(1)}%.` : "Conversion complete, but this output is not smaller than the original. Try a lower resolution or a different quality setting.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Compression failed.";
      setError(/memory|out of memory/i.test(message) ? "This video may be too large for available browser memory. Try a shorter or smaller video." : `Could not compress this video. ${message.slice(0, 200)}`);
      setStatus("");
    } finally {
      if (ffmpeg) { try { await ffmpeg.terminate(); } catch { /* Worker may already have exited. */ } }
      setBusy(false);
    }
  }

  function reset() {
    if (busy) return;
    clearOutput(); setFile(null); setError(""); setStatus(""); setProgress(0); setQuality("28"); setResolution("original");
    if (inputRef.current) inputRef.current.value = "";
  }

  const saving = file && outputBytes > 0 ? file.size - outputBytes : 0;
  const savingPercent = file && outputBytes > 0 ? (1 - outputBytes / file.size) * 100 : 0;

  return <section className="space-y-6">
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Video size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Choose a video to compress</h2><p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">FFmpeg WebAssembly loads from a public CDN on first use. Processing is local, but can use significant CPU and memory.</p></div></div>
      <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="video-compressor-file">Video file (maximum 300 MB)</label>
      <input ref={inputRef} id="video-compressor-file" type="file" accept="video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi" disabled={busy} onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" />
      <label htmlFor="video-compressor-file" className={`mt-2 flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/70 px-4 py-5 text-center transition hover:border-violet-500 hover:bg-violet-50 focus-within:ring-2 focus-within:ring-violet-500 dark:border-violet-800 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 ${busy ? "pointer-events-none opacity-60" : ""}`}><span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"><Upload size={20}/></span><span className="text-sm font-semibold text-violet-800 dark:text-violet-200">{file ? "Choose a different video" : "Tap here to upload a video"}</span><span className="mt-1 text-xs text-slate-600 dark:text-slate-300">Click to browse files · MP4, MOV, WebM and more · Up to 300 MB</span></label>
      {file && <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><FileVideo className="shrink-0 text-violet-600" size={22} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-900 dark:text-white">{file.name}</p><p className="text-xs text-slate-500">Original size: {formatBytes(file.size)}</p></div></div>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="video-quality" className="text-sm font-medium text-slate-700 dark:text-slate-200">Compression strength</label><select id="video-quality" value={quality} disabled={busy} onChange={(event) => setQuality(event.target.value)} className={inputClass}><option value="23">Higher quality · larger file (CRF 23)</option><option value="28">Balanced (CRF 28)</option><option value="32">Smaller file · lower quality (CRF 32)</option><option value="36">Strong compression · lowest quality (CRF 36)</option></select><p className="mt-1.5 text-xs text-slate-500">Higher CRF generally means smaller output and more quality loss.</p></div>
        <div><label htmlFor="video-resolution" className="text-sm font-medium text-slate-700 dark:text-slate-200">Maximum video width</label><select id="video-resolution" value={resolution} disabled={busy} onChange={(event) => setResolution(event.target.value)} className={inputClass}><option value="original">Keep original resolution</option><option value="1920">Up to 1080p (1920 px)</option><option value="1280">Up to 720p (1280 px)</option><option value="854">Up to 480p (854 px)</option></select><p className="mt-1.5 text-xs text-slate-500">Resolution is only reduced; smaller source videos are not enlarged.</p></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => void compress()} disabled={!file || busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Upload size={17} />}{busy ? "Compressing…" : "Compress video"}</button><button type="button" onClick={reset} disabled={busy} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RefreshCw size={16} /> Reset</button></div>
      {busy && <div className="mt-5 space-y-2" role="status" aria-live="polite"><div className="flex justify-between gap-3 text-sm text-slate-600 dark:text-slate-300"><span>{status}</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${progress}%` }} /></div></div>}
      {!busy && status && outputUrl && <p className="mt-4 flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{status}</p>}
      {error && <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</p>}
    </div>
    {outputUrl && <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20 sm:p-6"><div className="flex items-start gap-3"><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><CheckCircle2 size={22} /></span><div className="min-w-0 flex-1"><h2 className="font-semibold text-slate-900 dark:text-white">Compressed MP4 is ready</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Original: {file ? formatBytes(file.size) : "—"} · Output: {formatBytes(outputBytes)}</p>{file && outputBytes < file.size && <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">Saved {formatBytes(saving)} ({savingPercent.toFixed(1)}%)</p>}<video controls preload="metadata" src={outputUrl} className="mt-4 max-h-80 w-full rounded-xl bg-black" /><a href={outputUrl} download={outputName} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"><Download size={17} /> Download compressed MP4</a></div></div></div>}
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">This tool uses browser-based FFmpeg. First-time setup requires internet access to download the engine. It is not suitable for very large or confidential files on shared devices; avoid closing the tab during processing.</p>
  </section>;
}
