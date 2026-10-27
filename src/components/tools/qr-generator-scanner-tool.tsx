"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Clipboard, Download, QrCode, ScanLine, Trash2 } from "lucide-react";

type BarcodeDetectorResult = { rawValue: string; format?: string };
type BarcodeDetectorLike = { detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]> };
type BarcodeDetectorConstructor = new (options?: { formats?: string[] }) => BarcodeDetectorLike;

const sample = "https://example.com/?source=qr";

export default function QRGeneratorScannerTool() {
  const [input, setInput] = useState(sample);
  const [size, setSize] = useState("320");
  const [errorCorrection, setErrorCorrection] = useState("M");
  const [foreground, setForeground] = useState("#111827");
  const [background, setBackground] = useState("#ffffff");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    let active = true;

    const generateQR = async () => {
      await Promise.resolve();
      if (!active) return;

      if (!input.trim()) {
        setQrDataUrl("");
        setGenerateError("");
        return;
      }

      setGenerateError("");

      try {
        const url = await QRCode.toDataURL(input, {
          width: Number(size),
          margin: 2,
          errorCorrectionLevel: errorCorrection as "L" | "M" | "Q" | "H",
          color: { dark: foreground, light: background },
        });

        if (active) setQrDataUrl(url);
      } catch (err: unknown) {
        if (!active) return;

        setQrDataUrl("");
        setGenerateError(
          err instanceof Error ? err.message : "Could not generate a QR code.",
        );
      }
    };

    void generateQR();

    return () => {
      active = false;
    };
  }, [input, size, errorCorrection, foreground, background]);
  async function scanFile(file?: File) {
    setScanError(""); setScanResult("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setScanError("Choose an image file containing a QR code."); return; }
    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!Detector) {
      setScanError("QR scanning is not supported by this browser. Try a recent Chromium-based browser with BarcodeDetector support, or use another QR scanner.");
      return;
    }
    let bitmap: ImageBitmap | undefined;
    try {
      bitmap = await createImageBitmap(file);
      const detector = new Detector({ formats: ["qr_code"] });
      const results = await detector.detect(bitmap);
      if (!results.length) setScanError("No QR code was detected in this image. Try a clearer, well-lit image with the full code visible.");
      else setScanResult(results.map((item) => item.rawValue).join("\n"));
    } catch (err) {
      setScanError(err instanceof Error ? `Could not scan this image: ${err.message}` : "Could not scan this image.");
    } finally {
      bitmap?.close();
    }
  }

  async function copyText(value: string) {
    if (!value) return;
    try { await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setScanError("Clipboard access was blocked. Select the text and copy it manually."); }
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const anchor = document.createElement("a"); anchor.href = qrDataUrl; anchor.download = "qr-code.png"; anchor.click();
  }

  return <div className="grid gap-6 lg:grid-cols-2">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex items-center gap-2"><QrCode size={20} className="text-indigo-600"/><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Generate QR code</h2></div>
      <label htmlFor="qr-content" className="mt-5 block text-sm font-medium text-slate-700 dark:text-slate-300">Text or URL</label>
      <textarea id="qr-content" value={input} onChange={(e) => setInput(e.target.value)} rows={4} placeholder="Enter a website URL, contact info, or plain text…" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="qr-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Image size</label><select id="qr-size" value={size} onChange={(e) => setSize(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="192">192 × 192</option><option value="320">320 × 320</option><option value="512">512 × 512</option><option value="1024">1024 × 1024</option></select></div>
        <div><label htmlFor="qr-correction" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Error correction</label><select id="qr-correction" value={errorCorrection} onChange={(e) => setErrorCorrection(e.target.value)} className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="L">Low (L)</option><option value="M">Medium (M)</option><option value="Q">Quartile (Q)</option><option value="H">High (H)</option></select></div>
        <div><label htmlFor="qr-foreground" className="block text-sm font-medium text-slate-700 dark:text-slate-300">QR color</label><input id="qr-foreground" type="color" value={foreground} onChange={(e) => setForeground(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" /></div>
        <div><label htmlFor="qr-background" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Background color</label><input id="qr-background" type="color" value={background} onChange={(e) => setBackground(e.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950" /></div>
      </div>
      {generateError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">{generateError}</p>}
      <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={downloadQR} disabled={!qrDataUrl} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"><Download size={16}/> Download PNG</button><button type="button" onClick={() => { setInput(""); setQrDataUrl(""); setGenerateError(""); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><Trash2 size={15}/> Clear</button><button type="button" onClick={() => setInput(sample)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Load sample</button></div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">QR preview</h2>
      <div className="mt-4 flex min-h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950">{qrDataUrl ? <img src={qrDataUrl} alt="Generated QR code" width={Number(size)} height={Number(size)} className="h-auto max-w-full rounded bg-white" /> : <p className="text-sm text-slate-500">Enter text or a URL to generate a QR code.</p>}</div>
      <p className="mt-3 break-all text-xs leading-5 text-slate-500 dark:text-slate-400">{input.length.toLocaleString()} characters · Generated locally in your browser.</p>
      <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800"><div className="flex items-center gap-2"><ScanLine size={19} className="text-indigo-600"/><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Scan QR from image</h2></div><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Select a PNG, JPG, or other browser-readable image containing a QR code. Scanning uses the browser’s BarcodeDetector API when available.</p><input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => scanFile(e.target.files?.[0])} className="mt-4 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2.5 file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-300 dark:file:bg-indigo-950 dark:file:text-indigo-300" />
        {scanError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm leading-6 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">{scanError}</p>}
        {scanResult && <><label htmlFor="qr-scan-result" className="mt-4 block text-sm font-medium text-slate-700 dark:text-slate-300">Scanned content</label><textarea id="qr-scan-result" readOnly value={scanResult} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"/><button type="button" onClick={() => copyText(scanResult)} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-slate-900">{copied ? <Check size={15}/> : <Clipboard size={15}/>} {copied ? "Copied" : "Copy scanned text"}</button></>}
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300"><strong className="text-slate-900 dark:text-white">Tip:</strong> Use a dark foreground on a light background for reliable scanning. A QR code can contain sensitive data, so only encode information you intend to share.</div>
    </section>
  </div>;
}
