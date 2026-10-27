
"use client";

import {
  Check,
  Copy,
  Download,
  Image as ImageIcon,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PIXELS = 40_000_000;

type EncodedImage = {
  file: File;
  dataUrl: string;
  base64: string;
  previewUrl: string;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageToBase64Tool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [encoded, setEncoded] = useState<EncodedImage | null>(null);
  const [showDataUrl, setShowDataUrl] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const output = encoded
    ? showDataUrl
      ? encoded.dataUrl
      : encoded.base64
    : "";

  useEffect(() => {
    const previewUrl = encoded?.previewUrl;

    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [encoded?.previewUrl]);

  async function handleFile(next?: File) {
    setError("");
    setCopied(false);

    if (!next) return;

    if (!next.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }

    if (next.size > MAX_FILE_SIZE) {
      setError(
        "Choose an image smaller than 10 MB to keep the encoded output manageable.",
      );
      return;
    }

    setBusy(true);

    let previewUrl = "";

    try {
      previewUrl = URL.createObjectURL(next);

      const dimensions = await new Promise<{
        width: number;
        height: number;
      }>((resolve, reject) => {
        const image = new Image();

        image.onload = () =>
          resolve({
            width: image.naturalWidth,
            height: image.naturalHeight,
          });

        image.onerror = () =>
          reject(new Error("The image could not be opened."));

        image.src = previewUrl;
      });

      if (dimensions.width * dimensions.height > MAX_PIXELS) {
        throw new Error("This image exceeds the 40-megapixel safety limit.");
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () =>
          typeof reader.result === "string"
            ? resolve(reader.result)
            : reject(new Error("Could not encode this image."));

        reader.onerror = () =>
          reject(new Error("Could not read this image file."));

        reader.readAsDataURL(next);
      });

      const comma = dataUrl.indexOf(",");

      if (comma < 0) {
        throw new Error("The browser returned an invalid data URL.");
      }

      setEncoded({
        file: next,
        dataUrl,
        base64: dataUrl.slice(comma + 1),
        previewUrl,
      });

      // Ownership of the preview URL passes to the encoded state.
      previewUrl = "";
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Image conversion failed.",
      );
    } finally {
      // Revoke URLs created by unsuccessful conversions.
      if (previewUrl) URL.revokeObjectURL(previewUrl);

      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function copyOutput() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(
        "Clipboard access was blocked. Select the output text and copy it manually.",
      );
    }
  }

  function downloadOutput() {
    if (!output || !encoded) return;

    const blob = new Blob([output], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${encoded.file.name.replace(/\.[^.]+$/, "") || "image"}-base64.txt`;
    link.click();

    URL.revokeObjectURL(url);
  }

  function reset() {
    setEncoded(null);
    setError("");
    setCopied(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Choose an image
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Convert an image into a Base64 string or a complete data URL.
            </p>
          </div>

          {encoded && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RotateCcw size={15} /> Reset
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(event) => void handleFile(event.target.files?.[0])}
          className="mt-5 block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-violet-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        />

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Images only · maximum 10 MB and 40 megapixels · processing stays in
          this browser.
        </p>

        {busy && (
          <p className="mt-4 text-sm font-medium text-violet-600 dark:text-violet-400">
            Encoding image…
          </p>
        )}

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}
      </section>

      {encoded && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <ImageIcon size={18} className="text-violet-600" />
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Image preview
              </h2>
            </div>

            <div className="mt-4 flex min-h-52 items-center justify-center overflow-hidden rounded-xl bg-slate-100 p-3 dark:bg-slate-950">
              <img
                src={encoded.previewUrl}
                alt="Selected image preview"
                className="max-h-80 max-w-full object-contain"
              />
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">File</dt>
                <dd className="max-w-[65%] truncate font-medium text-slate-800 dark:text-slate-200">
                  {encoded.file.name}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">
                  Original size
                </dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {formatBytes(encoded.file.size)}
                </dd>
              </div>

              <div className="flex justify-between gap-3">
                <dt className="text-slate-500 dark:text-slate-400">
                  Encoded length
                </dt>
                <dd className="font-medium text-slate-800 dark:text-slate-200">
                  {output.length.toLocaleString()} characters
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Encoded output
              </h2>

              <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-950">
                <button
                  type="button"
                  onClick={() => setShowDataUrl(true)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    showDataUrl
                      ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                      : "text-slate-500"
                  }`}
                >
                  Data URL
                </button>

                <button
                  type="button"
                  onClick={() => setShowDataUrl(false)}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                    !showDataUrl
                      ? "bg-white text-violet-700 shadow-sm dark:bg-slate-800 dark:text-violet-300"
                      : "text-slate-500"
                  }`}
                >
                  Base64 only
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={output}
              rows={12}
              spellCheck={false}
              aria-label="Base64 output"
              className="mt-4 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            />

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Base64 is an encoding, not encryption. Avoid pasting sensitive
              images into services you don&apos;t trust.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void copyOutput()}
                className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy output"}
              </button>

              <button
                type="button"
                onClick={downloadOutput}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Download size={16} /> Download .txt
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
