
"use client";

import {
  PDFDocument,
  rgb,
} from "pdf-lib";
import {
  FileUp,
  FileText,
  Download,
  LoaderCircle,
  Ruler,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Trash2,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

type Unit = "mm" | "cm" | "in" | "pt";
type ResizeMode = "fit" | "fill" | "stretch" | "center";
type Orientation = "auto" | "portrait" | "landscape";

type PageSize = {
  label: string;
  width: number;
  height: number;
};

const PT_PER_INCH = 72;

const PAGE_SIZES: Record<string, PageSize> = {
  a0: { label: "A0", width: 2383.94, height: 3370.39 },
  a1: { label: "A1", width: 1683.78, height: 2383.94 },
  a2: { label: "A2", width: 1190.55, height: 1683.78 },
  a3: { label: "A3", width: 841.89, height: 1190.55 },
  a4: { label: "A4", width: 595.28, height: 841.89 },
  a5: { label: "A5", width: 419.53, height: 595.28 },
  a6: { label: "A6", width: 297.64, height: 419.53 },
  a7: { label: "A7", width: 209.76, height: 297.64 },
  a8: { label: "A8", width: 147.4, height: 209.76 },
  a9: { label: "A9", width: 104.88, height: 147.4 },
  a10: { label: "A10", width: 73.7, height: 104.88 },
  b4: { label: "B4", width: 708.66, height: 1000.63 },
  b5: { label: "B5", width: 498.9, height: 708.66 },
  letter: { label: "US Letter", width: 612, height: 792 },
  legal: { label: "US Legal", width: 612, height: 1008 },
  tabloid: { label: "Tabloid", width: 792, height: 1224 },
  executive: { label: "Executive", width: 522, height: 756 },
  halfLetter: { label: "Half Letter", width: 396, height: 612 },
  governmentLetter: {
    label: "Government Letter",
    width: 576,
    height: 756,
  },
  governmentLegal: {
    label: "Government Legal",
    width: 612,
    height: 936,
  },
};

const UNIT_TO_PT: Record<Unit, number> = {
  pt: 1,
  in: PT_PER_INCH,
  mm: PT_PER_INCH / 25.4,
  cm: PT_PER_INCH / 2.54,
};

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_PAGES = 500;

function toPoints(value: number, unit: Unit) {
  return value * UNIT_TO_PT[unit];
}

function fromPoints(value: number, unit: Unit) {
  return value / UNIT_TO_PT[unit];
}

function parsePageRanges(value: string, totalPages: number): number[] {
  const selected = new Set<number>();

  for (const part of value.split(",")) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^(\d+)\s*-\s*(\d+)$/);

    if (match) {
      const start = Number(match[1]);
      const end = Number(match[2]);

      if (start < 1 || end < start || end > totalPages) {
        throw new Error(`Invalid page range: ${trimmed}`);
      }

      for (let page = start; page <= end; page++) {
        selected.add(page - 1);
      }
      continue;
    }

    if (!/^\d+$/.test(trimmed)) {
      throw new Error(`Invalid page selection: ${trimmed}`);
    }

    const page = Number(trimmed);
    if (page < 1 || page > totalPages) {
      throw new Error(`Page ${page} does not exist.`);
    }

    selected.add(page - 1);
  }

  if (selected.size === 0) {
    throw new Error("Select at least one page to resize.");
  }

  return [...selected].sort((a, b) => a - b);
}

function formatSize(width: number, height: number) {
  return `${width.toFixed(1)} × ${height.toFixed(1)} pt`;
}

export default function PdfResizerTool() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [pageSizes, setPageSizes] = useState<
    { width: number; height: number }[]
  >([]);
  const [pageCount, setPageCount] = useState(0);

  const [preset, setPreset] = useState("a4");
  const [unit, setUnit] = useState<Unit>("mm");
  const [customWidth, setCustomWidth] = useState("210");
  const [customHeight, setCustomHeight] = useState("297");

  const [mode, setMode] = useState<ResizeMode>("fit");
  const [orientation, setOrientation] =
    useState<Orientation>("auto");

  const [pageSelection, setPageSelection] = useState("all");
  const [margin, setMargin] = useState("0");
  const [background, setBackground] = useState("#ffffff");

  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [outputUrl, setOutputUrl] = useState("");
  const [outputName, setOutputName] = useState("");

  const selectedPreset = PAGE_SIZES[preset];

  const targetDimensions = useMemo(() => {
    let width: number;
    let height: number;

    if (preset === "custom") {
      width = toPoints(Number(customWidth), unit);
      height = toPoints(Number(customHeight), unit);
    } else {
      width = selectedPreset.width;
      height = selectedPreset.height;
    }

    if (orientation === "landscape" && width < height) {
      [width, height] = [height, width];
    } else if (orientation === "portrait" && width > height) {
      [width, height] = [height, width];
    }

    return { width, height };
  }, [
    preset,
    selectedPreset,
    customWidth,
    customHeight,
    unit,
    orientation,
  ]);

  const averageOriginalSize = useMemo(() => {
    if (!pageSizes.length) return null;

    const width =
      pageSizes.reduce((sum, page) => sum + page.width, 0) /
      pageSizes.length;
    const height =
      pageSizes.reduce((sum, page) => sum + page.height, 0) /
      pageSizes.length;

    return { width, height };
  }, [pageSizes]);

  function clearOutput() {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl("");
    setOutputName("");
    setSuccess("");
  }

  async function handleFile(fileToLoad?: File) {
    const selected = fileToLoad;

    if (!selected) return;

    setError("");
    setSuccess("");
    clearOutput();

    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      setError("File is larger than the 100 MB limit.");
      return;
    }

    setBusy(true);
    setProgress("Reading PDF information...");

    try {
      const bytes = await selected.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, {
        ignoreEncryption: false,
      });

      const pages = pdf.getPages();

      if (pages.length > MAX_PAGES) {
        throw new Error(
          `This tool currently supports up to ${MAX_PAGES} pages.`,
        );
      }

      const dimensions = pages.map((page) => {
        const size = page.getSize();
        return {
          width: size.width,
          height: size.height,
        };
      });

      setFile(selected);
      setPageCount(pages.length);
      setPageSizes(dimensions);
      setPageSelection("all");
      setProgress("");
    } catch (err) {
      setFile(null);
      setPageSizes([]);
      setPageCount(0);

      const message =
        err instanceof Error ? err.message : "Unable to read this PDF.";

      setError(
        message.toLowerCase().includes("encrypted")
          ? "This PDF appears to be encrypted or password protected. Unlock it first."
          : message,
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  async function resizePdf() {
    if (!file) return;

    setError("");
    setSuccess("");
    clearOutput();

    const { width: targetWidth, height: targetHeight } =
      targetDimensions;

    if (
      !Number.isFinite(targetWidth) ||
      !Number.isFinite(targetHeight) ||
      targetWidth < 18 ||
      targetHeight < 18 ||
      targetWidth > 14400 ||
      targetHeight > 14400
    ) {
      setError(
        "Page dimensions must be between 18 and 14,400 PDF points.",
      );
      return;
    }

    const marginValue = Number(margin);

    if (
      !Number.isFinite(marginValue) ||
      marginValue < 0 ||
      marginValue > 500
    ) {
      setError("Enter a valid margin between 0 and 500 points.");
      return;
    }

    let selectedPages: number[];

    try {
      selectedPages =
        pageSelection.trim().toLowerCase() === "all"
          ? Array.from({ length: pageCount }, (_, index) => index)
          : parsePageRanges(pageSelection, pageCount);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid page selection.",
      );
      return;
    }

    if (marginValue * 2 >= targetWidth || marginValue * 2 >= targetHeight) {
      setError("Margins are too large for the selected page size.");
      return;
    }

    setBusy(true);
    setProgress("Preparing your resized PDF...");

    try {
      const sourceBytes = await file.arrayBuffer();

      const sourcePdf = await PDFDocument.load(sourceBytes);
      const outputPdf = await PDFDocument.create();

      const pages = sourcePdf.getPages();
      const selectedSet = new Set(selectedPages);

      const hex = background.replace("#", "");
      const backgroundColor = rgb(
        parseInt(hex.slice(0, 2), 16) / 255,
        parseInt(hex.slice(2, 4), 16) / 255,
        parseInt(hex.slice(4, 6), 16) / 255,
      );

      const total = pages.length;

      for (let index = 0; index < total; index++) {
        setProgress(`Resizing page ${index + 1} of ${total}...`);

        const sourcePage = pages[index];
        const originalSize = sourcePage.getSize();

        const shouldResize = selectedSet.has(index);

        if (!shouldResize) {
          const [embedded] = await outputPdf.embedPages([sourcePage]);
          const originalPage = outputPdf.addPage([
            originalSize.width,
            originalSize.height,
          ]);

          originalPage.drawPage(embedded, {
            x: 0,
            y: 0,
            width: originalSize.width,
            height: originalSize.height,
          });

          continue;
        }

        const pageWidth = targetWidth;
        const pageHeight = targetHeight;

        const availableWidth = pageWidth - marginValue * 2;
        const availableHeight = pageHeight - marginValue * 2;

        const scaleX = availableWidth / originalSize.width;
        const scaleY = availableHeight / originalSize.height;

        let drawWidth = originalSize.width;
        let drawHeight = originalSize.height;

        if (mode === "stretch") {
          drawWidth = availableWidth;
          drawHeight = availableHeight;
        } else if (mode === "center") {
          drawWidth = originalSize.width;
          drawHeight = originalSize.height;
        } else {
          const scale =
            mode === "fill"
              ? Math.max(scaleX, scaleY)
              : Math.min(scaleX, scaleY);

          drawWidth = originalSize.width * scale;
          drawHeight = originalSize.height * scale;
        }

        const x = (pageWidth - drawWidth) / 2;
        const y = (pageHeight - drawHeight) / 2;

        const [embeddedPage] = await outputPdf.embedPages([
          sourcePage,
        ]);

        const newPage = outputPdf.addPage([
          pageWidth,
          pageHeight,
        ]);

        newPage.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: backgroundColor,
        });

        newPage.drawPage(embeddedPage, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      outputPdf.setTitle(
        `${file.name.replace(/\.pdf$/i, "")} - Resized`,
      );

      const outputBytes = await outputPdf.save();
     

     const safeBytes = new Uint8Array(outputBytes.byteLength);
     safeBytes.set(outputBytes);

      const blob = new Blob([safeBytes.buffer], {
      type: "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const name = `${file.name.replace(/\.pdf$/i, "")}-resized.pdf`;
      

      setOutputUrl(url);
      setOutputName(name);
      setSuccess(
        `Successfully resized ${selectedPages.length} page(s).`,
      );
      setProgress("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while resizing the PDF.",
      );
    } finally {
      setBusy(false);
      setProgress("");
    }
  }

  function removeFile() {
    clearOutput();
    setFile(null);
    setPageCount(0);
    setPageSizes([]);
    setError("");
    setSuccess("");

    if (inputRef.current) inputRef.current.value = "";
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  const labelClass =
    "text-sm font-semibold text-slate-800 dark:text-slate-200";

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-5";

  return (
    <div className="space-y-6">
      {/* Upload */}
      <section className={cardClass}>
        {!file ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex min-h-64 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-violet-300 bg-violet-50/60 px-5 text-center transition hover:border-violet-500 hover:bg-violet-50 disabled:opacity-60 dark:border-violet-900 dark:bg-violet-950/20 dark:hover:bg-violet-950/40"
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300">
              <FileUp size={28} />
            </span>

            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Upload your PDF
            </span>

            <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Click to browse or select a PDF from your device
            </span>

            <span className="mt-4 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white">
              Choose PDF
            </span>

            <span className="mt-3 text-xs text-slate-400">
              Maximum file size: 100 MB · Maximum pages: 500
            </span>
          </button>
        ) : (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                <FileText size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {file.name}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB ·{" "}
                  {pageCount} pages
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              <Trash2 size={16} />
              Remove PDF
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
      </section>

      {/* Document information */}
      {file && (
        <section className={cardClass}>
          <div className="mb-4 flex items-center gap-2">
            <Ruler className="text-violet-600" size={19} />
            <h2 className="font-bold text-slate-900 dark:text-white">
              Document information
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Total pages</p>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {pageCount}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Average page size</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {averageOriginalSize
                  ? formatSize(
                      averageOriginalSize.width,
                      averageOriginalSize.height,
                    )
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              <p className="text-xs text-slate-500">Page dimensions</p>
              <p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                {new Set(
                  pageSizes.map(
                    (page) =>
                      `${Math.round(page.width)}x${Math.round(page.height)}`,
                  ),
                ).size > 1
                  ? "Mixed sizes"
                  : "Uniform sizes"}
              </p>
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-semibold text-violet-700 dark:text-violet-400">
              View individual page dimensions
            </summary>
            <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
              {pageSizes.map((size, index) => (
                <div
                  key={index}
                  className="flex justify-between gap-3 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span>Page {index + 1}</span>
                  <span className="font-medium">
                    {formatSize(size.width, size.height)}
                  </span>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Resize settings */}
      <section className={cardClass}>
        <div className="mb-5 flex items-center gap-2">
          <Settings2 className="text-violet-600" size={19} />
          <h2 className="font-bold text-slate-900 dark:text-white">
            Resize settings
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Target page size</span>
            <select
              className={inputClass}
              value={preset}
              onChange={(event) => setPreset(event.target.value)}
            >
              <optgroup label="ISO A series">
                {Object.entries(PAGE_SIZES)
                  .filter(([key]) => key.startsWith("a"))
                  .map(([key, size]) => (
                    <option key={key} value={key}>
                      {size.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="Other standard sizes">
                {Object.entries(PAGE_SIZES)
                  .filter(
                    ([key]) =>
                      !key.startsWith("a") &&
                      !key.startsWith("b"),
                  )
                  .map(([key, size]) => (
                    <option key={key} value={key}>
                      {size.label}
                    </option>
                  ))}
              </optgroup>

              <optgroup label="ISO B series">
                {Object.entries(PAGE_SIZES)
                  .filter(([key]) => key.startsWith("b"))
                  .map(([key, size]) => (
                    <option key={key} value={key}>
                      {size.label}
                    </option>
                  ))}
              </optgroup>

              <option value="custom">Custom dimensions</option>
            </select>
          </label>

          <label>
            <span className={labelClass}>Orientation</span>
            <select
              className={inputClass}
              value={orientation}
              onChange={(event) =>
                setOrientation(event.target.value as Orientation)
              }
            >
              <option value="auto">Keep preset orientation</option>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </label>
        </div>

        {preset === "custom" && (
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <label>
              <span className={labelClass}>Width</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                step="any"
                value={customWidth}
                onChange={(event) => setCustomWidth(event.target.value)}
              />
            </label>

            <label>
              <span className={labelClass}>Height</span>
              <input
                className={inputClass}
                type="number"
                min="1"
                step="any"
                value={customHeight}
                onChange={(event) => setCustomHeight(event.target.value)}
              />
            </label>

            <label>
              <span className={labelClass}>Unit</span>
              <select
                className={inputClass}
                value={unit}
                onChange={(event) =>
                  setUnit(event.target.value as Unit)
                }
              >
                <option value="mm">Millimetres (mm)</option>
                <option value="cm">Centimetres (cm)</option>
                <option value="in">Inches (in)</option>
                <option value="pt">Points (pt)</option>
              </select>
            </label>
          </div>
        )}

        <div className="mt-4 rounded-xl bg-violet-50 p-3 text-sm text-violet-900 dark:bg-violet-950/30 dark:text-violet-200">
          Output dimensions:{" "}
          <strong>
            {formatSize(targetDimensions.width, targetDimensions.height)}
          </strong>
          {preset === "custom" && (
            <span className="ml-1 text-xs opacity-75">
              ({customWidth} × {customHeight} {unit})
            </span>
          )}
        </div>

        <div className="mt-6">
          <p className={labelClass}>Content resize mode</p>

          <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {(
              [
                ["fit", "Fit", "Show all content"],
                ["fill", "Fill", "Fill page, crop overflow"],
                ["stretch", "Stretch", "Fill exact dimensions"],
                ["center", "Center", "Keep original size"],
              ] as [ResizeMode, string, string][]
            ).map(([value, title, description]) => (
              <button
                type="button"
                key={value}
                onClick={() => setMode(value)}
                className={`rounded-xl border p-3 text-left transition ${
                  mode === value
                    ? "border-violet-500 bg-violet-50 ring-2 ring-violet-500/15 dark:bg-violet-950/30"
                    : "border-slate-200 hover:border-violet-300 dark:border-slate-700"
                }`}
              >
                <span className="block text-sm font-bold text-slate-900 dark:text-white">
                  {title}
                </span>
                <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label>
            <span className={labelClass}>Margin (PDF points)</span>
            <input
              className={inputClass}
              type="number"
              min="0"
              max="500"
              step="1"
              value={margin}
              onChange={(event) => setMargin(event.target.value)}
            />
            <span className="mt-1 block text-xs text-slate-500">
              Equal margin on all four sides. 72 points = 1 inch.
            </span>
          </label>

          <label>
            <span className={labelClass}>Page background</span>
            <div className="mt-2 flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 dark:border-slate-700">
              <input
                type="color"
                value={background}
                onChange={(event) => setBackground(event.target.value)}
                className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {background.toUpperCase()}
              </span>
            </div>
          </label>
        </div>

        <div className="mt-6">
          <label>
            <span className={labelClass}>Pages to resize</span>
            <input
              className={inputClass}
              value={pageSelection}
              onChange={(event) => setPageSelection(event.target.value)}
              placeholder="all or 1-5, 8, 10-12"
            />
            <span className="mt-1 block text-xs text-slate-500">
              Enter all, individual pages, or ranges. Example: 1-5, 8, 10-12.
              Unselected pages keep their original dimensions.
            </span>
          </label>
        </div>
      </section>

      {/* Status */}
      {(error || success || progress) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              : success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? (
              <AlertCircle size={18} />
            ) : success ? (
              <CheckCircle2 size={18} />
            ) : (
              <LoaderCircle className="animate-spin" size={18} />
            )}
            <span>{error || success || progress}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <section className={cardClass}>
        <button
          type="button"
          onClick={resizePdf}
          disabled={!file || busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-600/15 transition hover:bg-violet-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? (
            <>
              <LoaderCircle className="animate-spin" size={18} />
              Processing PDF...
            </>
          ) : (
            <>
              <RefreshCw size={18} />
              Resize PDF
            </>
          )}
        </button>

        {outputUrl && (
          <a
            href={outputUrl}
            download={outputName}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <Download size={18} />
            Download resized PDF
          </a>
        )}

        <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Files are processed locally in your browser. Your PDF is not
          uploaded to a server.
        </p>
      </section>

      {/* Important limitations */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-200">
        <strong>PDF compatibility note:</strong> This tool rebuilds pages
        using embedded page content. It preserves the visual vector
        content in typical PDFs, but interactive form fields, annotations,
        links, bookmarks, document-level metadata, and digital signatures
        may not be retained. The Center mode keeps original content size;
        Fill may crop content beyond the page edges.
      </div>
    </div>
  );
}
