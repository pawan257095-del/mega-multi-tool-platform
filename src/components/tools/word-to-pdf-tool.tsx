"use client";

import { Download, FileText, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_PARAGRAPHS = 5000;
const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

function safeBaseName(name: string) {
  return name.replace(/\.docx$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "document";
}

function normalizePdfText(value: string) {
  // pdf-lib's standard Helvetica font supports WinAnsi, not every Unicode glyph.
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}

export default function WordToPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  function clearResult() {
    setResult((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult();
    if (!nextFile) return;
    if (!(nextFile.name.toLowerCase().endsWith(".docx") || nextFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setFile(null); setError("Please choose a .docx Word document. Legacy .doc files are not supported."); return;
    }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) {
      setFile(null); setError("Choose a non-empty DOCX file no larger than 20 MB."); return;
    }
    setFile(nextFile);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function convertWord() {
    if (!file) { setError("Choose a Word document first."); return; }
    setBusy(true); setError(""); setProgress("Reading the Word document locally…"); clearResult();
    try {
      const JSZip = (await import("jszip")).default;
      const archive = await JSZip.loadAsync(await file.arrayBuffer());
      const documentXml = archive.file("word/document.xml");
      if (!documentXml) throw new Error("This file does not contain a valid Word document body.");
      const xmlText = await documentXml.async("text");
      const xml = new DOMParser().parseFromString(xmlText, "application/xml");
      if (xml.getElementsByTagName("parsererror").length) throw new Error("The DOCX document structure could not be read.");
      const paragraphNodes = Array.from(xml.getElementsByTagNameNS(WORD_NS, "p"));
      if (paragraphNodes.length === 0) throw new Error("No text paragraphs were found in this document.");
      if (paragraphNodes.length > MAX_PARAGRAPHS) throw new Error(`This tool supports up to ${MAX_PARAGRAPHS.toLocaleString()} paragraphs.`);

      const paragraphs = paragraphNodes.map((paragraph) => {
        const textNodes = Array.from(paragraph.getElementsByTagNameNS(WORD_NS, "t"));
        return normalizePdfText(textNodes.map((node) => node.textContent ?? "").join("")).trimEnd();
      });
      if (!paragraphs.some((paragraph) => paragraph.trim())) throw new Error("No readable text was found in this Word document.");

      setProgress("Creating the PDF locally…");
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pageWidth = 612;
      const pageHeight = 792;
      const marginX = 54;
      const marginTop = 54;
      const marginBottom = 54;
      const fontSize = 11;
      const lineHeight = 15;
      const maxWidth = pageWidth - marginX * 2;
      let page = pdf.addPage([pageWidth, pageHeight]);
      let y = pageHeight - marginTop;

      const addPage = () => { page = pdf.addPage([pageWidth, pageHeight]); y = pageHeight - marginTop; };
      const wrap = (text: string) => {
        if (!text) return [""];
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
          const candidate = current ? `${current} ${word}` : word;
          if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth || !current) current = candidate;
          else { lines.push(current); current = word; }
        }
        if (current) lines.push(current);
        return lines;
      };

      paragraphs.forEach((paragraph, index) => {
        setProgress(`Formatting paragraph ${index + 1} of ${paragraphs.length}…`);
        const lines = wrap(paragraph);
        const styleNode = paragraphNodes[index].getElementsByTagNameNS(WORD_NS, "pStyle")[0];
        const styleName = styleNode?.getAttributeNS(WORD_NS, "val") ?? styleNode?.getAttribute("w:val") ?? "";
        const isHeading = /^(heading\s*[1-6]|title|subtitle)$/i.test(styleName);
        const spacing = paragraph.trim() ? 4 : 7;
        for (const line of lines) {
          if (y - lineHeight < marginBottom) addPage();
          page.drawText(line, {
            x: marginX,
            y: y - (isHeading ? 1 : 0),
            size: isHeading ? 13 : fontSize,
            font: isHeading ? boldFont : font,
            color: rgb(0.12, 0.15, 0.2),
            maxWidth,
          });
          y -= lineHeight;
        }
        y -= spacing;
      });

      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const name = `${safeBaseName(file.name)}.pdf`;
      setResult({ url, name });
      const anchor = document.createElement("a");
      anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — converted ${paragraphs.length.toLocaleString()} paragraphs into a ${pdf.getPageCount()}-page PDF. Review the output, especially formatting and non-English characters.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not convert this Word document.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-label="Convert Word to PDF" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={(event) => chooseFile(event.target.files?.[0])} />
      {!file ? (
        <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/70 px-5 py-10 text-center dark:border-blue-900 dark:bg-blue-950/20 sm:py-14">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-300"><FileText size={27} aria-hidden="true" /></span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose a Word document</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Convert a .docx file into a downloadable PDF. Files are processed locally in your browser.</p>
          <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">Select DOCX file</button>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">DOCX only · up to 20 MB · local processing</p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><FileText size={21} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · ready to convert locally</p></div>
            <button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected Word document" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Formatting note:</strong> This prototype extracts text from DOCX and lays it out in a new PDF. Images, tables, columns, original fonts, colors, headers/footers, and exact page layout are not preserved. Some unsupported characters may be replaced.</div>
          <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void convertWord()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <FileText size={17} />}{busy ? "Converting Word…" : "Convert to PDF"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
          {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 underline dark:text-blue-300"><Download size={16}/> Download PDF again</a>}
        </div>
      )}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {progress && <p role="status" className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{progress}</p>}
    </section>
  );
}
