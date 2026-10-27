"use client";

import { useMemo, useRef, useState } from "react";
import { Check, Copy, Download, Image as ImageIcon, RotateCcw, Shuffle } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

const themes = [
  { id: "light", name: "Clean light", bg: "#FFFFFF", card: "#FFFFFF", text: "#0F172A", muted: "#64748B", accent: "#0EA5E9", border: "#E2E8F0" },
  { id: "dark", name: "Midnight", bg: "#0F172A", card: "#111827", text: "#F8FAFC", muted: "#94A3B8", accent: "#38BDF8", border: "#334155" },
  { id: "lavender", name: "Lavender", bg: "#F5F3FF", card: "#FFFFFF", text: "#312E81", muted: "#7C73A8", accent: "#8B5CF6", border: "#DDD6FE" },
  { id: "mint", name: "Fresh mint", bg: "#ECFDF5", card: "#FFFFFF", text: "#064E3B", muted: "#4D7C6C", accent: "#10B981", border: "#A7F3D0" },
  { id: "sunset", name: "Sunset", bg: "#FFF7ED", card: "#FFFFFF", text: "#7C2D12", muted: "#9A6B55", accent: "#F97316", border: "#FED7AA" },
  { id: "rose", name: "Rose", bg: "#FFF1F2", card: "#FFFFFF", text: "#881337", muted: "#9F6478", accent: "#E11D48", border: "#FECDD3" },
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = candidate;
  }
  if (line) lines.push(line);
  return lines;
}

export default function TweetToImageTool() {
  const [displayName, setDisplayName] = useState("Alex Morgan");
  const [handle, setHandle] = useState("alexmorgan");
  const [avatarInitials, setAvatarInitials] = useState("AM");
  const [post, setPost] = useState("Small steps every day add up to big results. Keep building, keep learning, and keep showing up.");
  const [themeId, setThemeId] = useState("light");
  const [showHandle, setShowHandle] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [verified, setVerified] = useState(false);
  const [width, setWidth] = useState("1200");
  const [height, setHeight] = useState("675");
  const [filename, setFilename] = useState("social-post.png");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = themes.find((t) => t.id === themeId) || themes[0];
  const w = Math.min(2400, Math.max(600, Number(width) || 1200));
  const h = Math.min(2400, Math.max(400, Number(height) || 675));
  const previewSvg = useMemo(() => {
    const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c] || c));
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${theme.bg}"/><rect x="36" y="36" width="${w-72}" height="${h-72}" rx="32" fill="${theme.card}" stroke="${theme.border}" stroke-width="2"/><circle cx="100" cy="112" r="34" fill="${theme.accent}" /><text x="100" y="121" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#fff" text-anchor="middle">${esc(avatarInitials.slice(0,3) || "A")}</text><text x="150" y="105" font-family="Arial,sans-serif" font-size="27" font-weight="700" fill="${theme.text}">${esc(displayName.slice(0,45))}</text>${showHandle ? `<text x="150" y="137" font-family="Arial,sans-serif" font-size="20" fill="${theme.muted}">@${esc(handle.replace(/^@/, "").slice(0,45))}</text>` : ""}<foreignObject x="72" y="190" width="${w-144}" height="${h-270}"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,sans-serif;font-size:${Math.max(26, Math.min(44, w/27))}px;line-height:1.35;color:${theme.text};white-space:pre-wrap;overflow-wrap:anywhere;">${esc(post.slice(0,1200))}</div></foreignObject>${showFooter ? `<text x="72" y="${h-75}" font-family="Arial,sans-serif" font-size="18" fill="${theme.muted}">Social post preview · ${w} × ${h}</text>` : ""}</svg>`;
  }, [w, h, theme, displayName, handle, avatarInitials, post, showHandle, showFooter]);

  function renderCanvas(): Promise<HTMLCanvasElement> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas is not available in this browser.")); return; }
      ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, w, h);
      const pad = Math.max(24, w * 0.03);
      const x = pad, y = pad, cardW = w - pad * 2, cardH = h - pad * 2;
      const radius = Math.max(18, w * 0.027);
      ctx.fillStyle = theme.card;
      ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, radius); ctx.fill();
      ctx.strokeStyle = theme.border; ctx.lineWidth = 2; ctx.stroke();
      const scale = w / 1200;
      const avatarR = 34 * scale;
      const avatarX = x + 64 * scale, avatarY = y + 76 * scale;
      ctx.fillStyle = theme.accent; ctx.beginPath(); ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#FFFFFF"; ctx.font = `700 ${25 * scale}px Arial, sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText((avatarInitials.trim().slice(0, 3) || "A").toUpperCase(), avatarX, avatarY);
      const textX = x + 114 * scale;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = theme.text; ctx.font = `700 ${27 * scale}px Arial, sans-serif`;
      ctx.fillText(displayName.slice(0, 45), textX, y + 68 * scale, cardW - 170 * scale);
      if (showHandle) {
        ctx.fillStyle = theme.muted; ctx.font = `${20 * scale}px Arial, sans-serif`;
        ctx.fillText("@" + handle.replace(/^@/, "").slice(0, 45), textX, y + 100 * scale, cardW - 170 * scale);
      }
      ctx.fillStyle = theme.text; ctx.font = `${Math.max(26, Math.min(44, w / 27))}px Arial, sans-serif`;
      const contentX = x + 36 * scale, maxTextWidth = cardW - 72 * scale;
      const lines = wrapText(ctx, post.slice(0, 1200), maxTextWidth);
      const lineHeight = Math.max(34, Math.min(60, w / 20));
      let textY = y + 180 * scale;
      const maxLines = Math.max(1, Math.floor((cardH - 230 * scale) / lineHeight));
      for (const line of lines.slice(0, maxLines)) {
        ctx.fillText(line, contentX, textY, maxTextWidth);
        textY += lineHeight;
      }
      if (showFooter) {
        ctx.fillStyle = theme.muted; ctx.font = `${18 * scale}px Arial, sans-serif`;
        ctx.fillText(`Social post preview · ${w} × ${h}`, x + 36 * scale, y + cardH - 32 * scale);
      }
      resolve(canvas);
    });
  }

  async function download() {
    setError("");
    if (!post.trim()) { setError("Enter some post text before downloading."); return; }
    if (post.length > 1200) { setError("Keep the post to 1,200 characters or fewer."); return; }
    try {
      const canvas = await renderCanvas();
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("Could not export PNG.")), "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = (filename.trim() || "social-post.png").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/\.png$/i, "") + ".png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create image.");
    }
  }

  async function copyText() {
    setError("");
    try { await navigator.clipboard.writeText(post); setCopied(true); }
    catch { setError("Clipboard access failed. Select the post text and copy it manually."); }
  }

  function reset() {
    setDisplayName("Alex Morgan"); setHandle("alexmorgan"); setAvatarInitials("AM");
    setPost("Small steps every day add up to big results. Keep building, keep learning, and keep showing up.");
    setThemeId("light"); setShowHandle(true); setShowFooter(true); setVerified(false);
    setWidth("1200"); setHeight("675"); setFilename("social-post.png"); setError(""); setCopied(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.95fr)]">
      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3"><span className="rounded-xl bg-sky-100 p-2 text-sky-700 dark:bg-sky-950 dark:text-sky-300"><ImageIcon size={22} /></span><div><h2 className="font-semibold text-slate-900 dark:text-white">Compose your social card</h2><p className="text-sm text-slate-500 dark:text-slate-400">Customize the text and look, then export a PNG.</p></div></div>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-medium">Display name</label><input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={45} /></div><div><label className="mb-1 block text-sm font-medium">Handle</label><input className={inputClass} value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={45} /></div><div><label className="mb-1 block text-sm font-medium">Avatar initials</label><input className={inputClass} value={avatarInitials} onChange={(e) => setAvatarInitials(e.target.value)} maxLength={3} /></div><div><label className="mb-1 block text-sm font-medium">Image size</label><select className={inputClass} value={`${width}x${height}`} onChange={(e) => { const [ww, hh] = e.target.value.split("x"); setWidth(ww); setHeight(hh); }}><option value="1200x675">Landscape · 1200 × 675</option><option value="1080x1080">Square · 1080 × 1080</option><option value="1080x1350">Portrait · 1080 × 1350</option><option value="1600x900">HD · 1600 × 900</option></select></div></div>
        <div><label className="mb-1 block text-sm font-medium">Post text ({post.length}/1200)</label><textarea className={`${inputClass} min-h-36 resize-y`} value={post} onChange={(e) => { setPost(e.target.value); setError(""); }} maxLength={1200} placeholder="Write your post here..." /></div>
        <div><label className="mb-2 block text-sm font-medium">Theme</label><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{themes.map((t) => <button key={t.id} type="button" onClick={() => setThemeId(t.id)} className={`flex items-center gap-2 rounded-xl border p-2 text-left text-xs font-medium ${themeId === t.id ? "border-sky-500 ring-1 ring-sky-300" : "border-slate-200 dark:border-slate-700"}`}><span className="h-6 w-6 rounded-full border" style={{ background: t.bg, borderColor: t.border }} /><span className="text-slate-700 dark:text-slate-200">{t.name}</span></button>)}</div></div>
        <div className="flex flex-wrap gap-5 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={showHandle} onChange={(e) => setShowHandle(e.target.checked)} /> Show handle</label><label className="flex items-center gap-2"><input type="checkbox" checked={showFooter} onChange={(e) => setShowFooter(e.target.checked)} /> Show footer</label></div>
        <div><label className="mb-1 block text-sm font-medium">Download filename</label><input className={inputClass} value={filename} onChange={(e) => setFilename(e.target.value)} maxLength={100} /></div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{error}</p>}
        <div className="flex flex-wrap gap-3"><button type="button" onClick={download} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700"><Download size={16} /> Download PNG</button><button type="button" onClick={copyText} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Copy size={16} /> Copy post text</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><RotateCcw size={16} /> Reset</button></div>
        {copied && <p role="status" className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300"><Check size={15} /> Post text copied.</p>}
      </div>
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold text-slate-900 dark:text-white">Live preview</h2><span className="text-xs text-slate-500">{w} × {h} px</span></div><div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"><svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" role="img" aria-label="Preview of your social post"><rect width={w} height={h} fill={theme.bg} /><rect x={36} y={36} width={w-72} height={h-72} rx={32} fill={theme.card} stroke={theme.border} strokeWidth="2" /><circle cx="100" cy="112" r="34" fill={theme.accent} /><text x="100" y="121" textAnchor="middle" fontSize="25" fontWeight="700" fill="#fff">{avatarInitials.slice(0,3) || "A"}</text><text x="150" y="105" fontSize="27" fontWeight="700" fill={theme.text}>{displayName.slice(0,45)}</text>{showHandle && <text x="150" y="137" fontSize="20" fill={theme.muted}>@{handle.replace(/^@/, "").slice(0,45)}</text>}<foreignObject x="72" y="190" width={w-144} height={h-270}><div style={{ fontFamily: "Arial, sans-serif", fontSize: `${Math.max(26, Math.min(44, w/27))}px`, lineHeight: 1.35, color: theme.text, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{post}</div></foreignObject>{showFooter && <text x="72" y={h-75} fontSize="18" fill={theme.muted}>Social post preview · {w} × {h}</text>}</svg></div><p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Preview is a mock social card and is not affiliated with or an official screenshot from X/Twitter.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold text-slate-900 dark:text-white">Export details</h3><ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300"><li>PNG image generated locally in your browser</li><li>Choose landscape, square, portrait or HD size</li><li>No account, upload or API key needed</li></ul></div>
      </div>
    </section>
  );
}
