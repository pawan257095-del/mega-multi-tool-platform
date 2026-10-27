"use client";

import { useMemo, useState } from "react";
import { Download, Plus, Trash2, FileText, RotateCcw, Building2, UserRound, CreditCard, Calculator, ShieldCheck } from "lucide-react";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type LineItem = {
  id: number;
  description: string;
  hsnSac: string;
  quantity: string;
  unit: string;
  rate: string;
  discountPercent: string;
  taxRate: string;
};

type TaxMode = "none" | "intra" | "inter";

const currencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED", "SAR", "JPY"];
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const initialItems: LineItem[] = [{
  id: 1,
  description: "Professional services",
  hsnSac: "",
  quantity: "1",
  unit: "service",
  rate: "15000",
  discountPercent: "0",
  taxRate: "18",
}];

const money = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `${currency} ${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
  }
};
const numberValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};
const safeAmount = (value: string) => Math.max(0, numberValue(value));
const dateToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const makeItem = (id: number): LineItem => ({ id, description: "", hsnSac: "", quantity: "1", unit: "unit", rate: "0", discountPercent: "0", taxRate: "18" });

export default function InvoicePdfGeneratorTool() {
  const [invoiceNo, setInvoiceNo] = useState("INV-2026-001");
  const [issueDate, setIssueDate] = useState(dateToday());
  const [dueDate, setDueDate] = useState("");
  const [poNumber, setPoNumber] = useState("");
  const [seller, setSeller] = useState("Your Business Name");
  const [sellerLegalName, setSellerLegalName] = useState("");
  const [sellerAddress, setSellerAddress] = useState("");
  const [sellerGstin, setSellerGstin] = useState("");
  const [sellerPan, setSellerPan] = useState("");
  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [sellerWebsite, setSellerWebsite] = useState("");
  const [buyer, setBuyer] = useState("");
  const [buyerAddress, setBuyerAddress] = useState("");
  const [buyerGstin, setBuyerGstin] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [taxMode, setTaxMode] = useState<TaxMode>("intra");
  const [discount, setDiscount] = useState("0");
  const [shipping, setShipping] = useState("0");
  const [roundOff, setRoundOff] = useState(false);
  const [amountPaid, setAmountPaid] = useState("0");
  const [paymentTerms, setPaymentTerms] = useState("Payment due within 15 days of invoice date.");
  const [paymentMethod, setPaymentMethod] = useState("Bank transfer");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscSwift, setIfscSwift] = useState("");
  const [upiId, setUpiId] = useState("");
  const [notes, setNotes] = useState("Thank you for your business.");
  const [terms, setTerms] = useState("Please mention the invoice number with your payment. Any disputes are subject to the agreed terms between the parties.");
  const [signatureName, setSignatureName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [items, setItems] = useState<LineItem[]>(initialItems);

  const calculations = useMemo(() => {
    const rows = initialItems.map(() => null);
    void rows;
    const lineDetails = items.map((item) => {
      const quantity = safeAmount(item.quantity);
      const rate = safeAmount(item.rate);
      const gross = quantity * rate;
      const discountPercent = Math.min(100, safeAmount(item.discountPercent));
      const lineDiscount = gross * discountPercent / 100;
      const taxable = Math.max(0, gross - lineDiscount);
      const taxRate = Math.min(100, safeAmount(item.taxRate));
      const tax = taxMode === "none" ? 0 : taxable * taxRate / 100;
      return { id: item.id, quantity, rate, gross, lineDiscount, taxable, taxRate, tax };
    });
    const subtotal = lineDetails.reduce((sum, line) => sum + line.gross, 0);
    const itemDiscount = lineDetails.reduce((sum, line) => sum + line.lineDiscount, 0);
    const invoiceDiscount = Math.min(Math.max(0, subtotal - itemDiscount), safeAmount(discount));
    const taxableTotal = Math.max(0, subtotal - itemDiscount - invoiceDiscount);
    const rawTax = lineDetails.reduce((sum, line) => sum + line.tax, 0);
    const taxAfterInvoiceDiscount = taxableTotal > 0 && subtotal - itemDiscount > 0
      ? rawTax * (taxableTotal / (subtotal - itemDiscount))
      : 0;
    const cgst = taxMode === "intra" ? taxAfterInvoiceDiscount / 2 : 0;
    const sgst = taxMode === "intra" ? taxAfterInvoiceDiscount / 2 : 0;
    const igst = taxMode === "inter" ? taxAfterInvoiceDiscount : 0;
    const shippingAmount = safeAmount(shipping);
    const beforeRound = taxableTotal + cgst + sgst + igst + shippingAmount;
    const roundedTotal = roundOff ? Math.round(beforeRound) : Math.round((beforeRound + Number.EPSILON) * 100) / 100;
    const roundOffAmount = roundedTotal - beforeRound;
    const paid = safeAmount(amountPaid);
    const balance = Math.max(0, roundedTotal - paid);
    return { lineDetails, subtotal, itemDiscount, invoiceDiscount, taxableTotal, cgst, sgst, igst, taxTotal: cgst + sgst + igst, shippingAmount, beforeRound, total: roundedTotal, roundOffAmount, paid, balance };
  }, [items, taxMode, discount, shipping, roundOff, amountPaid]);


  function updateItem(id: number, key: keyof Omit<LineItem, "id">, value: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item));
  }
  function addItem() {
    setItems((current) => [...current, makeItem(Math.max(0, ...current.map((item) => item.id)) + 1)]);
    setStatus("Line item added.");
  }
  function removeItem(id: number) {
    if (items.length <= 1) return;
    setItems((current) => current.filter((item) => item.id !== id));
    setStatus("Line item removed.");
  }
  function reset() {
    setInvoiceNo("INV-2026-001"); setIssueDate(dateToday()); setDueDate(""); setPoNumber("");
    setSeller("Your Business Name"); setSellerLegalName(""); setSellerAddress(""); setSellerGstin(""); setSellerPan("");
    setSellerEmail(""); setSellerPhone(""); setSellerWebsite(""); setBuyer(""); setBuyerAddress(""); setBuyerGstin("");
    setBuyerEmail(""); setBuyerPhone(""); setShippingAddress(""); setPlaceOfSupply(""); setCurrency("INR"); setTaxMode("intra");
    setDiscount("0"); setShipping("0"); setRoundOff(false); setAmountPaid("0"); setPaymentTerms("Payment due within 15 days of invoice date.");
    setPaymentMethod("Bank transfer"); setBankName(""); setAccountName(""); setAccountNumber(""); setIfscSwift(""); setUpiId("");
    setNotes("Thank you for your business."); setTerms("Please mention the invoice number with your payment. Any disputes are subject to the agreed terms between the parties.");
    setSignatureName(""); setItems(initialItems); setStatus("Invoice form reset.");
  }

  async function downloadPdf() {
    setStatus("");
    const missing: string[] = [];
    if (!invoiceNo.trim()) missing.push("invoice number");
    if (!issueDate) missing.push("issue date");
    if (!seller.trim()) missing.push("seller/business name");
    if (!buyer.trim()) missing.push("customer name");
    if (!items.some((item) => item.description.trim())) missing.push("at least one described line item");
    if (missing.length) {
      setStatus(`Please complete: ${missing.join(", ")}.`);
      return;
    }
    setBusy(true);
    try {
      const pdf = await PDFDocument.create();
      pdf.setTitle(`Invoice ${invoiceNo}`);
      pdf.setSubject(`Invoice from ${seller} to ${buyer}`);
      pdf.setAuthor(seller);
      pdf.setCreator("Mega Multi-Tool Platform — Invoice PDF Generator");
      pdf.setCreationDate(new Date());
      const regular = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pageSize: [number, number] = [595.28, 841.89];
      const margin = 42;
      const pageWidth = pageSize[0];
      const ink = rgb(0.12, 0.16, 0.24);
      const muted = rgb(0.39, 0.44, 0.52);
      const accent = rgb(0.28, 0.22, 0.86);
      const pale = rgb(0.95, 0.95, 1);
      const lineColor = rgb(0.88, 0.89, 0.93);
      const white = rgb(1, 1, 1);
      let page = undefined as unknown as PDFPage;
      let y = 0;

      const safePdfText = (value: unknown) => String(value ?? "")
        .replace(/₹/g, "INR ").replace(/€/g, "EUR ").replace(/£/g, "GBP ").replace(/¥/g, "JPY ")
        .replace(/[—–]/g, "-").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/…/g, "...")
        .replace(/\r\n?/g, "\n")
        .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\x20-\x7E\xA0-\xFF\n]/g, " ")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n");

      const drawText = (target: PDFPage, value: unknown, x: number, topY: number, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; maxWidth?: number; align?: "left" | "right" } = {}) => {
        const text = safePdfText(value);
        const size = options.size ?? 9;
        const font = options.font ?? regular;
        const maxWidth = options.maxWidth ?? 500;
        const width = font.widthOfTextAtSize(text, size);
        const drawX = options.align === "right" ? x + maxWidth - Math.min(width, maxWidth) : x;
        target.drawText(text.length ? text : " ", { x: drawX, y: topY - size, size, font, color: options.color ?? ink, maxWidth });
      };
      const wrapLines = (value: unknown, font: PDFFont, size: number, maxWidth: number) => {
        const text = safePdfText(value).trim();
        if (!text) return [""];
        const result: string[] = [];
        for (const paragraph of text.split(/\r?\n/)) {
          let line = "";
          for (const word of paragraph.split(/\s+/)) {
            const candidate = line ? `${line} ${word}` : word;
            if (line && font.widthOfTextAtSize(candidate, size) > maxWidth) {
              result.push(line);
              line = word;
            } else line = candidate;
          }
          result.push(line);
        }
        return result;
      };
      const drawWrapped = (target: PDFPage, value: unknown, x: number, topY: number, maxWidth: number, size = 8, font = regular, color = ink, lineHeight = 11) => {
        const lines = wrapLines(value, font, size, maxWidth);
        let currentY = topY;
        for (const line of lines) {
          drawText(target, line, x, currentY, { size, font, color, maxWidth });
          currentY -= lineHeight;
        }
        return currentY;
      };
      const newPage = () => {
        page = pdf.addPage(pageSize);
        y = 0;
        return page;
      };
      const drawPageFooter = (target: PDFPage, pageNumber: number) => {
        target.drawLine({ start: { x: margin, y: 35 }, end: { x: pageWidth - margin, y: 35 }, thickness: 0.6, color: lineColor });
        drawText(target, `${invoiceNo} · ${seller}`, margin, 26, { size: 7, color: muted });
        drawText(target, `Page ${pageNumber}`, pageWidth - margin - 70, 26, { size: 7, color: muted, maxWidth: 70, align: "right" });
      };
      newPage();

      // Premium brand header with stronger hierarchy and clear document metadata.
      page.drawRectangle({ x: 0, y: 735, width: pageWidth, height: 107, color: accent });
      page.drawRectangle({ x: 0, y: 735, width: 7, height: 107, color: rgb(0.42, 0.78, 0.98) });
      page.drawCircle({ x: margin + 12, y: 806, size: 12, color: rgb(1, 1, 1), opacity: 0.16 });
      drawText(page, (seller.trim().slice(0, 1) || "B").toUpperCase(), margin + 7, 812, { size: 12, font: bold, color: white, maxWidth: 12 });
      drawText(page, seller, margin + 31, 817, { size: 9, font: bold, color: rgb(0.91, 0.92, 1), maxWidth: 205 });
      drawText(page, "INVOICE", margin, 784, { size: 25, font: bold, color: white });
      drawText(page, "BILLING STATEMENT", margin + 2, 761, { size: 7.5, font: bold, color: rgb(0.82, 0.85, 1) });
      page.drawRectangle({ x: pageWidth - margin - 150, y: 796, width: 150, height: 23, color: rgb(1, 1, 1), opacity: 0.13, borderColor: rgb(1, 1, 1), borderWidth: 0.5, borderOpacity: 0.3 });
      drawText(page, invoiceNo, pageWidth - margin - 142, 811, { size: 11, font: bold, color: white, maxWidth: 134, align: "right" });
      drawText(page, `ISSUED  ${issueDate}`, pageWidth - margin - 150, 781, { size: 7.5, font: bold, color: white, maxWidth: 150, align: "right" });
      drawText(page, `DUE  ${dueDate || "On receipt"}`, pageWidth - margin - 150, 766, { size: 7.5, font: bold, color: white, maxWidth: 150, align: "right" });
      y = 716;

      const halfWidth = 225;
      const partyTop = y + 7;
      page.drawRectangle({ x: margin, y: partyTop - 112, width: 244, height: 119, color: rgb(0.975, 0.978, 0.995), borderColor: lineColor, borderWidth: 0.6 });
      page.drawRectangle({ x: margin + 258, y: partyTop - 112, width: 253, height: 119, color: rgb(0.975, 0.978, 0.995), borderColor: lineColor, borderWidth: 0.6 });
      page.drawRectangle({ x: margin, y: partyTop - 3, width: 244, height: 3, color: accent });
      page.drawRectangle({ x: margin + 258, y: partyTop - 3, width: 253, height: 3, color: rgb(0.20, 0.63, 0.73) });
      drawText(page, "FROM  /  SUPPLIER", margin + 10, y, { size: 7.5, font: bold, color: accent });
      drawText(page, "BILL TO  /  CUSTOMER", margin + 268, y, { size: 7.5, font: bold, color: rgb(0.14, 0.49, 0.58) });
      y -= 18;
      const sellerName = sellerLegalName.trim() || seller;
      let sellerY = drawWrapped(page, sellerName, margin + 10, y, halfWidth, 10, bold, ink, 12);
      if (sellerLegalName.trim() && sellerLegalName.trim() !== seller.trim()) sellerY = drawWrapped(page, `Trading as: ${seller}`, margin + 10, sellerY - 1, halfWidth, 7.5, regular, muted, 10);
      sellerY = drawWrapped(page, sellerAddress, margin + 10, sellerY - 2, halfWidth, 7.5, regular, muted, 10);
      const sellerDetails = [
        sellerEmail && `Email: ${sellerEmail}`,
        sellerPhone && `Phone: ${sellerPhone}`,
        sellerWebsite && `Web: ${sellerWebsite}`,
        sellerGstin && `GSTIN: ${sellerGstin}`,
        sellerPan && `PAN: ${sellerPan}`,
      ].filter(Boolean).join("\n");
      sellerY = drawWrapped(page, sellerDetails, margin + 10, sellerY - 2, halfWidth, 7, regular, muted, 9);
      let buyerY = drawWrapped(page, buyer, margin + 268, y, halfWidth, 10, bold, ink, 12);
      buyerY = drawWrapped(page, buyerAddress, margin + 268, buyerY - 2, halfWidth, 7.5, regular, muted, 10);
      const buyerDetails = [
        buyerEmail && `Email: ${buyerEmail}`,
        buyerPhone && `Phone: ${buyerPhone}`,
        buyerGstin && `GSTIN: ${buyerGstin}`,
        shippingAddress && `Ship to: ${shippingAddress}`,
      ].filter(Boolean).join("\n");
      buyerY = drawWrapped(page, buyerDetails, margin + 268, buyerY - 2, halfWidth, 7, regular, muted, 9);
      y = Math.min(sellerY, buyerY, partyTop - 112) - 17;

      // Invoice metadata strip
      const meta = [
        ["PLACE OF SUPPLY", placeOfSupply || "—"],
        ["PURCHASE ORDER", poNumber || "—"],
        ["TAX TREATMENT", taxMode === "intra" ? "CGST + SGST" : taxMode === "inter" ? "IGST" : "No tax"],
      ];
      const metaW = (pageWidth - margin * 2) / 3;
      page.drawRectangle({ x: margin, y: y - 45, width: pageWidth - margin * 2, height: 45, color: rgb(0.95, 0.96, 1), borderColor: lineColor, borderWidth: 0.5 });
      meta.forEach(([label, value], index) => {
        const x = margin + index * metaW + 9;
        drawText(page, label, x, y - 8, { size: 6.5, font: bold, color: muted, maxWidth: metaW - 18 });
        drawText(page, value, x, y - 24, { size: 8, font: bold, maxWidth: metaW - 18 });
      });
      y -= 64;

      const tableHeader = () => {
        page.drawRectangle({ x: margin, y: y - 20, width: pageWidth - margin * 2, height: 25, color: ink });
        drawText(page, "DESCRIPTION / HSN-SAC", margin + 8, y - 5, { size: 7, font: bold, color: white, maxWidth: 200 });
        drawText(page, "QTY", 300, y - 5, { size: 7, font: bold, color: white, maxWidth: 35 });
        drawText(page, "RATE", 344, y - 5, { size: 7, font: bold, color: white, maxWidth: 65, align: "right" });
        drawText(page, "TAX", 415, y - 5, { size: 7, font: bold, color: white, maxWidth: 40, align: "right" });
        drawText(page, "AMOUNT", 462, y - 5, { size: 7, font: bold, color: white, maxWidth: 85, align: "right" });
        y -= 31;
      };
      tableHeader();

      items.forEach((item, index) => {
        const calc = calculations.lineDetails[index];
        const descLines = wrapLines(item.description || "Item", regular, 8.2, 190);
        const detailLines = item.hsnSac.trim() ? [`HSN/SAC: ${item.hsnSac.trim()}`] : [];
        const rowHeight = Math.max(28, (descLines.length + detailLines.length) * 10 + 8);
        if (y - rowHeight < 105) {
          drawPageFooter(page, pdf.getPageCount());
          newPage();
          drawText(page, `INVOICE ${invoiceNo} (CONTINUED)`, margin, 808, { size: 12, font: bold, color: accent });
          y = 778;
          tableHeader();
        }
        if (index % 2 === 1) page.drawRectangle({ x: margin, y: y - rowHeight + 5, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.98, 0.98, 0.995) });
        let descY = y - 1;
        for (const line of descLines) {
          drawText(page, line, margin + 8, descY, { size: 8.2, maxWidth: 190 });
          descY -= 10;
        }
        for (const line of detailLines) {
          drawText(page, line, margin + 8, descY, { size: 7, color: muted, maxWidth: 190 });
          descY -= 9;
        }
        drawText(page, `${calc.quantity} ${item.unit || ""}`.trim(), 300, y - 1, { size: 8, maxWidth: 35 });
        drawText(page, money(calc.rate, currency), 344, y - 1, { size: 7.5, maxWidth: 65, align: "right" });
        drawText(page, taxMode === "none" ? "—" : `${calc.taxRate}%`, 415, y - 1, { size: 7.5, maxWidth: 40, align: "right" });
        const amount = calc.taxable + calc.tax;
        drawText(page, money(amount, currency), 462, y - 1, { size: 7.5, maxWidth: 85, align: "right" });
        page.drawLine({ start: { x: margin, y: y - rowHeight + 3 }, end: { x: pageWidth - margin, y: y - rowHeight + 3 }, thickness: 0.45, color: lineColor });
        y -= rowHeight;
      });

      if (y < 250) {
        drawPageFooter(page, pdf.getPageCount());
        newPage();
        drawText(page, `INVOICE ${invoiceNo} — SUMMARY`, margin, 808, { size: 12, font: bold, color: accent });
        y = 770;
      }
      y -= 12;
      const totalX = 330;
      const totalW = 213;
      const totalLine = (label: string, value: string, strong = false, color = ink) => {
        drawText(page, label, totalX, y, { size: strong ? 9.5 : 8.5, font: strong ? bold : regular, color, maxWidth: 125 });
        drawText(page, value, totalX + 125, y, { size: strong ? 9.5 : 8.5, font: strong ? bold : regular, color, maxWidth: totalW - 125, align: "right" });
        y -= strong ? 20 : 16;
      };
      totalLine("Subtotal", money(calculations.subtotal, currency));
      if (calculations.itemDiscount > 0) totalLine("Item discounts", `-${money(calculations.itemDiscount, currency)}`);
      if (calculations.invoiceDiscount > 0) totalLine("Invoice discount", `-${money(calculations.invoiceDiscount, currency)}`);
      totalLine("Taxable amount", money(calculations.taxableTotal, currency));
      if (taxMode === "intra") {
        totalLine("CGST", money(calculations.cgst, currency));
        totalLine("SGST", money(calculations.sgst, currency));
      } else if (taxMode === "inter") totalLine("IGST", money(calculations.igst, currency));
      if (calculations.shippingAmount > 0) totalLine("Shipping / other charges", money(calculations.shippingAmount, currency));
      if (roundOff) totalLine("Round off", money(calculations.roundOffAmount, currency));
      page.drawRectangle({ x: totalX - 9, y: y - 8, width: totalW + 10, height: 29, color: rgb(0.93, 0.94, 1), borderColor: rgb(0.82, 0.83, 0.97), borderWidth: 0.6 });
      totalLine("TOTAL DUE", money(calculations.total, currency), true, accent);
      if (calculations.paid > 0) {
        totalLine("Amount paid", `-${money(calculations.paid, currency)}`);
        totalLine("BALANCE DUE", money(calculations.balance, currency), true, calculations.balance > 0 ? accent : rgb(0.05, 0.5, 0.32));
      }

      y -= 8;
      const paymentDetails = [
        paymentMethod && `Payment method: ${paymentMethod}`,
        paymentTerms && `Payment terms: ${paymentTerms}`,
        bankName && `Bank: ${bankName}`,
        accountName && `Account name: ${accountName}`,
        accountNumber && `Account number: ${accountNumber}`,
        ifscSwift && `IFSC / SWIFT: ${ifscSwift}`,
        upiId && `UPI ID: ${upiId}`,
      ].filter(Boolean).join("\n");
      const leftColumnWidth = 250;
      const paymentLines = wrapLines(paymentDetails, regular, 7.5, leftColumnWidth);
      const notesLines = wrapLines(notes, regular, 7.5, leftColumnWidth);
      const termsLines = wrapLines(terms, regular, 7, leftColumnWidth);
      const lowerHeight = 18 + paymentLines.length * 10 + notesLines.length * 10 + termsLines.length * 9 + (signatureName ? 45 : 0);
      if (y - lowerHeight < 60) {
        drawPageFooter(page, pdf.getPageCount());
        newPage();
        drawText(page, `INVOICE ${invoiceNo} — PAYMENT & NOTES`, margin, 808, { size: 12, font: bold, color: accent });
        y = 778;
      }
      page.drawLine({ start: { x: margin, y: y + 5 }, end: { x: pageWidth - margin, y: y + 5 }, thickness: 0.8, color: lineColor });
      drawText(page, "PAYMENT DETAILS", margin, y, { size: 8.5, font: bold, color: accent });
      let leftY = drawWrapped(page, paymentDetails, margin, y - 14, leftColumnWidth, 7.5, regular, muted, 10);
      leftY -= 8;
      if (notes.trim()) {
        drawText(page, "NOTES", margin, leftY, { size: 8, font: bold, color: accent });
        leftY = drawWrapped(page, notes, margin, leftY - 13, leftColumnWidth, 7.5, regular, muted, 10) - 8;
      }
      if (terms.trim()) {
        drawText(page, "TERMS & CONDITIONS", margin, leftY, { size: 8, font: bold, color: accent });
        leftY = drawWrapped(page, terms, margin, leftY - 13, leftColumnWidth, 7, regular, muted, 9);
      }
      if (signatureName.trim()) {
        const sx = 365;
        const sy = Math.max(80, leftY + 12);
        page.drawLine({ start: { x: sx, y: sy }, end: { x: sx + 150, y: sy }, thickness: 0.8, color: muted });
        drawText(page, signatureName, sx, sy - 8, { size: 8, font: bold, maxWidth: 150 });
        drawText(page, "Authorized signatory", sx, sy - 20, { size: 7, color: muted, maxWidth: 150 });
      }
      drawPageFooter(page, pdf.getPageCount());

      const bytes = await pdf.save();
      const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${(invoiceNo || "invoice").replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus("Invoice PDF generated and download started.");
    } catch (error) {
      setStatus(`Could not generate PDF. Please check the entered values and try again. ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  const field = (label: string, value: string, setter: (value: string) => void, type = "text", placeholder = "") => (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => setter(event.target.value)} className={inputClass} />
    </label>
  );
  const textArea = (label: string, value: string, setter: (value: string) => void, rows = 3) => (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
      {label}
      <textarea value={value} onChange={(event) => setter(event.target.value)} rows={rows} className={inputClass} />
    </label>
  );

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-violet-700 via-indigo-700 to-blue-700 px-5 py-5 text-white sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-100">Business document studio</p>
              <h2 className="mt-1 flex items-center gap-2 text-xl font-bold"><FileText size={22} /> Professional Invoice Builder</h2>
              <p className="mt-1 max-w-2xl text-sm text-indigo-100">Add your business, customer, itemized charges, tax treatment and payment instructions to create a polished PDF.</p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold">PDF · Multi-page · Local generation</div>
          </div>
        </div>
        <div className="grid gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-2 text-lg font-bold"><FileText size={19} className="text-violet-600" /> Invoice information</div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {field("Invoice number *", invoiceNo, setInvoiceNo, "text", "INV-2026-001")}
            {field("Issue date *", issueDate, setIssueDate, "date")}
            {field("Payment due date", dueDate, setDueDate, "date")}
            {field("Purchase order / reference", poNumber, setPoNumber, "text", "PO or reference number")}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold"><Building2 size={19} className="text-violet-600" /> Seller / supplier</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use the registered business details applicable to your situation.</p>
          <div className="mt-4 grid gap-4">
            {field("Business / trading name *", seller, setSeller, "text", "Your business name")}
            {field("Legal name (if different)", sellerLegalName, setSellerLegalName, "text", "Registered legal entity")}
            {textArea("Full business address", sellerAddress, setSellerAddress, 3)}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Business email", sellerEmail, setSellerEmail, "email", "billing@example.com")}
              {field("Phone", sellerPhone, setSellerPhone, "tel", "+91 ...")}
              {field("Website", sellerWebsite, setSellerWebsite, "url", "https://example.com")}
              {field("GSTIN (if applicable)", sellerGstin, setSellerGstin, "text", "GST identification number")}
              {field("PAN (if applicable)", sellerPan, setSellerPan, "text", "PAN")}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold"><UserRound size={19} className="text-violet-600" /> Customer / bill to</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add customer identity and delivery details where relevant.</p>
          <div className="mt-4 grid gap-4">
            {field("Customer / company name *", buyer, setBuyer, "text", "Customer or legal entity")}
            {textArea("Billing address", buyerAddress, setBuyerAddress, 3)}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("Customer email", buyerEmail, setBuyerEmail, "email", "accounts@example.com")}
              {field("Customer phone", buyerPhone, setBuyerPhone, "tel", "+91 ...")}
              {field("Customer GSTIN (if applicable)", buyerGstin, setBuyerGstin, "text", "GST identification number")}
              {field("Place of supply / state", placeOfSupply, setPlaceOfSupply, "text", "State / jurisdiction")}
            </div>
            {textArea("Ship-to address (if different)", shippingAddress, setShippingAddress, 2)}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-bold"><Calculator size={19} className="text-violet-600" /> Itemized charges</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Set a description, HSN/SAC (where applicable), quantity, unit price, line discount and tax rate for each item.</p>
          </div>
          <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700"><Plus size={16} /> Add line item</button>
        </div>

        <div className="mt-5 space-y-4">
          {items.map((item, index) => {
            const calc = calculations.lineDetails[index];
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/50">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800 dark:bg-violet-950 dark:text-violet-200">Item {index + 1}</span>
                  <button type="button" aria-label={`Remove item ${index + 1}`} disabled={items.length === 1} onClick={() => removeItem(item.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900 dark:hover:bg-rose-950"><Trash2 size={14} /> Remove</button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {field("Description *", item.description, (value) => updateItem(item.id, "description", value), "text", "Product or service supplied")}
                  {field("HSN / SAC code", item.hsnSac, (value) => updateItem(item.id, "hsnSac", value), "text", "If applicable")}
                </div>
                <div className="mt-3 grid gap-3 grid-cols-2 lg:grid-cols-5">
                  {field("Quantity", item.quantity, (value) => updateItem(item.id, "quantity", value), "number")}
                  {field("Unit", item.unit, (value) => updateItem(item.id, "unit", value), "text", "unit / hour / service")}
                  {field(`Unit rate (${currency})`, item.rate, (value) => updateItem(item.id, "rate", value), "number")}
                  {field("Line discount (%)", item.discountPercent, (value) => updateItem(item.id, "discountPercent", value), "number")}
                  {field("Tax rate (%)", item.taxRate, (value) => updateItem(item.id, "taxRate", value), "number")}
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-3 dark:bg-slate-900">
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Gross: {money(calc.gross, currency)}</span>
                    <span>Discount: {money(calc.lineDiscount, currency)}</span>
                    <span>Tax: {money(calc.tax, currency)}</span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">Line total: {money(calc.taxable + calc.tax, currency)}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Currency
            <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={inputClass}>{currencies.map((code) => <option key={code} value={code}>{code}</option>)}</select>
          </label>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Tax treatment
            <select value={taxMode} onChange={(event) => setTaxMode(event.target.value as TaxMode)} className={inputClass}>
              <option value="intra">Intra-state (CGST + SGST)</option>
              <option value="inter">Inter-state (IGST)</option>
              <option value="none">No tax / not applicable</option>
            </select>
          </label>
          {field("Additional invoice discount", discount, setDiscount, "number")}
          {field("Shipping / other charges", shipping, setShipping, "number")}
        </div>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
          <input type="checkbox" checked={roundOff} onChange={(event) => setRoundOff(event.target.checked)} className="mt-1 h-4 w-4 accent-violet-600" />
          <span><span className="block font-bold">Round final total to the nearest whole currency unit</span><span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">The round-off adjustment is shown separately on the invoice.</span></span>
        </label>

        <div className="mt-5 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 dark:border-violet-900/60 dark:from-violet-950/40 dark:to-indigo-950/30">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h4 className="font-bold text-slate-900 dark:text-white">Invoice summary</h4>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-violet-700 dark:bg-slate-900 dark:text-violet-200">Live calculation</span>
          </div>
          <div className="ml-auto max-w-md space-y-2.5 text-sm">
            <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Subtotal before discounts</span><span className="font-semibold">{money(calculations.subtotal, currency)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Line discounts</span><span className="font-semibold">−{money(calculations.itemDiscount, currency)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Invoice discount</span><span className="font-semibold">−{money(calculations.invoiceDiscount, currency)}</span></div>
            <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Taxable amount</span><span className="font-semibold">{money(calculations.taxableTotal, currency)}</span></div>
            {taxMode === "intra" ? <><div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">CGST</span><span className="font-semibold">{money(calculations.cgst, currency)}</span></div><div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">SGST</span><span className="font-semibold">{money(calculations.sgst, currency)}</span></div></> : taxMode === "inter" ? <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">IGST</span><span className="font-semibold">{money(calculations.igst, currency)}</span></div> : null}
            <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Shipping / other charges</span><span className="font-semibold">{money(calculations.shippingAmount, currency)}</span></div>
            {roundOff && <div className="flex justify-between gap-4"><span className="text-slate-600 dark:text-slate-300">Round off</span><span className="font-semibold">{money(calculations.roundOffAmount, currency)}</span></div>}
            <div className="flex justify-between gap-4 border-t border-violet-200 pt-3 text-lg dark:border-violet-800"><span className="font-extrabold">Total due</span><span className="font-extrabold text-violet-700 dark:text-violet-300">{money(calculations.total, currency)}</span></div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold"><CreditCard size={19} className="text-violet-600" /> Payment and settlement</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {field("Amount already paid", amountPaid, setAmountPaid, "number")}
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Preferred payment method
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className={inputClass}>{["Bank transfer", "UPI", "Cash", "Card", "Cheque", "Payment link", "Other"].map((method) => <option key={method}>{method}</option>)}</select>
            </label>
            {field("Bank name", bankName, setBankName, "text", "Bank name")}
            {field("Account holder name", accountName, setAccountName, "text", "Account name")}
            {field("Account number", accountNumber, setAccountNumber, "text", "Account number")}
            {field("IFSC / SWIFT code", ifscSwift, setIfscSwift, "text", "Bank routing code")}
            {field("UPI ID", upiId, setUpiId, "text", "name@bank")}
            {field("Payment terms", paymentTerms, setPaymentTerms, "text", "Due within 15 days")}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
            <div className="flex justify-between gap-4 text-sm"><span className="text-slate-600 dark:text-slate-300">Amount paid</span><strong>{money(calculations.paid, currency)}</strong></div>
            <div className="mt-2 flex justify-between gap-4 text-base"><span className="font-bold">Balance due</span><strong className="text-violet-700 dark:text-violet-300">{money(calculations.balance, currency)}</strong></div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <h3 className="flex items-center gap-2 text-lg font-bold"><ShieldCheck size={19} className="text-violet-600" /> Notes, terms and sign-off</h3>
          <div className="mt-4 space-y-4">
            {textArea("Customer notes / thank-you message", notes, setNotes, 3)}
            {textArea("Terms and conditions", terms, setTerms, 4)}
            {field("Authorized signatory name (optional)", signatureName, setSignatureName, "text", "Name / designation")}
          </div>
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            Before issuing, verify the tax treatment, mandatory fields, numbering, records and wording required in your jurisdiction. The tax fields are configurable helpers, not a determination of legal tax liability.
          </p>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void downloadPdf()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:from-violet-700 hover:to-indigo-700 disabled:cursor-wait disabled:opacity-60">
          <Download size={18} /> {busy ? "Generating invoice…" : "Generate professional invoice PDF"}
        </button>
        <button type="button" onClick={reset} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 disabled:opacity-50"><RotateCcw size={16} /> Reset form</button>
      </div>
      {status && <p role="status" aria-live="polite" className={`rounded-xl border p-4 text-sm font-medium ${status.startsWith("Could not") || status.startsWith("Please complete") ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"}`}>{status}</p>}
      <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">PDF is generated locally in your browser; invoice data is not sent to a server by this tool. This is a configurable invoice template, not legal or tax advice and not a substitute for jurisdiction-specific e-invoicing or e-invoice registration systems.</p>
    </div>
  );
}
