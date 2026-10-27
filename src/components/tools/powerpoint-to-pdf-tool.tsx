"use client";

import { Download, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_SLIDES = 100;
type Slide = { number: number; text: string[] };

function safeBaseName(name: string) {
  return name.replace(/\.pptx$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "presentation";
}
function pdfSafe(value: string) {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/\u00A0/g, " ").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}
function wrapText(value: string, maxChars: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxChars) line += ` ${word}`;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

export default function PowerPointToPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  function clearResult() {
    setResult((current) => { if (current) URL.revokeObjectURL(current.url); return null; });
  }

  async function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult(); setSlides([]); setFile(null);
    if (!nextFile) return;
    if (!/\.pptx$/i.test(nextFile.name)) { setError("Please choose a PowerPoint presentation in .pptx format. Legacy .ppt files are not supported."); return; }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) { setError("Choose a non-empty PPTX file no larger than 25 MB."); return; }
    try {
      setProgress("Reading presentation locally…");
      const JSZip = (await import("jszip")).default;
      const archive = await JSZip.loadAsync(await nextFile.arrayBuffer());
      const slideFiles = Object.keys(archive.files)
        .map((path) => ({ path, match: path.match(/^ppt\/slides\/slide(\d+)\.xml$/) }))
        .filter((item) => item.match && !archive.files[item.path].dir)
        .sort((a, b) => Number(a.match?.[1]) - Number(b.match?.[1]));
      if (!slideFiles.length) throw new Error("No slide XML was found. Make sure this is a valid .pptx file.");
      if (slideFiles.length > MAX_SLIDES) throw new Error(`This prototype supports up to ${MAX_SLIDES} slides per presentation.`);
      const parsedSlides: Slide[] = [];
      for (let index = 0; index < slideFiles.length; index++) {
        const xmlText = await archive.file(slideFiles[index].path)!.async("text");
        const xml = new DOMParser().parseFromString(xmlText, "application/xml");
        if (xml.querySelector("parsererror")) continue;
        const paragraphs = Array.from(xml.getElementsByTagName("a:p"));
        const text = paragraphs.map((paragraph) => Array.from(paragraph.getElementsByTagName("a:t")).map((node) => node.textContent ?? "").join("").trim()).filter(Boolean);
        parsedSlides.push({ number: index + 1, text });
        setProgress(`Reading slide ${index + 1} of ${slideFiles.length}…`);
      }
      if (!parsedSlides.length) throw new Error("The presentation did not contain readable slide text.");
      setFile(nextFile); setSlides(parsedSlides);
      const nonEmpty = parsedSlides.filter((slide) => slide.text.length).length;
      setProgress(`Loaded ${parsedSlides.length} slide(s); ${nonEmpty} contain extractable text. Create a PDF to continue.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      setProgress(""); setError(cause instanceof Error ? cause.message : "Could not read this PowerPoint presentation.");
    }
  }

  async function convert() {
    if (!file || !slides.length) { setError("Choose a valid PPTX presentation first."); return; }
    setBusy(true); setError(""); setProgress("Creating PDF pages locally…"); clearResult();
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pageWidth = 842; const pageHeight = 595; const margin = 44;
      const titleFontSize = 19; const bodyFontSize = 12; const lineHeight = 18;
      for (let index = 0; index < slides.length; index++) {
        const slide = slides[index];
        const page = pdf.addPage([pageWidth, pageHeight]);
        page.drawRectangle({ x: 0, y: pageHeight - 12, width: pageWidth, height: 12, color: rgb(0.24, 0.32, 0.78) });
        page.drawText(pdfSafe(`Slide ${slide.number}`), { x: margin, y: pageHeight - 54, size: 9, font, color: rgb(0.35, 0.4, 0.5) });
        const title = pdfSafe(slide.text[0] || `Slide ${slide.number}`);
        page.drawText(title.slice(0, 100), { x: margin, y: pageHeight - 88, size: titleFontSize, font: boldFont, color: rgb(0.08, 0.12, 0.22), maxWidth: pageWidth - margin * 2 });
        let y = pageHeight - 125;
        const bodyLines = slide.text.slice(slide.text.length && slide.text[0] ? 1 : 0).flatMap((line) => wrapText(pdfSafe(line), 100));
        if (!bodyLines.length) bodyLines.push("No extractable text found on this slide.");
        for (const line of bodyLines) {
          if (y < margin + 20) {
            page.drawText("Additional slide text was omitted because it exceeded one page.", { x: margin, y: margin, size: 9, font, color: rgb(0.5, 0.25, 0.2) });
            break;
          }
          page.drawText(line.slice(0, 120), { x: margin, y, size: bodyFontSize, font, color: rgb(0.17, 0.2, 0.28), maxWidth: pageWidth - margin * 2 });
          y -= lineHeight;
        }
        page.drawText("Generated locally · Text extraction only; slide design and images are not preserved", { x: margin, y: 20, size: 8, font, color: rgb(0.45, 0.48, 0.54) });
        if (index % 5 === 0) setProgress(`Creating PDF page ${index + 1} of ${slides.length}…`);
      }
      const bytes = await pdf.save();
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const name = `${safeBaseName(file.name)}.pdf`;
      setResult({ url, name });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — created a ${slides.length}-page PDF. Review it for text that may have been omitted or simplified.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the PDF."); setProgress("");
    } finally { setBusy(false); }
  }

  return (
    <section aria-label="Convert PowerPoint to PDF" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><FileText size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a PowerPoint presentation</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Extract slide text and create a readable PDF. Your file stays in your browser.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select PPTX file</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">PPTX only · up to 25 MB · up to 100 slides · local processing</p>
      </div> : <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><FileText size={21} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · {slides.length} slide(s)</p></div><button type="button" disabled={busy} onClick={() => { setFile(null); setSlides([]); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected presentation" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Conversion note:</strong> This prototype extracts slide text only. Images, charts, shapes, animations, fonts, colors, and exact layout are not preserved. Some text may be omitted if a slide contains too much content.</div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950"><p className="text-sm font-semibold text-slate-900 dark:text-white">Text preview</p><div className="mt-3 space-y-2">{slides.slice(0, 3).map((slide) => <div key={slide.number} className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Slide {slide.number}</p><p className="mt-1 text-sm text-slate-800 dark:text-slate-200">{slide.text.slice(0, 3).join(" · ") || "No extractable text"}</p></div>)}</div></div>
        <div className="flex flex-wrap gap-3"><button type="button" disabled={busy} onClick={() => void convert()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <><LoaderCircle size={16} className="animate-spin" /> Creating PDF…</> : <><Download size={16} /> Convert to PDF</>}</button>{result && <a href={result.url} download={result.name} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><Download size={16} /> Download again</a>}</div>
      </div>}
      {progress && <p role="status" className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">{progress}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
    </section>
  );
}
