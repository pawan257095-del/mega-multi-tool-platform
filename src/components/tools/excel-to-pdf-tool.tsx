"use client";

import { Download, FileSpreadsheet, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

type WorkbookInfo = { sheetNames: string[]; data: string[][][] };
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_ROWS = 5000;
const MAX_COLUMNS = 30;

function safeBaseName(name: string) {
  return name.replace(/\.(xlsx|xls|xlsm)$/i, "").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "") || "spreadsheet";
}
function pdfSafe(value: string) {
  return value.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/[\u2013\u2014]/g, "-").replace(/\u00A0/g, " ").replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "?");
}

export default function ExcelToPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<WorkbookInfo | null>(null);
  const [sheetIndex, setSheetIndex] = useState("0");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);

  function clearResult() {
    setResult((current) => { if (current) URL.revokeObjectURL(current.url); return null; });
  }
  async function chooseFile(nextFile?: File) {
    setError(""); setProgress(""); clearResult(); setWorkbook(null); setFile(null); setSheetIndex("0");
    if (!nextFile) return;
    if (!(/\.(xlsx|xls|xlsm)$/i.test(nextFile.name))) { setError("Please choose an Excel workbook (.xlsx, .xls, or .xlsm)."); return; }
    if (nextFile.size === 0 || nextFile.size > MAX_FILE_SIZE) { setError("Choose a non-empty Excel file no larger than 20 MB."); return; }
    try {
      setProgress("Reading workbook locally…");
      const XLSX = await import("xlsx");
      const parsed = XLSX.read(await nextFile.arrayBuffer(), { type: "array", cellDates: true });
      if (!parsed.SheetNames.length) throw new Error("No worksheets were found in this workbook.");
      const data = parsed.SheetNames.map((name) => {
        const rows = XLSX.utils.sheet_to_json<unknown[]>(parsed.Sheets[name], { header: 1, raw: false, defval: "" });
        return rows.slice(0, MAX_ROWS).map((row) => row.slice(0, MAX_COLUMNS).map((cell) => String(cell ?? "")));
      });
      setFile(nextFile); setWorkbook({ sheetNames: parsed.SheetNames, data });
      setProgress(`Workbook loaded: ${parsed.SheetNames.length} worksheet(s) detected. Select a sheet and export it to PDF.`);
      if (inputRef.current) inputRef.current.value = "";
    } catch (cause) {
      setProgress(""); setError(cause instanceof Error ? cause.message : "Could not read this Excel workbook.");
    }
  }

  async function convert() {
    if (!file || !workbook) { setError("Choose a valid Excel workbook first."); return; }
    const rows = workbook.data[Number(sheetIndex)];
    if (!rows?.length || !rows.some((row) => row.some((cell) => cell.trim()))) { setError("The selected worksheet has no printable data."); return; }
    setBusy(true); setError(""); setProgress("Creating PDF pages locally…"); clearResult();
    try {
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pageWidth = orientation === "landscape" ? 842 : 595;
      const pageHeight = orientation === "landscape" ? 595 : 842;
      const margin = 30;
      const usableWidth = pageWidth - margin * 2;
      const columns = Math.max(1, Math.min(MAX_COLUMNS, ...rows.map((row) => row.length)));
      const colWidth = usableWidth / columns;
      const fontSize = columns > 8 ? 6 : columns > 5 ? 7 : 8;
      const lineHeight = fontSize + 3;
      const rowHeight = Math.max(18, lineHeight * 2 + 5);
      let page = pdf.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin - 14;
      let pageNo = 1;
      const drawHeader = () => {
        page.drawText(pdfSafe(`${file.name} — ${workbook.sheetNames[Number(sheetIndex)]}`), { x: margin, y: pageHeight - margin + 2, size: 8, font, color: rgb(0.25, 0.29, 0.35), maxWidth: usableWidth });
      };
      const addPage = () => { page = pdf.addPage([pageWidth, pageHeight]); pageNo += 1; y = pageHeight - margin - 14; drawHeader(); };
      drawHeader();
      for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
        const row = rows[rowIndex].slice(0, columns);
        if (y - rowHeight < margin + 8) addPage();
        const isHeader = rowIndex === 0;
        for (let col = 0; col < columns; col++) {
          const x = margin + col * colWidth;
          const text = pdfSafe((row[col] ?? "").replace(/\s+/g, " "));
          page.drawRectangle({ x, y: y - rowHeight + 3, width: colWidth, height: rowHeight, borderColor: rgb(0.78, 0.81, 0.85), borderWidth: 0.35, color: isHeader ? rgb(0.9, 0.94, 0.98) : (rowIndex % 2 ? rgb(0.97, 0.98, 0.99) : rgb(1, 1, 1)) });
          const maxTextWidth = Math.max(1, colWidth - 6);
          let display = text;
          while (display.length > 0 && font.widthOfTextAtSize(display, fontSize) > maxTextWidth) display = display.slice(0, -1);
          if (display.length < text.length && display.length > 2) display = `${display.slice(0, -2)}…`;
          page.drawText(display, { x: x + 3, y: y - lineHeight - 1, size: fontSize, font: isHeader ? boldFont : font, color: rgb(0.12, 0.15, 0.2), maxWidth: maxTextWidth });
        }
        y -= rowHeight;
        if (rowIndex % 100 === 0) setProgress(`Laying out row ${rowIndex + 1} of ${rows.length}…`);
      }
      const bytes = await pdf.save();
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
      const name = `${safeBaseName(file.name)}-${safeBaseName(workbook.sheetNames[Number(sheetIndex)])}.pdf`;
      setResult({ url, name });
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = name; document.body.appendChild(anchor); anchor.click(); anchor.remove();
      setProgress(`Done — exported ${rows.length.toLocaleString()} rows across ${pageNo} page(s). Review the PDF for clipped or truncated cell values.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create the PDF."); setProgress("");
    } finally { setBusy(false); }
  }

  return (
    <section aria-label="Convert Excel to PDF" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.xlsm,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
      {!file ? <div onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void chooseFile(event.dataTransfer.files?.[0]); }} className="flex flex-col items-center rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-10 text-center dark:border-emerald-900 dark:bg-emerald-950/20 sm:py-14">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-300"><FileSpreadsheet size={27} aria-hidden="true" /></span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Choose an Excel workbook</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">Convert a worksheet into a downloadable PDF. Your file stays in your browser.</p>
        <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700">Select Excel file</button>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">XLSX, XLS, XLSM · up to 20 MB · local processing</p>
      </div> : <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300"><FileSpreadsheet size={21} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB · {workbook?.sheetNames.length ?? 0} worksheet(s)</p></div><button type="button" disabled={busy} onClick={() => { setFile(null); setWorkbook(null); setError(""); setProgress(""); clearResult(); }} aria-label="Remove selected workbook" className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-rose-950/30"><Trash2 size={17} /></button></div>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Worksheet<select value={sheetIndex} onChange={(event) => setSheetIndex(event.target.value)} disabled={busy} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white">{workbook?.sheetNames.map((name, index) => <option key={`${name}-${index}`} value={index}>{name}</option>)}</select></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Page orientation<select value={orientation} onChange={(event) => setOrientation(event.target.value as "portrait" | "landscape")} disabled={busy} className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-white"><option value="landscape">Landscape</option><option value="portrait">Portrait</option></select></label></div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Layout note:</strong> This prototype exports worksheet values as a simple table. It does not preserve charts, images, formulas as formulas, merged-cell layout, print areas, or exact Excel formatting. Long cell values may be shortened to fit. Only the selected worksheet is exported.</div>
        <div className="flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void convert()} disabled={busy} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <FileSpreadsheet size={17} />}{busy ? "Converting Excel…" : "Convert to PDF"}</button><button type="button" disabled={busy} onClick={() => { setFile(null); setWorkbook(null); setError(""); setProgress(""); clearResult(); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Choose another file</button></div>
        {result && <a href={result.url} download={result.name} className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 underline dark:text-emerald-300"><Download size={16}/> Download PDF again</a>}
      </div>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{error}</p>}
      {progress && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">{progress}</p>}
    </section>
  );
}
