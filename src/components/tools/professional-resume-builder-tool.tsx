"use client";

import { useMemo, useState } from "react";
import { Download, FileText, Check, ArrowLeft, Sparkles, ShieldCheck, LayoutTemplate } from "lucide-react";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

type Template = { id: number; name: string; audience: string; style: "classic" | "modern" | "sidebar" | "minimal" | "creative"; color: [number, number, number]; description: string };
const templates: Template[] = [
  { id: 1, name: "Swiss Clean", audience: "ATS-first · all industries", style: "classic", color: [0.12, 0.20, 0.32], description: "A crisp single-column layout inspired by Swiss editorial typography and Google Docs’ clean resume conventions." },
  { id: 2, name: "Coral Modern", audience: "Corporate · business", style: "modern", color: [0.82, 0.29, 0.31], description: "Warm coral header, clean section hierarchy and an approachable professional feel." },
  { id: 3, name: "Serif Executive", audience: "Leadership · senior roles", style: "classic", color: [0.20, 0.25, 0.31], description: "An editorial serif-inspired treatment with restrained executive styling." },
  { id: 4, name: "Spearmint Minimal", audience: "Minimal · ATS-friendly", style: "minimal", color: [0.13, 0.45, 0.36], description: "Airy, understated and inspired by the clean green-accent resume aesthetic." },
  { id: 5, name: "Modern Writer", audience: "Communications · writing", style: "modern", color: [0.05, 0.40, 0.48], description: "A refined typographic header with strong readability for writing-focused careers." },
  { id: 6, name: "Word Classic", audience: "Traditional · ATS-first", style: "classic", color: [0.20, 0.32, 0.53], description: "Traditional one-column format with familiar headings and reverse-chronological content." },
  { id: 7, name: "Harvard Academic", audience: "Research · academia", style: "minimal", color: [0.32, 0.20, 0.28], description: "Academic-inspired hierarchy for education, research, publications and credentials." },
  { id: 8, name: "Canva-Inspired Creative", audience: "Design · creative", style: "creative", color: [0.62, 0.22, 0.39], description: "A distinctive accent-led layout for portfolios and creative applications." },
  { id: 9, name: "Consulting Impact", audience: "Consulting · strategy", style: "classic", color: [0.14, 0.30, 0.47], description: "Compact, achievement-led presentation for analytical and client-facing work." },
  { id: 10, name: "Finance Professional", audience: "Finance · banking · accounting", style: "classic", color: [0.08, 0.34, 0.28], description: "Conservative green accents and a precise, information-first structure." },
  { id: 11, name: "Marketing & Growth", audience: "Marketing · communications", style: "modern", color: [0.67, 0.32, 0.10], description: "Expressive color and clear space for campaigns, outcomes and growth metrics." },
  { id: 12, name: "Project Leader", audience: "Project · program management", style: "modern", color: [0.25, 0.32, 0.60], description: "Strong hierarchy for delivery, stakeholder management and measurable results." },
  { id: 13, name: "Product Strategist", audience: "Product · business", style: "modern", color: [0.37, 0.26, 0.62], description: "Modern violet-accent layout for product outcomes, roadmaps and cross-functional work." },
  { id: 14, name: "Data & AI Sidebar", audience: "Data · software · AI/ML", style: "sidebar", color: [0.05, 0.39, 0.46], description: "Technical sidebar concept for contact details and compact skill highlights." },
  { id: 15, name: "Healthcare Professional", audience: "Healthcare · life sciences", style: "classic", color: [0.05, 0.42, 0.38], description: "Calm clinical styling for credentials, experience and certifications." },
  { id: 16, name: "Teacher & Educator", audience: "Teaching · education", style: "minimal", color: [0.31, 0.35, 0.63], description: "Warm, structured presentation for teaching practice and education history." },
  { id: 17, name: "Sales & Client Success", audience: "Sales · customer success", style: "modern", color: [0.60, 0.29, 0.15], description: "Confident header for account ownership, client outcomes and sales achievements." },
  { id: 18, name: "Operations Sidebar", audience: "Operations · logistics", style: "sidebar", color: [0.26, 0.38, 0.27], description: "Organized green sidebar concept for operational, process and logistics profiles." },
  { id: 19, name: "International Clean", audience: "Global applications", style: "minimal", color: [0.20, 0.31, 0.47], description: "Neutral, location-flexible format with optional personal details omitted by default." },
  { id: 20, name: "Bold Contemporary", audience: "Modern · leadership · creative", style: "creative", color: [0.36, 0.22, 0.62], description: "High-contrast contemporary layout with a strong identity and geometric accent." },
];
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const emptyForm = { fullName: "", headline: "", email: "", phone: "", location: "", linkedin: "", portfolio: "", summary: "", skills: "", experience: "", education: "", projects: "", certifications: "", awards: "", languages: "", volunteer: "", publications: "", interests: "", targetRole: "", includePhoto: false };
type ResumeForm = typeof emptyForm;
const sections = [
  { key: "summary", label: "Professional summary", hint: "2–4 sentences about your strengths, experience and target role.", rows: 3 },
  { key: "experience", label: "Work experience", hint: "One role per paragraph: Job title | Company | Dates, then achievements on separate lines.", rows: 5 },
  { key: "education", label: "Education", hint: "One qualification per paragraph: Degree | Institution | Dates. Add grades or coursework if useful.", rows: 4 },
  { key: "projects", label: "Projects", hint: "Project name, technologies used, what you built and the outcome.", rows: 4 },
  { key: "skills", label: "Skills", hint: "Separate skills with commas, bullets or new lines.", rows: 3 },
  { key: "certifications", label: "Certifications & courses", hint: "Name | Issuer | Year.", rows: 2 },
  { key: "awards", label: "Awards & achievements", hint: "Award or achievement and date/context.", rows: 2 },
  { key: "languages", label: "Languages", hint: "Language and proficiency, e.g. English — Professional.", rows: 2 },
  { key: "publications", label: "Publications / research", hint: "Optional; useful for academic or research resumes.", rows: 2 },
  { key: "volunteer", label: "Volunteer / leadership experience", hint: "Optional; include role, organization and impact.", rows: 2 },
  { key: "interests", label: "Additional information", hint: "Optional relevant interests, memberships or work authorization.", rows: 2 },
] as const;
const clean = (s: string) => s.replace(/\r/g, "").replace(/[\t ]+$/gm, "").trim();

export default function ProfessionalResumeBuilderTool() {
  const [selected, setSelected] = useState<Template | null>(null);
  const [form, setForm] = useState<ResumeForm>(emptyForm);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const update = (key: keyof ResumeForm, value: string | boolean) => setForm((old) => ({ ...old, [key]: value }));
  const completion = useMemo(() => {
    const keys: (keyof ResumeForm)[] = ["fullName", "headline", "email", "summary", "skills", "education"];
    return Math.round(keys.filter((key) => String(form[key]).trim()).length / keys.length * 100);
  }, [form]);

  async function generatePdf() {
    if (!selected) return;
    if (!clean(form.fullName) || !clean(form.email) || !clean(form.headline)) {
      setStatus("Please enter your full name, target professional title and email before exporting.");
      return;
    }
    setBusy(true); setStatus("");
    try {
      const pdf = await PDFDocument.create();
      pdf.setTitle(`${form.fullName} - Resume`); pdf.setAuthor(form.fullName); pdf.setSubject(`${form.headline} resume`);
      const regular = await pdf.embedFont(StandardFonts.Helvetica);
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
      const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);
      const [cr, cg, cb] = selected.color;
      const accent = rgb(cr, cg, cb); const ink = rgb(0.12, 0.15, 0.20); const muted = rgb(0.36, 0.40, 0.46); const pale = rgb(0.95, 0.96, 0.98); const white = rgb(1, 1, 1);
      const pageW = 595.28, pageH = 841.89, margin = selected.style === "sidebar" ? 48 : 52;
      let page = undefined as unknown as PDFPage; let y = 0; let pageNo = 0;
      const newPage = () => {
        page = pdf.addPage([pageW, pageH]); pageNo++; y = pageH - 52;
        if (selected.style === "sidebar") page.drawRectangle({ x: 0, y: 0, width: 148, height: pageH, color: accent });
        else if ([8, 20].includes(selected.id)) page.drawRectangle({ x: 0, y: 0, width: 8, height: pageH, color: accent });
        else if ([1, 3, 6, 7, 9, 10, 16, 19].includes(selected.id)) page.drawLine({ start: { x: margin, y: pageH - 28 }, end: { x: pageW - margin, y: pageH - 28 }, thickness: selected.id === 7 ? 1.8 : 0.8, color: accent });
        else if ([4, 13].includes(selected.id)) page.drawRectangle({ x: 0, y: pageH - 8, width: pageW, height: 8, color: accent });
        page.drawLine({ start: { x: margin, y: 30 }, end: { x: pageW - margin, y: 30 }, thickness: 0.5, color: rgb(0.86, 0.88, 0.91) });
        page.drawText(`${form.fullName}  ·  Resume`, { x: margin, y: 17, size: 7, font: regular, color: muted });
        page.drawText(`Page ${pageNo}`, { x: pageW - margin - 35, y: 17, size: 7, font: regular, color: muted });
        return page;
      };
      const contentLeft = selected.style === "sidebar" ? 170 : margin;
      const contentWidth = pageW - contentLeft - margin;
      const wrap = (text: string, font: PDFFont, size: number, maxWidth: number) => {
        const output: string[] = [];
        for (const paragraph of text.split("\n")) {
          if (!paragraph.trim()) { output.push(""); continue; }
          const words = paragraph.split(/\s+/); let line = "";
          for (const word of words) {
            const candidate = line ? `${line} ${word}` : word;
            if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) { output.push(line); line = word; }
            else line = candidate;
          }
          if (line) output.push(line);
        }
        return output;
      };
      const ensure = (needed: number) => { if (y - needed < 55) { newPage(); if (selected.style === "sidebar") y = pageH - 56; } };
      const text = (value: string, size = 9, font: PDFFont = regular, color = ink, x = contentLeft, width = contentWidth, leading = size * 1.42) => {
        const lines = wrap(value, font, size, width); ensure(lines.length * leading + 2);
        for (const line of lines) { if (line) page.drawText(line, { x, y, size, font, color }); y -= leading; }
        return lines.length * leading;
      };
      const section = (title: string, value: string) => {
        if (!clean(value)) return;
        ensure(38);
        y -= 8;
        const sectionX = [8, 20].includes(selected.id) ? contentLeft + 10 : contentLeft;
        if ([8, 20].includes(selected.id)) page.drawRectangle({ x: contentLeft, y: y - 3, width: selected.id === 20 ? 6 : 3, height: 15, color: accent });
        if ([2, 11, 12, 15, 17].includes(selected.id)) page.drawRectangle({ x: contentLeft, y: y - 5, width: contentWidth, height: 19, color: pale });
        page.drawText(selected.id === 7 || selected.id === 3 ? title : title.toUpperCase(), { x: sectionX, y, size: selected.id === 7 ? 10 : 9, font: selected.id === 7 ? italic : bold, color: accent });
        y -= 7;
        if (![4, 16, 19].includes(selected.id)) page.drawLine({ start: { x: contentLeft, y }, end: { x: pageW - margin, y }, thickness: [3, 7, 10].includes(selected.id) ? 1 : 0.55, color: rgb(cr, cg, cb) });
        y -= 10;
        text(value, 8.7, regular, ink, contentLeft, contentWidth, 12.3);
      };
      newPage();
      if (selected.style === "sidebar") {
        page.drawText(form.fullName.slice(0, 1).toUpperCase(), { x: 42, y: pageH - 105, size: 32, font: bold, color: white });
        page.drawText(form.fullName, { x: contentLeft, y: y - 2, size: 22, font: bold, color: accent, maxWidth: contentWidth }); y -= 28;
        page.drawText(form.headline, { x: contentLeft, y, size: 10, font: bold, color: muted, maxWidth: contentWidth }); y -= 16;
        page.drawText("CONTACT", { x: 28, y: pageH - 150, size: 8, font: bold, color: white });
        let sy = pageH - 167;
        for (const item of [form.email, form.phone, form.location, form.linkedin, form.portfolio]) if (clean(item)) {
          for (const line of wrap(clean(item), regular, 7, 100)) { page.drawText(line, { x: 28, y: sy, size: 7, font: regular, color: white }); sy -= 10; }
          sy -= 4;
        }
      }
      const contact = [form.email, form.phone, form.location, form.linkedin, form.portfolio].filter((v) => clean(v)).join("  |  ");
      const bannerIds = [2, 5, 8, 11, 12, 13, 15, 17, 20];
      if (bannerIds.includes(selected.id)) {
        const bannerHeight = selected.id === 20 ? 154 : selected.id === 8 ? 132 : 142;
        page.drawRectangle({ x: selected.id === 20 ? 8 : 0, y: pageH - bannerHeight, width: pageW - (selected.id === 20 ? 8 : 0), height: bannerHeight, color: selected.id === 20 ? ink : accent });
        if ([8, 11, 20].includes(selected.id)) page.drawRectangle({ x: margin, y: pageH - bannerHeight + 15, width: selected.id === 20 ? 78 : 52, height: 3, color: accent });
        const nameY = selected.id === 8 ? pageH - 58 : selected.id === 20 ? pageH - 68 : pageH - 65;
        page.drawText(form.fullName, { x: selected.id === 13 ? pageW / 2 - Math.min(130, bold.widthOfTextAtSize(form.fullName, 23) / 2) : margin, y: nameY, size: selected.id === 20 ? 26 : 23, font: bold, color: white, maxWidth: pageW - margin * 2 });
        page.drawText(form.headline, { x: margin, y: nameY - 23, size: 11, font: regular, color: rgb(0.93, 0.95, 0.98), maxWidth: pageW - margin * 2 });
        let cy = nameY - 45;
        for (const line of wrap(contact, regular, 7.5, pageW - margin * 2)) { page.drawText(line, { x: margin, y: cy, size: 7.5, font: regular, color: white }); cy -= 10; }
        y = pageH - bannerHeight - 22;
      } else if ([4, 19].includes(selected.id)) {
        const nameWidth = bold.widthOfTextAtSize(form.fullName, 22);
        page.drawText(form.fullName, { x: Math.max(margin, (pageW - nameWidth) / 2), y, size: 22, font: bold, color: selected.id === 4 ? ink : accent, maxWidth: contentWidth }); y -= 27;
        const titleWidth = bold.widthOfTextAtSize(form.headline, 10);
        page.drawText(form.headline, { x: Math.max(margin, (pageW - titleWidth) / 2), y, size: 10, font: bold, color: muted, maxWidth: contentWidth }); y -= 16;
        text(contact, 7.5, regular, muted, contentLeft, contentWidth, 10); y -= 5;
        if (selected.id === 4) page.drawLine({ start: { x: pageW / 2 - 34, y }, end: { x: pageW / 2 + 34, y }, thickness: 2, color: accent });
        y -= 8;
      } else {
        const nameFont = selected.id === 7 || selected.id === 3 ? await pdf.embedFont(StandardFonts.TimesRomanBold) : bold;
        page.drawText(form.fullName, { x: contentLeft, y, size: selected.id === 7 ? 23 : selected.id === 10 ? 22 : 24, font: nameFont, color: selected.id === 6 || selected.id === 9 ? ink : accent, maxWidth: contentWidth }); y -= 27;
        page.drawText(form.headline, { x: contentLeft, y, size: 11, font: bold, color: muted, maxWidth: contentWidth }); y -= 17;
        text(contact, 7.5, regular, muted, contentLeft, contentWidth, 10); y -= 5;
        if ([1, 3, 6, 7, 9, 10, 16].includes(selected.id)) { page.drawLine({ start: { x: contentLeft, y }, end: { x: pageW - margin, y }, thickness: [3, 7, 10].includes(selected.id) ? 1.2 : 0.75, color: accent }); y -= 7; }
      }
      const orderedSections = selected.id === 6 ? ["education", "projects", "experience", "skills", "certifications", "awards", "languages", "volunteer", "publications", "interests"] : selected.id === 7 ? ["education", "experience", "publications", "projects", "skills", "certifications", "awards", "languages", "interests"] : ["summary", "experience", "projects", "education", "skills", "certifications", "awards", "publications", "volunteer", "languages", "interests"];
      const titleMap: Record<string, string> = { summary: "Professional Summary", experience: "Experience", projects: "Projects", education: "Education", skills: "Skills", certifications: "Certifications", awards: "Awards & Achievements", publications: "Publications & Research", volunteer: "Leadership & Volunteering", languages: "Languages", interests: "Additional Information" };
      for (const key of orderedSections) section(titleMap[key], form[key as keyof ResumeForm] as string);
      if (!clean(form.summary) && selected.id !== 6 && selected.id !== 7) { /* intentionally omit empty sections; never invent resume content */ }
      const bytes = await pdf.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" }); const url = URL.createObjectURL(blob); const a = document.createElement("a");
      a.href = url; a.download = `${form.fullName.trim().replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "resume"}-${selected.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      setStatus(`Your ${selected.name} resume PDF has been generated. Check your downloads.`);
    } catch (error) {
      setStatus(error instanceof Error ? `Could not generate PDF: ${error.message}` : "Could not generate the PDF. Please review your details and try again.");
    } finally { setBusy(false); }
  }

  return <div className="space-y-6">
    {!selected ? <>
      <div className="flex flex-col gap-3 rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-blue-50 p-5 dark:border-violet-900 dark:from-violet-950/40 dark:to-blue-950/30 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300"><Sparkles size={16}/> 20 professional templates</div><h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">Choose a resume design</h2><p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">Select a template to open its guided resume form. Your details stay in your browser and are used to generate a downloadable PDF.</p></div>
        <div className="flex items-center gap-2 text-xs text-slate-500"><ShieldCheck size={16}/> Local PDF generation</div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{templates.map((template) => <button key={template.id} type="button" onClick={() => { setSelected(template); setStatus(""); }} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-36 overflow-hidden bg-slate-50 p-4 dark:bg-slate-950"><div className="mx-auto flex h-full max-w-[210px] overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm"><div className={`${[14,18].includes(template.id) ? "w-[28%]" : [8,20].includes(template.id) ? "w-1" : "hidden"} shrink-0`} style={{ backgroundColor: `rgb(${template.color.map(v => Math.round(v * 255)).join(",")})` }}/><div className="min-w-0 flex-1 p-3"><div className={`${[2,5,8,11,12,13,15,17,20].includes(template.id) ? "-mx-3 -mt-3 mb-2 h-7 px-3 pt-2" : "mb-2"}`} style={[2,5,8,11,12,13,15,17,20].includes(template.id) ? { backgroundColor: `rgb(${template.color.map(v => Math.round(v * 255)).join(",")})` } : {}}><div className="h-2.5 w-2/3 rounded-sm" style={{ backgroundColor: [2,5,8,11,12,13,15,17,20].includes(template.id) ? "rgba(255,255,255,.95)" : `rgb(${template.color.map(v => Math.round(v * 255)).join(",")})` }}/></div><div className={`${[4,19].includes(template.id) ? "mx-auto" : ""} h-1.5 w-1/2 rounded bg-slate-300`}/><div className="mt-3 h-1 w-full rounded bg-slate-200"/><div className="mt-1 h-1 w-5/6 rounded bg-slate-200"/><div className="mt-3 flex items-center gap-1"><div className="h-1.5 w-1/3 rounded" style={{ backgroundColor: `rgba(${template.color.map(v => Math.round(v * 255)).join(",")},.7)` }}/>{[7,10,16].includes(template.id) ? <div className="h-px flex-1 bg-slate-300"/> : null}</div><div className="mt-2 space-y-1"><div className="h-1 w-full rounded bg-slate-200"/><div className="h-1 w-4/5 rounded bg-slate-200"/><div className="h-1 w-3/4 rounded bg-slate-200"/></div>{[14,18].includes(template.id) ? <div className="mt-2 h-1 w-4/5 rounded bg-slate-200"/> : null}</div></div><span className="absolute right-3 top-4 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-600">{String(template.id).padStart(2,"0")}</span></div>
        <div className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">{template.name}</h3><p className="mt-1 text-xs font-medium text-violet-600 dark:text-violet-300">{template.audience}</p></div><LayoutTemplate size={18} className="shrink-0 text-slate-400 group-hover:text-violet-600"/></div><p className="mt-2 text-sm leading-5 text-slate-600 dark:text-slate-300">{template.description}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 dark:text-violet-300">Use this template <span aria-hidden="true">→</span></span></div>
      </button>)}</div>
    </> : <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ backgroundColor: `rgba(${selected.color.map(v => Math.round(v * 255)).join(",")},.12)`, color: `rgb(${selected.color.map(v => Math.round(v * 255)).join(",")})` }}><FileText size={22}/></div><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Selected template {selected.id}/20</p><h2 className="font-bold text-slate-900 dark:text-white">{selected.name}</h2><p className="text-xs text-slate-500">{selected.description}</p></div></div><button type="button" onClick={() => setSelected(null)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><ArrowLeft size={16}/> Change template</button></div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Contact & target role</h3><p className="mt-1 text-sm text-slate-500">Fields marked * are required. Only include details you are comfortable sharing.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
          {([{ key: "fullName", label: "Full name *", placeholder: "Your full name" }, { key: "headline", label: "Professional title / target role *", placeholder: "e.g. Software Engineer" }, { key: "email", label: "Email *", placeholder: "you@example.com" }, { key: "phone", label: "Phone", placeholder: "+91 ..." }, { key: "location", label: "City, country", placeholder: "Gurugram, India" }, { key: "linkedin", label: "LinkedIn URL", placeholder: "linkedin.com/in/yourname" }, { key: "portfolio", label: "Portfolio / GitHub / website", placeholder: "https://..." }] as const).map(field => <label key={field.key} className="block text-sm font-medium text-slate-700 dark:text-slate-200">{field.label}<input className={inputClass} value={form[field.key]} onChange={e => update(field.key, e.target.value)} placeholder={field.placeholder}/></label>)}
        </div></section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="text-lg font-bold text-slate-900 dark:text-white">2. Resume content</h3><p className="mt-1 text-sm text-slate-500">Add only truthful details. Leave sections blank if they do not apply; empty sections are omitted from the PDF.</p><div className="mt-4 space-y-4">{sections.map(s => <label key={s.key} className="block text-sm font-medium text-slate-700 dark:text-slate-200">{s.label}<textarea className={inputClass} rows={s.rows} value={form[s.key]} onChange={e => update(s.key, e.target.value)} placeholder={s.hint}/><span className="mt-1 block text-xs font-normal text-slate-500">{s.hint}</span></label>)}</div></section>
      </div><aside className="space-y-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-bold text-slate-900 dark:text-white">Resume readiness</h3><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-violet-600 transition-all" style={{ width: `${completion}%` }}/></div><p className="mt-2 text-sm text-slate-500">{completion}% of recommended basics completed</p><ul className="mt-4 space-y-2 text-sm">{([{ k: "fullName", label: "Full name" }, { k: "headline", label: "Target role" }, { k: "email", label: "Email" }, { k: "summary", label: "Summary" }, { k: "skills", label: "Skills" }, { k: "education", label: "Education" }] as const).map(i => <li key={i.k} className="flex items-center gap-2">{form[i.k].trim() ? <Check size={16} className="text-emerald-600"/> : <span className="h-4 w-4 rounded-full border border-slate-300"/>}<span className={form[i.k].trim() ? "text-slate-700 dark:text-slate-200" : "text-slate-500"}>{i.label}</span></li>)}</ul><button type="button" onClick={generatePdf} disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-60"><Download size={17}/>{busy ? "Generating PDF…" : "Download resume PDF"}</button><p className="mt-3 text-xs leading-5 text-slate-500">PDF is generated in your browser. Your resume details are not uploaded by this tool.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200"><strong>Professional tip</strong><p className="mt-1">Use specific achievements and measurable results where possible. Do not add fake experience, skills or qualifications.</p></div></aside></div>
    </>}
    {status && <div role="status" className={`rounded-xl border p-3 text-sm ${status.startsWith("Could not") || status.startsWith("Please") ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200" : "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200"}`}>{status}</div>}
    <p className="text-xs leading-5 text-slate-500">Templates are original layout variations, not a guarantee of ATS compatibility. Some employers and regions have specific resume requirements. Review the PDF before applying; no details are invented for you.</p>
  </div>;
}
