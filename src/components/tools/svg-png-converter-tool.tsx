"use client";

import { useRef, useState } from "react";
import { Download, Image as ImageIcon, RotateCcw, Upload } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
type Mode = "svg-to-png" | "png-to-svg";

export default function SvgPngConverterTool() {
  const [mode, setMode] = useState<Mode>("svg-to-png");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [width, setWidth] = useState("1024");
  const [height, setHeight] = useState("1024");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function clear() {
    setFile(null); setPreview(""); setOutput(""); setError(""); setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  }
  function switchMode(next: Mode) {
    setMode(next); clear();
  }
  async function handleFile(next: File | null) {
    clear();
    if (!next) return;
    const isSvg = next.type === "image/svg+xml" || /\.svg$/i.test(next.name);
    const isPng = next.type === "image/png" || /\.png$/i.test(next.name);
    if ((mode === "svg-to-png" && !isSvg) || (mode === "png-to-svg" && !isPng)) {
      setError(mode === "svg-to-png" ? "Choose an SVG file for SVG to PNG conversion." : "Choose a PNG file for PNG to SVG conversion.");
      return;
    }
    if (next.size > 15 * 1024 * 1024) { setError("File is too large. Maximum supported file size is 15 MB."); return; }
    setFile(next);
    const url = URL.createObjectURL(next);
    setPreview(url);
  }

  async function convert() {
    if (!file) return;
    setBusy(true); setError(""); setOutput("");
    try {
      if (mode === "svg-to-png") {
        const svgText = await file.text();
        if (!/<svg[\s>]/i.test(svgText)) throw new Error("The file does not appear to contain an SVG root element.");
        if (/<script\b|<foreignObject\b|\bon\w+\s*=|javascript:/i.test(svgText)) throw new Error("This SVG contains active content that is blocked for safety. Remove scripts, event handlers or foreignObject elements and try again.");
        const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
        const objectUrl = URL.createObjectURL(blob);
        try {
          const image = new Image();
          await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () => reject(new Error("Could not render this SVG. Check that it is valid and does not depend on external resources."));
            image.src = objectUrl;
          });
          const w = Number(width), h = Number(height);
          if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1 || w > 8192 || h > 8192) throw new Error("Width and height must be whole numbers between 1 and 8192 pixels.");
          const canvas = document.createElement("canvas");
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is unavailable in this browser.");
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(image, 0, 0, w, h);
          const png = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("PNG export failed.")), "image/png"));
          setOutput(URL.createObjectURL(png));
        } finally { URL.revokeObjectURL(objectUrl); }
      } else {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read the PNG file."));
          reader.onerror = () => reject(new Error("Could not read the PNG file."));
          reader.readAsDataURL(file);
        });
        const image = new Image();
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Could not decode this PNG image."));
          image.src = dataUrl;
        });
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${image.naturalWidth}" height="${image.naturalHeight}" viewBox="0 0 ${image.naturalWidth} ${image.naturalHeight}"><image width="${image.naturalWidth}" height="${image.naturalHeight}" href="${dataUrl}" /></svg>`;
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        setOutput(URL.createObjectURL(blob));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed. Please try another file.");
    } finally { setBusy(false); }
  }

  function download() {
    if (!output) return;
    const a = document.createElement("a");
    a.href = output;
    const base = (file?.name || "image").replace(/\.(svg|png)$/i, "");
    a.download = `${base}.${mode === "svg-to-png" ? "png" : "svg"}`;
    document.body.appendChild(a); a.click(); a.remove();
  }
  const accept = mode === "svg-to-png" ? ".svg,image/svg+xml" : ".png,image/png";
  return <div className="space-y-5">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" onClick={() => switchMode("svg-to-png")} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === "svg-to-png" ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>SVG → PNG</button>
        <button type="button" onClick={() => switchMode("png-to-svg")} className={`rounded-xl border px-4 py-3 text-sm font-semibold ${mode === "png-to-svg" ? "border-violet-500 bg-violet-50 text-violet-800 dark:bg-violet-950/40 dark:text-violet-200" : "border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-200"}`}>PNG → SVG wrapper</button>
      </div>
      <div className="mt-5 rounded-xl border-2 border-dashed border-slate-300 p-6 text-center dark:border-slate-700">
        <ImageIcon className="mx-auto text-slate-400" size={30} />
        <p className="mt-2 font-semibold text-slate-800 dark:text-slate-200">{file ? file.name : mode === "svg-to-png" ? "Choose an SVG image" : "Choose a PNG image"}</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Maximum file size: 15 MB. Processing stays in your browser.</p>
        <input ref={inputRef} type="file" accept={accept} onChange={(e) => void handleFile(e.target.files?.[0] ?? null)} className="sr-only" id="svg-png-file" />
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Upload size={15} /> Choose file</button>
      </div>
      {mode === "svg-to-png" && <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Output width (px)<input className={`${inputClass} mt-2`} type="number" min="1" max="8192" value={width} onChange={(e) => setWidth(e.target.value)} /></label>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Output height (px)<input className={`${inputClass} mt-2`} type="number" min="1" max="8192" value={height} onChange={(e) => setHeight(e.target.value)} /></label>
      </div>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => void convert()} disabled={!file || busy} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Converting…" : "Convert"}</button>
        <button type="button" onClick={clear} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15} /> Reset</button>
      </div>
    </section>
    {(preview || output) && <section className="grid gap-5 sm:grid-cols-2">
      {preview && <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Source preview</h2><div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%,transparent_75%,#e5e7eb_75%),linear-gradient(45deg,#e5e7eb_25%,white_25%,white_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]"><img src={preview} alt="Uploaded source preview" className="max-h-72 max-w-full object-contain" /></div></div>}
      {output && <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"><h2 className="mb-3 font-semibold text-slate-900 dark:text-white">Converted output</h2>{mode === "svg-to-png" ? <img src={output} alt="Converted PNG preview" className="max-h-72 max-w-full rounded-lg object-contain" /> : <p className="text-sm text-slate-600 dark:text-slate-300">SVG wrapper created. The PNG remains embedded as a raster image inside the SVG; it is not vectorized.</p>}<button type="button" onClick={download} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"><Download size={15} /> Download {mode === "svg-to-png" ? "PNG" : "SVG"}</button></div>}
    </section>}
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">SVG → PNG rasterizes the vector graphic at the chosen dimensions. PNG → SVG wraps the PNG inside an SVG container; it does not trace pixels into editable vector paths. Active SVG content is blocked for safer rendering.</p>
  </div>;
}
