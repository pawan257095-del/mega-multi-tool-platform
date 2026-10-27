"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileVideo, LoaderCircle, Scissors, Sparkles, WandSparkles, Upload } from "lucide-react";

type Props = { mode: "trim" | "clips" };
const inputClass = "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const MAX_BYTES = 500 * 1024 * 1024;
const fmt = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const h = Math.floor(seconds / 3600), m = Math.floor((seconds % 3600) / 60), s = Math.floor(seconds % 60);
  return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${m}:${String(s).padStart(2,"0")}`;
};

export default function VideoTrimClipsTool({ mode }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("");
  const [clipSeconds, setClipSeconds] = useState("30");
  const [customSeconds, setCustomSeconds] = useState("30");
  const [clipCount, setClipCount] = useState("3");
  const [smartHighlights, setSmartHighlights] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [downloads, setDownloads] = useState<{name:string;url:string}[]>([]);
  const [aspectRatio, setAspectRatio] = useState("original");
  const [fitMode, setFitMode] = useState<"crop" | "fit">("crop");
  const inputRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => () => { urlsRef.current.forEach((u) => URL.revokeObjectURL(u)); }, []);
   useEffect(() => {
    let cancelled = false;
    let url = "";

    const createPreview = async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (!file) {
        setPreviewUrl("");
        return;
      }

      url = URL.createObjectURL(file);
      setPreviewUrl(url);
    };

    void createPreview();

    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);
  function clearDownloads() {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = []; setDownloads([]);
  }
  function chooseFile(next?: File) {
    setError(""); setStatus(""); clearDownloads(); setFile(null); setDuration(0);
    if (!next) return;
    if (!(next.type.startsWith("video/") || /\.(mp4|mov|m4v|webm|mkv|avi)$/i.test(next.name))) {
      setError("Choose a supported video file such as MP4, MOV, WebM, MKV or AVI."); return;
    }
    if (!next.size || next.size > MAX_BYTES) {
      setError("Choose a non-empty video smaller than 500 MB."); return;
    }
    setFile(next);
  }
  function onMetadata() {
    const d = videoRef.current?.duration || 0;
    if (Number.isFinite(d)) { setDuration(d); setEnd(String(Math.floor(d))); }
  }
  function saveUrl(name: string, url: string) {
    urlsRef.current.push(url);
    setDownloads((d) => [...d, {name,url}]);
  }
  async function detectHighlights(videoFile: File, clipLen: number, requestedCount: number, onProgress: (message: string) => void): Promise<number[]> {
    // Local, API-free visual activity analysis. It ranks windows by scene change and motion;
    // it does not claim semantic understanding of the story or people in the video.
    const objectUrl = URL.createObjectURL(videoFile);
    const probe = document.createElement("video");
    probe.muted = true; probe.playsInline = true; probe.preload = "auto"; probe.src = objectUrl;
    try {
      await new Promise<void>((resolve, reject) => {
        probe.onloadedmetadata = () => resolve();
        probe.onerror = () => reject(new Error("This video could not be analyzed in the browser."));
        probe.load();
      });
      const videoDuration = probe.duration;
      if (!Number.isFinite(videoDuration) || videoDuration <= 0) throw new Error("Could not read the video duration.");
      const canvas = document.createElement("canvas"); canvas.width = 64; canvas.height = 36;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Your browser does not support local video analysis.");
      const sampleStep = Math.max(0.75, Math.min(2, clipLen / 8));
      const samples: { time: number; pixels: Uint8ClampedArray; brightness: number }[] = [];
      const sampleTimes: number[] = [];
      for (let t = 0.25; t < videoDuration; t += sampleStep) sampleTimes.push(Math.min(t, Math.max(0, videoDuration - 0.05)));
      if (sampleTimes.length < 2) sampleTimes.push(Math.max(0, videoDuration / 2));
      for (let i = 0; i < sampleTimes.length; i++) {
        const t = sampleTimes[i];
        await new Promise<void>((resolve, reject) => {
          const timeout = window.setTimeout(() => reject(new Error("Video analysis timed out. Try uploading a smaller or more compatible video.")), 10000);
          probe.onseeked = () => { window.clearTimeout(timeout); resolve(); };
          probe.onerror = () => { window.clearTimeout(timeout); reject(new Error("Could not read a video frame.")); };
          try {
            if (Math.abs(probe.currentTime - t) < 0.001 && probe.readyState >= 2) { window.clearTimeout(timeout); resolve(); }
            else probe.currentTime = t;
          } catch (e) { window.clearTimeout(timeout); reject(e); }
        });
        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const copy = new Uint8ClampedArray(data);
        let brightness = 0;
        for (let j = 0; j < copy.length; j += 4) brightness += (copy[j] * 0.299 + copy[j + 1] * 0.587 + copy[j + 2] * 0.114);
        samples.push({ time: t, pixels: copy, brightness: brightness / (copy.length / 4) });
        onProgress(`Analyzing video frames ${Math.round(((i + 1) / sampleTimes.length) * 100)}%…`);
      }
      const activity = samples.map((sample, i) => {
        if (i === 0) return { time: sample.time, score: 0 };
        const prev = samples[i - 1]; let diff = 0;
        for (let j = 0; j < sample.pixels.length; j += 4) {
          diff += (Math.abs(sample.pixels[j] - prev.pixels[j]) + Math.abs(sample.pixels[j + 1] - prev.pixels[j + 1]) + Math.abs(sample.pixels[j + 2] - prev.pixels[j + 2])) / 3;
        }
        const motion = diff / (sample.pixels.length / 4) / 255;
        const lightingChange = Math.abs(sample.brightness - prev.brightness) / 255;
        return { time: sample.time, score: motion * 0.85 + lightingChange * 0.15 };
      });
      const maxStart = Math.max(0, videoDuration - Math.min(clipLen, videoDuration));
      const step = Math.max(1, Math.min(clipLen / 3, 5));
      const candidates: { start: number; score: number }[] = [];
      for (let startAt = 0; startAt <= maxStart; startAt += step) {
        const endAt = Math.min(videoDuration, startAt + clipLen);
        const scores = activity.filter(a => a.time >= startAt && a.time < endAt).map(a => a.score).sort((a,b) => b-a);
        if (scores.length) {
          const top = scores.slice(0, Math.max(1, Math.ceil(scores.length * 0.35)));
          candidates.push({ start: startAt, score: top.reduce((sum, value) => sum + value, 0) / top.length });
        }
      }
      candidates.sort((a,b) => b.score - a.score);
      const chosen: { start: number; score: number }[] = [];
      for (const candidate of candidates) {
        if (chosen.every(c => Math.abs(c.start - candidate.start) >= clipLen * 0.8)) chosen.push(candidate);
        if (chosen.length >= requestedCount) break;
      }
      if (!chosen.length) return [0];
      return chosen.sort((a,b) => a.start - b.start).map(c => Math.min(c.start, maxStart));
    } finally { probe.removeAttribute("src"); probe.load(); URL.revokeObjectURL(objectUrl); }
  }

  async function process() {
    if (!file || busy) return;
    const clipLen = Math.floor(Number(clipSeconds === "custom" ? customSeconds : clipSeconds));
    const trimStart = Math.max(0, Number(start));
    const trimEnd = Math.min(duration, Number(end));
    if (mode === "trim" && (!Number.isFinite(trimStart) || !Number.isFinite(trimEnd) || trimEnd <= trimStart)) {
      setError("End time must be greater than start time and within the video duration."); return;
    }
    if (mode === "clips" && (!Number.isFinite(clipLen) || clipLen < 1 || clipLen > 600)) {
      setError("Clip duration must be between 1 and 600 seconds."); return;
    }
    setBusy(true); setError(""); setStatus("Loading browser video engine…"); setProgress(0); clearDownloads();
    let highlightStarts: number[] | null = null;
    try {
      if (mode === "clips" && smartHighlights) {
        setAnalyzing(true);
        const requested = Math.min(20, Math.max(1, Number.parseInt(clipCount, 10) || 1), Math.ceil(duration / clipLen));
        highlightStarts = await detectHighlights(file, clipLen, requested, setStatus);
        setAnalyzing(false);
      }
    } catch (e) {
      setAnalyzing(false); setBusy(false); setError(e instanceof Error ? `Could not analyze highlights: ${e.message}` : "Could not analyze this video."); setStatus(""); return;
    }
    let ffmpeg: import("@ffmpeg/ffmpeg").FFmpeg | null = null;
    try {
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([import("@ffmpeg/ffmpeg"), import("@ffmpeg/util")]);
      ffmpeg = new FFmpeg();
      ffmpeg.on("progress", ({progress: p}) => setProgress(Math.min(99, Math.max(0, Math.round(p * 100)))));
      let loaded = false;
      let lastError: unknown;
      for (const base of [
        "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd",
        "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd",
      ]) {
        try {
          setStatus("Downloading video engine (first run may take a little while)…");
          await ffmpeg.load({ coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"), wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm") });
          loaded = true; break;
        } catch (e) { lastError = e; }
      }
      if (!loaded) throw lastError || new Error("Could not load the video engine. Check your internet connection.");
      const ext = (file.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g,"");
      const inName = `input.${ext}`;
      await ffmpeg.writeFile(inName, await fetchFile(file));
      // Re-encode for reliable accurate cuts; generated files are processed locally in the browser.
      const totalClips = mode === "trim"
        ? 1
        : (highlightStarts ? highlightStarts.length : Math.min(20, Math.max(1, Number.parseInt(clipCount,10) || 1), Math.ceil(duration / clipLen)));
      const ratioDimensions: Record<string, [number, number]> = {
        "9:16": [1080, 1920],
        "16:9": [1920, 1080],
        "1:1": [1080, 1080],
        "4:5": [1080, 1350],
      };

      const dimensions = ratioDimensions[aspectRatio];

      const videoFilter: string[] = !dimensions
        ? []
        : fitMode === "crop"
          ? [
              "-vf",
              `scale=${dimensions[0]}:${dimensions[1]}:force_original_aspect_ratio=increase,crop=${dimensions[0]}:${dimensions[1]}`,
            ]
          : [
              "-vf",
              `scale=${dimensions[0]}:${dimensions[1]}:force_original_aspect_ratio=decrease,pad=${dimensions[0]}:${dimensions[1]}:(ow-iw)/2:(oh-ih)/2:color=black`,
            ];
      for (let i = 0; i < totalClips; i++) {
        const from = mode === "trim" ? trimStart : highlightStarts ? highlightStarts[i] : i * clipLen;
        const length = mode === "trim" ? trimEnd - trimStart : Math.min(clipLen, duration - from);
        if (length <= 0) continue;
        const outName = mode === "trim" ? "trimmed-video.mp4" : `clip-${String(i+1).padStart(2,"0")}.mp4`;
        setStatus(mode === "trim" ? "Trimming your video…" : `Creating clip ${i+1} of ${totalClips}…`);
         await ffmpeg.exec([
          "-ss", String(from),
          "-i", inName,
          "-t", String(length),
          "-map", "0:v:0?",
          "-map", "0:a:0?",
          ...videoFilter,
          "-c:v", "libx264",
          "-preset", "ultrafast",
          "-crf", "23",
          "-pix_fmt", "yuv420p",
          "-c:a", "aac",
          "-movflags", "+faststart",
          outName,
        ]);
        const data = await ffmpeg.readFile(outName);
        const blob = new Blob([data as BlobPart], {type:"video/mp4"});
        saveUrl(outName, URL.createObjectURL(blob));
        setProgress(Math.round(((i+1)/totalClips)*100));
      }
      setStatus(mode === "trim" ? "Your trimmed video is ready to download." : smartHighlights ? `Analyzed the video locally and created ${totalClips} activity-ranked highlight clip(s). This detects visual motion and scene changes; it does not understand story meaning like a cloud AI model.` : `Created ${totalClips} sequential clips from the start of the video.`);
    } catch (e) {
      setError(e instanceof Error ? `Could not process this video: ${e.message}` : "Could not process this video. Try a smaller MP4 file.");
      setStatus("");
    } finally {
      if (ffmpeg) { try { await ffmpeg.terminate(); } catch {} }
      setBusy(false);
    }
  }
  const isTrim = mode === "trim";
  return <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <div className="flex items-start gap-3">
      <span className="rounded-xl bg-violet-100 p-3 text-violet-700 dark:bg-violet-950 dark:text-violet-300">{isTrim ? <Scissors size={23}/> : <Sparkles size={23}/>}</span>
      <div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{isTrim ? "Trim a video" : "Generate short clips"}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{isTrim ? "Preview your video, set a start and end time, and export just that segment." : "Find visually active moments locally, then create short highlight clips without an API key."}</p></div>
    </div>
    <label className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={`video-file-${mode}`}>Or upload a video file (up to 500 MB)</label>
    <input ref={inputRef} id={`video-file-${mode}`} type="file" accept="video/*,.mp4,.mov,.m4v,.webm,.mkv,.avi" disabled={busy} onChange={(e) => chooseFile(e.target.files?.[0])} className="sr-only" />
    <label htmlFor={`video-file-${mode}`} className={`mt-2 flex min-h-28 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50/70 px-4 py-5 text-center transition hover:border-violet-500 hover:bg-violet-50 focus-within:ring-2 focus-within:ring-violet-500 dark:border-violet-800 dark:bg-violet-950/20 dark:hover:bg-violet-950/40 ${busy ? "pointer-events-none opacity-60" : ""}`}>
      <span className="mb-2 inline-flex size-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-200"><Upload size={20}/></span>
      <span className="text-sm font-semibold text-violet-800 dark:text-violet-200">{file ? "Choose a different video" : "Tap here to upload a video"}</span>
      <span className="mt-1 text-xs text-slate-600 dark:text-slate-300">Click to browse files · MP4, MOV, WebM and more · Up to 500 MB</span>
    </label>
    {file && <div className="mt-4">
      <video ref={videoRef} controls playsInline preload="metadata" onLoadedMetadata={onMetadata} src={previewUrl} className="max-h-80 w-full rounded-xl bg-black" />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{file.name} · {(file.size/1024/1024).toFixed(1)} MB · Duration {fmt(duration)}</p>
    </div>}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Output aspect ratio
        <select
          className={inputClass}
          value={aspectRatio}
          onChange={(e) => setAspectRatio(e.target.value)}
          disabled={busy || !file}
        >
          <option value="original">Original ratio</option>
          <option value="9:16">9:16 — Shorts / Reels</option>
          <option value="16:9">16:9 — YouTube landscape</option>
          <option value="1:1">1:1 — Square video</option>
          <option value="4:5">4:5 — Portrait feed</option>
        </select>
      </label>

      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
        Video framing
        <select
          className={inputClass}
          value={fitMode}
          onChange={(e) =>
            setFitMode(e.target.value as "crop" | "fit")
          }
          disabled={busy || !file || aspectRatio === "original"}
        >
          <option value="crop">Crop to fill</option>
          <option value="fit">Fit with black padding</option>
        </select>
      </label>
    </div>
    {isTrim ? <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Start time (seconds)<input className={inputClass} type="number" min="0" max={duration || undefined} step="0.1" value={start} onChange={e=>setStart(e.target.value)} disabled={busy || !file}/></label>
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">End time (seconds)<input className={inputClass} type="number" min="0.1" max={duration || undefined} step="0.1" value={end} onChange={e=>setEnd(e.target.value)} disabled={busy || !file}/></label>
    </div> : <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Clip duration<select className={inputClass} value={clipSeconds} onChange={e=>setClipSeconds(e.target.value)} disabled={busy}><option value="30">30 seconds</option><option value="15">15 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option><option value="custom">Custom…</option></select>
      </label>
      {clipSeconds === "custom" ? <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Custom duration (seconds)<input className={inputClass} type="number" min="1" max="600" value={customSeconds} onChange={e=>setCustomSeconds(e.target.value)} disabled={busy}/></label> : <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Number of clips<input className={inputClass} type="number" min="1" max="20" value={clipCount} onChange={e=>setClipCount(e.target.value)} disabled={busy}/></label>}
    </div>}
    {!isTrim && <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50/70 p-3 dark:border-violet-900 dark:bg-violet-950/20">
      <label className="flex cursor-pointer items-start gap-3 text-sm font-medium text-slate-800 dark:text-slate-100">
        <input type="checkbox" className="mt-1 size-4 accent-violet-600" checked={smartHighlights} onChange={e=>setSmartHighlights(e.target.checked)} disabled={busy || analyzing}/>
        <span><span className="flex items-center gap-2"><WandSparkles size={17} className="text-violet-600"/> Smart highlight detection <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-900 dark:text-violet-200">No API key</span></span>
        <span className="mt-1 block text-xs font-normal leading-5 text-slate-600 dark:text-slate-300">Analyzes frames on this device and ranks sections with more motion and scene changes. It is a lightweight local heuristic, not semantic AI; disable it for evenly spaced clips.</span></span>
      </label>
    </div>}
    <button type="button" onClick={process} disabled={!file || busy} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{busy ? <LoaderCircle className="animate-spin" size={18}/> : isTrim ? <Scissors size={18}/> : <Sparkles size={18}/>} {busy ? (analyzing ? "Analyzing highlights…" : `Processing… ${progress}%`) : isTrim ? "Trim and export video" : smartHighlights ? "Find highlights & generate clips" : "Generate sequential clips"}</button>
    {status && <p role="status" className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">{status}</p>}
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    {downloads.length > 0 && (
  <div className="mt-5 space-y-4">
    <h3 className="font-semibold text-slate-900 dark:text-white">
      Preview & Download
    </h3>

    {downloads.map((d) => (
      <div
        key={d.name}
        className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
      >
        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {d.name}
        </p>

        <video
          controls
          playsInline
          preload="metadata"
          src={d.url}
          className="max-h-[480px] w-full rounded-xl bg-black"
        >
          Your browser does not support video preview.
        </video>

        <a
          href={d.url}
          download={d.name}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Download size={17} />
          Download Video
        </a>
      </div>
    ))}
  </div>
)}
    <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400"><FileVideo size={15} className="mr-1 inline"/>Video analysis and FFmpeg processing run locally in your browser; no API key or cloud AI service is used. Large videos may be slow or fail on phones with limited memory.</p>
  </section>;
}
