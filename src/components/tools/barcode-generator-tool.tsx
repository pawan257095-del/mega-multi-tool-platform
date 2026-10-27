"use client";

import { useMemo, useState } from "react";

function checksumEan(digits: string) {
  const sum = digits.split("").reverse().reduce((total, char, index) => total + Number(char) * (index % 2 === 0 ? 3 : 1), 0);
  return String((10 - (sum % 10)) % 10);
}

function encodeEan13(value: string): string | null {
  let digits = value;
  if (!/^\d{12,13}$/.test(digits)) return null;
  if (digits.length === 12) digits += checksumEan(digits);
  else if (checksumEan(digits.slice(0, 12)) !== digits[12]) return null;
  const L = ["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];
  const G = ["0100111","0110011","0011011","0100001","0011101","0111001","0000101","0010001","0001001","0010111"];
  const R = ["1110010","1100110","1101100","1000010","1011100","1001110","1010000","1000100","1001000","1110100"];
  const parity = ["LLLLLL","LLGLGG","LLGGLG","LLGGGL","LGLLGG","LGGLLG","LGGGLL","LGLGLG","LGLGGL","LGGLGL"];
  let bits = "101";
  for (let i = 1; i <= 6; i++) {
    const digit = Number(digits[i]);
    bits += parity[Number(digits[0])][i - 1] === "L" ? L[digit] : G[digit];
  }
  bits += "01010";
  for (let i = 7; i < 13; i++) bits += R[Number(digits[i])];
  bits += "101";
  return bits;
}

function encodeCode128B(value: string): string | null {
  if (!value || [...value].some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126)) return null;
  const patterns = [
    "11011001100","11001101100","11001100110","10010011000","10010001100","10001001100","10011001000","10011000100","10001100100","11001001000",
    "11001000100","11000100100","10110011100","10011011100","10011001110","10111001000","10011101000","10011100010","11001110010","11001011100",
    "11001001110","11011100100","11011100010","11110111010","11011011100","11011001110","11001101110","11101111010","11101011110","11101001110",
    "11100101110","11011101000","11011100010","11110101000","11110100010","10111011110","10111001110","10001011110","10111101000","10111100010",
    "11110101010","11110101110","11010000100","11010010000","11010011100","1100011101011"
  ];
  const values = [...value].map((char) => char.charCodeAt(0) - 32);
  let checksum = 104;
  values.forEach((v, i) => { checksum += v * (i + 1); });
  const check = checksum % 103;
  const codePatterns = [
    "212222","222122","222221","121223","121322","131222","122213","122312","132212","221213",
    "221312","231212","112232","122132","122231","113222","123122","123221","223211","221132",
    "221231","213212","223112","312131","311222","321122","321221","312212","322112","322211",
    "212123","212321","232121","111323","131123","131321","112313","132113","132311","211313",
    "231113","231311","112133","112331","132131","113123","113321","133121","313121","211331",
    "231131","213113","213311","213131","311123","311321","331121","312113","312311","332111",
    "314111","221411","431111","111224","111422","121124","121421","141122","141221","112214",
    "112412","122114","122411","142112","142211","241211","221114","413111","241112","134111",
    "111242","121142","121241","114212","124112","124211","411212","421112","421211","212141",
    "214121","412121","111143","111341","131141","114113","114311","411113","411311","113141",
    "114131","311141","411131","211412","211214","211232","2331112"
  ];
  const toBits = (pattern: string) => {
    let bits = "", black = true;
    for (const digit of pattern) {
      bits += (black ? "1" : "0").repeat(Number(digit));
      black = !black;
    }
    return bits;
  };
  const start = toBits(codePatterns[104]);
  const body = values.map((v) => toBits(codePatterns[v])).join("");
  const checkBits = toBits(codePatterns[check]);
  const stop = toBits("2331112");
  return start + body + checkBits + stop;
}

export default function BarcodeGeneratorTool() {
  const [value, setValue] = useState("123456789012");
  const [format, setFormat] = useState<"CODE128" | "EAN13">("CODE128");
  const [showText, setShowText] = useState(true);
  const result = useMemo(() => {
    const input = value.trim();
    if (!input) return { bits: null, normalized: "", error: "Enter a value to generate a barcode." };
    if (format === "EAN13") {
      const bits = encodeEan13(input);
      return bits ? { bits, normalized: input.length === 12 ? input + checksumEan(input) : input, error: "" } : { bits: null, normalized: "", error: "EAN-13 needs 12 digits (checksum is calculated) or a valid 13-digit code." };
    }
    const bits = encodeCode128B(input);
    return bits ? { bits, normalized: input, error: "" } : { bits: null, normalized: "", error: "Code 128 supports printable ASCII characters (spaces included)." };
  }, [value, format]);

  const svg = useMemo(() => {
    if (!result.bits) return "";
    const bits = result.bits;
    const quiet = 10, height = 90, barWidth = 2;
    const rects = bits.split("").map((bit, i) => bit === "1" ? `<rect x="${(i + quiet) * barWidth}" y="0" width="${barWidth}" height="${height}"/>` : "").join("");
    const width = (bits.length + quiet * 2) * barWidth;
    const text = showText ? `<text x="${width / 2}" y="${height + 20}" text-anchor="middle" font-family="Arial,sans-serif" font-size="14">${result.normalized.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + (showText ? 26 : 6)}" viewBox="0 0 ${width} ${height + (showText ? 26 : 6)}"><rect width="100%" height="100%" fill="#fff"/><g fill="#000">${rects}</g>${text}</svg>`;
  }, [result, showText]);

  function downloadSvg() {
    if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "barcode.svg";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium md:col-span-2">Barcode value
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={value} onChange={(e) => setValue(e.target.value)} maxLength={100} placeholder="Enter product code or text" />
        </label>
        <label className="block text-sm font-medium">Barcode format
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={format} onChange={(e) => setFormat(e.target.value as "CODE128" | "EAN13")}>
            <option value="CODE128">Code 128 (general text)</option>
            <option value="EAN13">EAN-13 (retail)</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={showText} onChange={(e) => setShowText(e.target.checked)} /> Show value below barcode</label>
      </section>
      {result.error && <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">{result.error}</p>}
      {svg && <section className="rounded-2xl border border-border bg-card p-5"><h3 className="text-lg font-semibold">Preview</h3><div className="mt-4 overflow-x-auto rounded-xl bg-white p-4 text-center" dangerouslySetInnerHTML={{ __html: svg }} /><button type="button" onClick={downloadSvg} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Download SVG</button></section>}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">A generated barcode is not automatically a registered or globally unique product identifier. For retail distribution, obtain the appropriate GTIN from the relevant standards organization and test that the printed barcode scans correctly.</aside>
    </div>
  );
}
