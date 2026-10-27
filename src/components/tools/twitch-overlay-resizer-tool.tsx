"use client";

import { useEffect, useRef, useState } from "react";

type Preset = "1920x1080" | "1280x720" | "1600x900" | "1080x1920" | "custom";
type FitMode = "contain" | "cover" | "stretch";

const presets: Record<Exclude<Preset, "custom">, { width: number; height: number; label: string }> = {
  "1920x1080": { width: 1920, height: 1080, label: "Full HD stream (1920 × 1080)" },
  "1280x720": { width: 1280, height: 720, label: "HD stream (1280 × 720)" },
  "1600x900": { width: 1600, height: 900, label: "16:9 canvas (1600 × 900)" },
  "1080x1920": { width: 1080, height: 1920, label: "Vertical canvas (1080 × 1920)" },
};

export default function TwitchOverlayResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [preset, setPreset] = useState<Preset>("1920x1080");
  const [customWidth, setCustomWidth] = useState("1920");
  const [customHeight, setCustomHeight] = useState("1080");
  const [fit, setFit] = useState<FitMode>("contain");
  const [background, setBackground] = useState("#111827");
  const [qualityNote, setQualityNote] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
    let cancelled = false;
    let objectUrl = "";

    const createPreview = async () => {
      await Promise.resolve();
      if (cancelled) return;

      if (!file) {
        setPreviewUrl("");
        return;
      }

      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    };

    void createPreview();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const dimensions = preset === "custom"
    ? { width: Number(customWidth), height: Number(customHeight) }
    : presets[preset];

  function handleFile(nextFile?: File) {
    setError("");
    setQualityNote("");
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setError("Choose an image file such as PNG, JPEG, or WebP.");
      return;
    }
    if (nextFile.size > 20 * 1024 * 1024) {
      setError("Please choose an image smaller than 20 MB.");
      return;
    }
    setFile(nextFile);
  }

  function drawToCanvas(): boolean {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    const width = Math.floor(dimensions.width);
    const height = Math.floor(dimensions.height);
    if (!canvas || !image || !image.complete || !image.naturalWidth || !image.naturalHeight) {
      setError("Wait for the image preview to load, then try again.");
      return false;
    }
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 4096 || height > 4096) {
      setError("Width and height must be whole numbers between 1 and 4096 pixels.");
      return false;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Your browser could not create a canvas for this image.");
      return false;
    }
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    if (fit === "stretch") {
      ctx.drawImage(image, 0, 0, width, height);
    } else {
      const scale = fit === "contain"
        ? Math.min(width / image.naturalWidth, height / image.naturalHeight)
        : Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const x = (width - drawWidth) / 2;
      const y = (height - drawHeight) / 2;
      ctx.drawImage(image, x, y, drawWidth, drawHeight);
    }
    setError("");
    setQualityNote("The image was processed in your browser. Upscaling may reduce sharpness; the contain mode may leave background margins, while cover mode crops edges.");
    return true;
  }

  function downloadPng() {
    if (!file || !drawToCanvas()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        setError("The browser could not export this image as PNG.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `twitch-overlay-${canvas.width}x${canvas.height}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-lg font-semibold">Twitch Overlay Resizer</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Resize a local overlay image to a stream canvas size. Your image is processed in your browser and is not uploaded to a server by this tool.
        </p>
        <div className="mt-5">
          <label htmlFor="twitch-image" className="mb-1 block text-sm font-medium">Choose overlay image (up to 20 MB)</label>
          <input id="twitch-image" type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])}
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-4 file:py-2 file:font-medium file:text-white" />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="twitch-preset" className="mb-1 block text-sm font-medium">Canvas size</label>
            <select id="twitch-preset" value={preset} onChange={(e) => setPreset(e.target.value as Preset)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              {Object.entries(presets).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
              <option value="custom">Custom dimensions</option>
            </select>
          </div>
          <div>
            <label htmlFor="twitch-fit" className="mb-1 block text-sm font-medium">Resize behavior</label>
            <select id="twitch-fit" value={fit} onChange={(e) => setFit(e.target.value as FitMode)}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800">
              <option value="contain">Fit inside (no crop)</option>
              <option value="cover">Fill canvas (crop edges)</option>
              <option value="stretch">Stretch to exact size</option>
            </select>
          </div>
        </div>

        {preset === "custom" && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="twitch-width" className="mb-1 block text-sm font-medium">Width (px)</label><input id="twitch-width" type="number" min="1" max="4096" value={customWidth} onChange={(e) => setCustomWidth(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>
            <div><label htmlFor="twitch-height" className="mb-1 block text-sm font-medium">Height (px)</label><input id="twitch-height" type="number" min="1" max="4096" value={customHeight} onChange={(e) => setCustomHeight(e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm dark:border-slate-600 dark:bg-slate-800" /></div>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="twitch-background" className="mb-1 block text-sm font-medium">Background color for empty space</label>
          <div className="flex items-center gap-3">
            <input id="twitch-background" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="h-11 w-14 rounded border border-slate-300 p-1" />
            <span className="text-sm text-slate-600 dark:text-slate-300">{background}</span>
          </div>
        </div>
      </section>

      {previewUrl && (
        <section className="rounded-xl border border-slate-200 p-5 dark:border-slate-700">
          <h3 className="font-semibold">Source preview</h3>
          <div className="mt-3 flex max-h-96 items-center justify-center overflow-hidden rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
            <img ref={imageRef} src={previewUrl} alt="Selected overlay preview" onLoad={() => setError("")} className="max-h-80 max-w-full object-contain" />
          </div>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
            Output: {dimensions.width || "—"} × {dimensions.height || "—"} pixels
          </p>
          <button type="button" onClick={downloadPng} className="mt-4 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
            Resize and download PNG
          </button>
        </section>
      )}

      {error && <p role="alert" className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200">{error}</p>}
      {qualityNote && <p role="status" className="text-sm text-slate-600 dark:text-slate-300">{qualityNote}</p>}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
