"use client";

import {
  Check, Download, Image as ImageIcon, Palette, RefreshCw, Sparkles,
  Trash2, Upload, WandSparkles, Undo2, Redo2, ZoomIn, ZoomOut,
} from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

type BackgroundMode = "transparent" | "preset" | "color" | "custom" | "blur";
type ExportFormat = "image/png" | "image/jpeg";
type BrushMode = "none" | "erase" | "restore";
type Preset = { id: string; name: string; colors: [string, string, string]; angle: number };

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;
const PRESETS: Preset[] = [
  { id: "studio", name: "Studio white", colors: ["#ffffff", "#f1f5f9", "#dbeafe"], angle: 120 },
  { id: "sky", name: "Sky blue", colors: ["#dbeafe", "#60a5fa", "#1d4ed8"], angle: 135 },
  { id: "lavender", name: "Lavender", colors: ["#f5d0fe", "#c4b5fd", "#818cf8"], angle: 135 },
  { id: "sunset", name: "Sunset", colors: ["#fef3c7", "#fb7185", "#7c3aed"], angle: 145 },
  { id: "mint", name: "Fresh mint", colors: ["#d1fae5", "#6ee7b7", "#0f766e"], angle: 135 },
  { id: "rose", name: "Soft rose", colors: ["#fff1f2", "#fda4af", "#be123c"], angle: 135 },
  { id: "night", name: "Midnight", colors: ["#334155", "#0f172a", "#020617"], angle: 135 },
  { id: "sand", name: "Warm sand", colors: ["#fef3c7", "#e7c9a9", "#a16207"], angle: 135 },
  { id: "aurora", name: "Aurora", colors: ["#0f766e", "#4338ca", "#701a75"], angle: 135 },
  { id: "peach", name: "Peach glow", colors: ["#ffedd5", "#fdba74", "#fb7185"], angle: 135 },
  { id: "gray", name: "Neutral gray", colors: ["#f8fafc", "#cbd5e1", "#64748b"], angle: 135 },
  { id: "green", name: "Emerald", colors: ["#d1fae5", "#059669", "#064e3b"], angle: 135 },
];

function sizeLabel(bytes: number) {
  return bytes < 1024 ? `${bytes} B` : bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
function safeBaseName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "image";
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An image could not be loaded for export."));
    image.src = src;
  });
}
function drawCover(ctx: CanvasRenderingContext2D, image: HTMLImageElement, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const w = image.naturalWidth * scale;
  const h = image.naturalHeight * scale;
  ctx.drawImage(image, (width - w) / 2, (height - h) / 2, w, h);
}

export default function BackgroundRemoverTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const sourceUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);
  const customBackgroundUrlRef = useRef<string | null>(null);
  const editCanvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const baseCutoutImageRef = useRef<HTMLImageElement | null>(null);
  const undoStackRef = useRef<string[]>([]);
  const redoStackRef = useRef<string[]>([]);
  const drawingRef = useRef(false);
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [editedCutoutUrl, setEditedCutoutUrl] = useState("");
  const [brushMode, setBrushMode] = useState<BrushMode>("none");
  const [brushSize, setBrushSize] = useState(32);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0, visible: false });
  const [edgeSoftness, setEdgeSoftness] = useState(8);
  const [zoom, setZoom] = useState(100);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("transparent");
  const [presetId, setPresetId] = useState("studio");
  const [solidColor, setSolidColor] = useState("#e0e7ff");
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState("");
  const [customBackgroundName, setCustomBackgroundName] = useState("");
  const [subjectScale, setSubjectScale] = useState(100);
  const [subjectX, setSubjectX] = useState(0);
  const [subjectY, setSubjectY] = useState(0);
  const [shadow, setShadow] = useState(true);
  const [blurAmount, setBlurAmount] = useState(18);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const activePreset = PRESETS.find((preset) => preset.id === presetId) ?? PRESETS[0];
  const resultName = `${safeBaseName(file?.name ?? "image")}-background-edited.${exportFormat === "image/png" ? "png" : "jpg"}`;

  function clearResult() {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResultUrl("");
    setResultSize(0);
    setEditedCutoutUrl("");
    setBrushMode("none");
    undoStackRef.current = [];
    redoStackRef.current = [];
    setHistoryVersion((version) => version + 1);
  }
  function clearAll() {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = null;
    setSourceUrl("");
    setFile(null);
    setDimensions({ width: 0, height: 0 });
    clearResult();
    setProgress("");
    setError("");
    setExportMessage("");
    setBackgroundMode("transparent");
    setSubjectScale(100);
    setSubjectX(0);
    setSubjectY(0);
    setZoom(100);
    setBrushMode("none");
    if (inputRef.current) inputRef.current.value = "";
  }
  useEffect(() => {
    if (!resultUrl) {
      baseCutoutImageRef.current = null;
      return;
    }
    let cancelled = false;
    void loadImage(resultUrl).then((image) => {
      if (cancelled) return;
      baseCutoutImageRef.current = image;
      const canvas = editCanvasRef.current;
      if (!canvas) return;
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.drawImage(image, 0, 0);
      setEditedCutoutUrl("");
      undoStackRef.current = [];
      redoStackRef.current = [];
      setHistoryVersion((version) => version + 1);
    }).catch(() => setError("Could not prepare the cutout for manual editing."));
    return () => { cancelled = true; };
  }, [resultUrl]);

  useEffect(() => () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
  }, []);

  async function chooseFile(next?: File) {
    setError("");
    setProgress("");
    setExportMessage("");
    clearResult();
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      return;
    }
    if (next.size > MAX_FILE_SIZE) { setError("This image exceeds the 20 MB limit."); return; }
    const url = URL.createObjectURL(next);
    try {
      const image = await loadImage(url);
      if (image.naturalWidth * image.naturalHeight > MAX_PIXELS) {
        URL.revokeObjectURL(url);
        setError("This image exceeds the 40-megapixel limit for AI processing.");
        return;
      }
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = url;
      setSourceUrl(url);
      setFile(next);
      setDimensions({ width: image.naturalWidth, height: image.naturalHeight });
      setBackgroundMode("transparent");
    } catch {
      URL.revokeObjectURL(url);
      setError("The image could not be opened. Try another file.");
    }
  }

  async function chooseCustomBackground(next?: File) {
    setError("");
    setExportMessage("");
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      setError("Choose a JPG, PNG, or WebP background image.");
      return;
    }
    if (next.size > MAX_FILE_SIZE) { setError("The background image exceeds the 20 MB limit."); return; }
    const url = URL.createObjectURL(next);
    try {
      await loadImage(url);
      if (customBackgroundUrlRef.current) URL.revokeObjectURL(customBackgroundUrlRef.current);
      customBackgroundUrlRef.current = url;
      setCustomBackgroundUrl(url);
      setCustomBackgroundName(next.name);
      setBackgroundMode("custom");
    } catch {
      URL.revokeObjectURL(url);
      setError("The background image could not be opened.");
    }
  }

  function currentCanvasSnapshot() {
    const canvas = editCanvasRef.current;
    return canvas ? canvas.toDataURL("image/png") : "";
  }
  function syncHistoryCounts() {
  setUndoCount(undoStackRef.current.length);
  setRedoCount(redoStackRef.current.length);
}

  function restoreCanvasSnapshot(snapshot: string) {
    const canvas = editCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const image = new Image();
    image.onload = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext("2d")?.drawImage(image, 0, 0);
      setEditedCutoutUrl(canvas.toDataURL("image/png"));
    };
    image.src = snapshot;
  }

  function undoEdit() {
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    const current = currentCanvasSnapshot();
    if (current) redoStackRef.current.push(current);
    restoreCanvasSnapshot(previous);
    setHistoryVersion((version) => version + 1);
    syncHistoryCounts();
  }

  function redoEdit() {
    const next = redoStackRef.current.pop();
    if (!next) return;
    const current = currentCanvasSnapshot();
    if (current) undoStackRef.current.push(current);
    restoreCanvasSnapshot(next);
    setHistoryVersion((version) => version + 1);
    syncHistoryCounts();
  }

  function paintBrush(event: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = editCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || brushMode === "none") return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * canvas.width;
    const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * canvas.height;
    const radius = Math.max(1, (brushSize / 2) * (canvas.width / Math.max(1, rect.width)));
    if (brushMode === "erase") {
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = edgeSoftness * (canvas.width / Math.max(1, rect.width));
      ctx.fillStyle = "rgba(0,0,0,1)";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (baseCutoutImageRef.current) {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(baseCutoutImageRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  function beginBrush(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (brushMode === "none" || busy) return;
    event.preventDefault();
    const snapshot = currentCanvasSnapshot();
    if (snapshot) {
      undoStackRef.current.push(snapshot);
      syncHistoryCounts();
      if (undoStackRef.current.length > 6) undoStackRef.current.shift();
    }
    redoStackRef.current = [];
    syncHistoryCounts();
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    paintBrush(event);
    setHistoryVersion((version) => version + 1);
    syncHistoryCounts();
  }

  function continueBrush(event: ReactPointerEvent<HTMLCanvasElement>) {
    const preview = previewRef.current;
    if (preview) {
      const rect = preview.getBoundingClientRect();
      setCursorPosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true,
      });
    }
    if (drawingRef.current) paintBrush(event);
  }

  function finishBrush() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = editCanvasRef.current;
    if (canvas) setEditedCutoutUrl(canvas.toDataURL("image/png"));
    setHistoryVersion((version) => version + 1);
  }

  async function removeBackground() {
    if (!file) { setError("Choose an image first."); return; }
    setBusy(true);
    setError("");
    setProgress("Loading the background-removal model…");
    setExportMessage("");
    clearResult();
    try {
      const backgroundRemoval = await import("@imgly/background-removal");
      const output = await backgroundRemoval.removeBackground(file, {
        output: { format: "image/png", quality: 1 },
        progress: (key: string, current: number, total: number) => {
          const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((current / total) * 100))) : 0;
          setProgress(`${key.toLowerCase().includes("fetch") ? "Downloading model assets" : "Processing image"}… ${pct}%`);
        },
      });
      const url = URL.createObjectURL(output);
      resultUrlRef.current = url;
      setResultUrl(url);
      setResultSize(output.size);
      setProgress("Done — background removed. Choose a background or download the transparent cutout.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Background removal failed.";
      setError(`${message} Check your internet connection for first-time model downloads, then try a smaller image or another browser.`);
      setProgress("");
    } finally { setBusy(false); }
  }

  async function exportComposite() {
    if (!resultUrl) { setError("Remove the background before exporting the edited image."); return; }
    setExporting(true);
    setError("");
    setExportMessage("");
    try {
      const foreground = await loadImage(editedCutoutUrl || resultUrl);
      const width = foreground.naturalWidth;
      const height = foreground.naturalHeight;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Your browser could not create an image canvas.");

      if (backgroundMode === "color") {
        ctx.fillStyle = solidColor;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundMode === "preset") {
        const gradient = ctx.createLinearGradient(0, 0, width * Math.cos(activePreset.angle * Math.PI / 180), height * Math.sin(activePreset.angle * Math.PI / 180));
        gradient.addColorStop(0, activePreset.colors[0]);
        gradient.addColorStop(0.52, activePreset.colors[1]);
        gradient.addColorStop(1, activePreset.colors[2]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      } else if (backgroundMode === "custom" && customBackgroundUrl) {
        const background = await loadImage(customBackgroundUrl);
        drawCover(ctx, background, width, height);
      } else if (backgroundMode === "blur") {
        const original = await loadImage(sourceUrl);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);
        ctx.save();
        ctx.filter = `blur(${blurAmount}px)`;
        const scale = Math.max(width / original.naturalWidth, height / original.naturalHeight) * 1.08;
        const w = original.naturalWidth * scale;
        const h = original.naturalHeight * scale;
        ctx.drawImage(original, (width - w) / 2, (height - h) / 2, w, h);
        ctx.restore();
      } else if (backgroundMode === "transparent" && exportFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }

      const scale = subjectScale / 100;
      const drawWidth = width * scale;
      const drawHeight = height * scale;
      const x = (width - drawWidth) / 2 + (subjectX / 100) * width;
      const y = (height - drawHeight) / 2 + (subjectY / 100) * height;
      ctx.save();
      if (shadow) ctx.filter = "drop-shadow(0px 10px 18px rgba(15, 23, 42, 0.24))";
      ctx.drawImage(foreground, x, y, drawWidth, drawHeight);
      ctx.restore();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("The image could not be exported.")), exportFormat, quality / 100);
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resultName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setExportMessage(`Exported ${resultName} · ${sizeLabel(blob.size)} · ${width} × ${height} px`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Export failed. Please try again.");
    } finally { setExporting(false); }
  }

  const previewBackgroundStyle = (): CSSProperties => {
    if (backgroundMode === "color") return { background: solidColor };
    if (backgroundMode === "preset") return { background: `linear-gradient(${activePreset.angle}deg, ${activePreset.colors.join(", ")})` };
    if (backgroundMode === "custom") return customBackgroundUrl ? { backgroundImage: `url("${customBackgroundUrl}")`, backgroundSize: "cover", backgroundPosition: "center" } : { background: "#f8fafc" };
    if (backgroundMode === "blur") return { backgroundImage: `url("${sourceUrl}")`, backgroundSize: "cover", backgroundPosition: "center", filter: `blur(${Math.max(4, blurAmount / 2)}px)`, transform: "scale(1.08)" };
    return {
      backgroundColor: "#fff",
      backgroundImage: "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)",
      backgroundSize: "20px 20px",
      backgroundPosition: "0 0,0 10px,10px -10px,-10px 0",
    };
  };

  return <section aria-label="Professional background remover and editor" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
    <input ref={backgroundInputRef} type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" className="sr-only" onChange={(event) => void chooseCustomBackground(event.target.files?.[0])} />
    {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/70 px-5 py-10 text-center dark:border-indigo-900 dark:bg-indigo-950/20 sm:py-14">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-300"><WandSparkles size={27} /></span>
      <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Create a clean cutout in seconds</h2>
      <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Remove the original background, add a studio template or your own image, fine-tune the composition, then export in high quality.</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"><Upload size={16} /> Upload image</button>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">JPG, PNG, WebP · up to 20 MB · max 40 megapixels · processed in your browser</p>
    </div> : <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300"><ImageIcon size={21} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{dimensions.width} × {dimensions.height} px · {sizeLabel(file.size)}{resultUrl ? ` · cutout ${sizeLabel(resultSize)}` : ""}</p></div><button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Change photo</button><button type="button" disabled={busy} onClick={clearAll} aria-label="Remove selected image" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"><Trash2 size={17} /></button></div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 dark:text-white">Live preview</h3><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{resultUrl ? "Edited composition" : "Original photo"}</span></div>
          <div ref={previewRef} onPointerLeave={() => setCursorPosition((position) => ({ ...position, visible: false }))} className="relative mx-auto w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-950" style={{ aspectRatio: `${dimensions.width || 4} / ${dimensions.height || 3}`, maxHeight: "620px" }}>
            {resultUrl ? <>
              <div className="absolute inset-0" style={previewBackgroundStyle()} />
              {backgroundMode === "blur" && <div className="absolute inset-0" style={{ backdropFilter: `blur(${Math.max(4, blurAmount / 2)}px)` }} />}
              <canvas
                ref={editCanvasRef}
                aria-label={brushMode === "none" ? "Background-removed subject preview" : `${brushMode} brush canvas`}
                onPointerDown={beginBrush}
                onPointerMove={continueBrush}
                onPointerUp={finishBrush}
                onPointerCancel={finishBrush}
                className={`absolute inset-0 h-full w-full object-contain transition-transform ${brushMode !== "none" ? "cursor-none touch-none" : "pointer-events-none"}`}
                style={{ transform: `translate(${subjectX}%, ${subjectY}%) scale(${(subjectScale * zoom) / 10000})`, filter: shadow ? "drop-shadow(0 10px 18px rgba(15,23,42,.24))" : "none" }}
              />
              {brushMode !== "none" && cursorPosition.visible && <div
                aria-hidden="true"
                className={`pointer-events-none absolute z-30 rounded-full border-2 ${brushMode === "erase" ? "border-white shadow-[0_0_0_1px_rgba(15,23,42,0.95),0_0_8px_rgba(0,0,0,0.45)]" : "border-emerald-300 shadow-[0_0_0_1px_rgba(6,78,59,0.95),0_0_8px_rgba(0,0,0,0.4)]"}`}
                style={{ width: `${brushSize}px`, height: `${brushSize}px`, left: `${cursorPosition.x}px`, top: `${cursorPosition.y}px`, transform: "translate(-50%, -50%)" }}
              />}
            </> : <img src={sourceUrl} alt="Original photo before background removal" className="absolute inset-0 h-full w-full object-contain" />}
          </div>
          <div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void removeBackground()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><RefreshCw size={16} className="animate-spin" /> Processing…</> : <><Sparkles size={16} /> {resultUrl ? "Reprocess cutout" : "Remove background"}</>}</button>{resultUrl && <a href={editedCutoutUrl || resultUrl} download={`${safeBaseName(file.name)}-transparent.png`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16} /> Transparent PNG</a>}</div>
          {progress && <p role="status" className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{progress}</p>}
        </div>

        <div className="space-y-5">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex items-center gap-2"><Palette size={17} className="text-indigo-600" /><h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose a background</h3></div>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" onClick={() => setBackgroundMode("transparent")} className={`rounded-lg border p-2 text-left text-xs font-semibold ${backgroundMode === "transparent" ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950" : "border-slate-200 dark:border-slate-700"}`}><span className="mb-2 block h-10 rounded-md" style={{ backgroundImage: "linear-gradient(45deg,#e5e7eb 25%,transparent 25%),linear-gradient(-45deg,#e5e7eb 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#e5e7eb 75%),linear-gradient(-45deg,transparent 75%,#e5e7eb 75%)", backgroundSize: "12px 12px", backgroundPosition: "0 0,0 6px,6px -6px,-6px 0" }} />Transparent</button>
              <button type="button" onClick={() => setBackgroundMode("color")} className={`rounded-lg border p-2 text-left text-xs font-semibold ${backgroundMode === "color" ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950" : "border-slate-200 dark:border-slate-700"}`}><span className="mb-2 block h-10 rounded-md" style={{ background: solidColor }} />Solid color</button>
              <button type="button" onClick={() => setBackgroundMode("blur")} className={`rounded-lg border p-2 text-left text-xs font-semibold ${backgroundMode === "blur" ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950" : "border-slate-200 dark:border-slate-700"}`}><span className="mb-2 block h-10 rounded-md bg-gradient-to-br from-slate-400 via-indigo-300 to-slate-700" />Blur original</button>
            </div>
            {backgroundMode === "color" && <div className="mt-3 flex items-center gap-3"><input aria-label="Custom background color" type="color" value={solidColor} onChange={(event) => setSolidColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded border-0 bg-transparent" /><span className="text-sm text-slate-600 dark:text-slate-300">{solidColor.toUpperCase()}</span><div className="flex flex-wrap gap-1.5">{["#ffffff", "#000000", "#e0e7ff", "#dcfce7", "#fce7f3", "#fef3c7"].map((color) => <button key={color} type="button" aria-label={`Set background color ${color}`} onClick={() => setSolidColor(color)} className="h-6 w-6 rounded-full border border-slate-300" style={{ background: color }} />)}</div></div>}
            {backgroundMode === "blur" && <div className="mt-4"><div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="blur-amount">Blur strength</label><span>{blurAmount}px</span></div><input id="blur-amount" type="range" min="6" max="36" value={blurAmount} onChange={(event) => setBlurAmount(Number(event.target.value))} className="w-full accent-indigo-600" /></div>}
            <div className="mt-4"><p className="mb-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Studio & creative templates</p><div className="grid grid-cols-3 gap-2">{PRESETS.map((preset) => <button key={preset.id} type="button" onClick={() => { setPresetId(preset.id); setBackgroundMode("preset"); }} aria-pressed={backgroundMode === "preset" && presetId === preset.id} className={`rounded-lg border p-1.5 text-left ${backgroundMode === "preset" && presetId === preset.id ? "border-indigo-500 ring-2 ring-indigo-100 dark:ring-indigo-950" : "border-slate-200 dark:border-slate-700"}`}><span className="mb-1 block h-10 rounded-md" style={{ background: `linear-gradient(${preset.angle}deg, ${preset.colors.join(", ")})` }} /><span className="block truncate text-[11px] font-medium text-slate-700 dark:text-slate-300">{preset.name}</span></button>)}</div></div>
            <button type="button" onClick={() => backgroundInputRef.current?.click()} className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm font-semibold ${backgroundMode === "custom" ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300" : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"}`}><Upload size={16} />{customBackgroundName && backgroundMode === "custom" ? `Custom: ${customBackgroundName}` : "Upload your own background"}</button>
          </div>

          {resultUrl && <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Manual touch-up</h3>
              <div className="flex gap-1">
                <button type="button" onClick={undoEdit} disabled={undoCount === 0} aria-label="Undo brush stroke" title="Undo" className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><Undo2 size={16} /></button>
                <button type="button" onClick={redoEdit} disabled={redoCount === 0} aria-label="Redo brush stroke" title="Redo" className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 dark:border-slate-700"><Redo2 size={16} /></button>
                <button type="button" onClick={() => setZoom((value) => Math.max(50, value - 10))} aria-label="Zoom out" title="Zoom out" className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"><ZoomOut size={16} /></button>
                <span className="self-center px-1 text-xs text-slate-500">{zoom}%</span>
                <button type="button" onClick={() => setZoom((value) => Math.min(160, value + 10))} aria-label="Zoom in" title="Zoom in" className="rounded-lg border border-slate-200 p-2 dark:border-slate-700"><ZoomIn size={16} /></button>
              </div>
            </div>
            <p className="mb-3 text-xs leading-5 text-slate-500 dark:text-slate-400">Erase unwanted leftover areas, or restore parts from the original AI cutout. Brush changes are included in downloads.</p>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" aria-pressed={brushMode === "none"} onClick={() => setBrushMode("none")} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${brushMode === "none" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" : "border-slate-200 dark:border-slate-700"}`}>Preview</button>
              <button type="button" aria-pressed={brushMode === "erase"} onClick={() => setBrushMode(brushMode === "erase" ? "none" : "erase")} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${brushMode === "erase" ? "border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300" : "border-slate-200 dark:border-slate-700"}`}>Erase</button>
              <button type="button" aria-pressed={brushMode === "restore"} onClick={() => setBrushMode(brushMode === "restore" ? "none" : "restore")} className={`rounded-lg border px-2 py-2 text-xs font-semibold ${brushMode === "restore" ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300" : "border-slate-200 dark:border-slate-700"}`}>Restore</button>
            </div>
            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="brush-size">Brush size</label><span>{brushSize}px</span></div>
              <input id="brush-size" type="range" min="8" max="100" step="2" value={brushSize} onChange={(event) => setBrushSize(Number(event.target.value))} className="w-full accent-indigo-600" />
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="edge-softness">Erase edge softness</label><span>{edgeSoftness}px</span></div>
              <input id="edge-softness" type="range" min="0" max="24" step="1" value={edgeSoftness} onChange={(event) => setEdgeSoftness(Number(event.target.value))} disabled={brushMode !== "erase"} className="w-full accent-indigo-600 disabled:opacity-40" />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <button type="button" onClick={() => { const base = baseCutoutImageRef.current; const canvas = editCanvasRef.current; const ctx = canvas?.getContext("2d"); if (base && canvas && ctx) { undoStackRef.current.push(currentCanvasSnapshot()); if (undoStackRef.current.length > 6) undoStackRef.current.shift(); redoStackRef.current = [];
syncHistoryCounts();

ctx.clearRect(0, 0, canvas.width, canvas.height); setEditedCutoutUrl(""); setHistoryVersion((v) => v + 1); } }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">Reset brush edits</button>
              <span className="text-[11px] text-slate-500"> {undoCount} undo step{undoCount === 1 ? "" : "s"}</span>
            </div>
          </div>}

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Fine-tune subject</h3>
            <div className="space-y-4">
              <div><div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="subject-scale">Subject size</label><span>{subjectScale}%</span></div><input id="subject-scale" type="range" min="60" max="140" step="5" value={subjectScale} onChange={(event) => setSubjectScale(Number(event.target.value))} className="w-full accent-indigo-600" /></div>
              <div><div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="subject-x">Horizontal position</label><span>{subjectX > 0 ? "+" : ""}{subjectX}%</span></div><input id="subject-x" type="range" min="-25" max="25" step="1" value={subjectX} onChange={(event) => setSubjectX(Number(event.target.value))} className="w-full accent-indigo-600" /></div>
              <div><div className="mb-1 flex justify-between text-xs text-slate-600 dark:text-slate-300"><label htmlFor="subject-y">Vertical position</label><span>{subjectY > 0 ? "+" : ""}{subjectY}%</span></div><input id="subject-y" type="range" min="-25" max="25" step="1" value={subjectY} onChange={(event) => setSubjectY(Number(event.target.value))} className="w-full accent-indigo-600" /></div>
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"><input type="checkbox" checked={shadow} onChange={(event) => setShadow(event.target.checked)} className="h-4 w-4 accent-indigo-600" /> Add soft subject shadow</label>
              <button type="button" onClick={() => { setSubjectScale(100); setSubjectX(0); setSubjectY(0); setShadow(true); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-300">Reset adjustments</button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
            <h3 className="mb-3 text-sm font-bold text-slate-900 dark:text-white">Export settings</h3>
            <div className="grid grid-cols-2 gap-3"><label className="text-xs font-medium text-slate-600 dark:text-slate-300">Format<select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)} className="mt-1.5 block w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"><option value="image/png">PNG</option><option value="image/jpeg">JPG</option></select></label><div><div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300"><label htmlFor="export-quality">JPG quality</label><span>{quality}%</span></div><input id="export-quality" type="range" min="60" max="100" step="1" value={quality} onChange={(event) => setQuality(Number(event.target.value))} disabled={exportFormat !== "image/jpeg"} className="mt-3 w-full accent-indigo-600 disabled:opacity-40" /></div></div>
            <button type="button" disabled={!resultUrl || exporting} onClick={() => void exportComposite()} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">{exporting ? <><RefreshCw size={16} className="animate-spin" /> Exporting…</> : <><Download size={16} /> Export edited image</>}</button>
            {exportMessage && <p role="status" className="mt-3 flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300"><Check size={15} className="mt-0.5 shrink-0" />{exportMessage}</p>}
          </div>
        </div>
      </div>
    </div>}
    {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:text-slate-400"><p><strong className="text-slate-700 dark:text-slate-300">Privacy:</strong> your selected images are processed locally in the browser; the AI model may download model assets from its CDN. This tool does not upload your photos to our application server.</p><p><strong className="text-slate-700 dark:text-slate-300">Best results:</strong> use a sharp, well-lit photo with clear separation between the subject and background. Fine hair, transparent glass and motion blur may need manual editing in a dedicated editor.</p></div>
  </section>;
}
