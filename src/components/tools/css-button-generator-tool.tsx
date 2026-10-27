"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

type ButtonStyle = "solid" | "gradient";

export default function CssButtonGeneratorTool() {
  const [label, setLabel] = useState("Get started");
  const [style, setStyle] = useState<ButtonStyle>("gradient");
  const [background, setBackground] = useState("#6d28d9");
  const [gradientEnd, setGradientEnd] = useState("#2563eb");
  const [textColor, setTextColor] = useState("#ffffff");
  const [borderColor, setBorderColor] = useState("#6d28d9");
  const [borderWidth, setBorderWidth] = useState(0);
  const [radius, setRadius] = useState(12);
  const [fontSize, setFontSize] = useState(16);
  const [paddingY, setPaddingY] = useState(12);
  const [paddingX, setPaddingX] = useState(24);
  const [hoverScale, setHoverScale] = useState(1.03);
  const [hoverBrightness, setHoverBrightness] = useState(0.9);
  const [copied, setCopied] = useState(false);

  const normalBackground = style === "gradient"
    ? `linear-gradient(135deg, ${background}, ${gradientEnd})`
    : background;
  const css = useMemo(() => `.custom-button {\n  display: inline-block;\n  padding: ${paddingY}px ${paddingX}px;\n  border: ${borderWidth}px solid ${borderColor};\n  border-radius: ${radius}px;\n  background: ${normalBackground};\n  color: ${textColor};\n  font-size: ${fontSize}px;\n  font-weight: 600;\n  line-height: 1.4;\n  cursor: pointer;\n  transition: transform 180ms ease, filter 180ms ease, box-shadow 180ms ease;\n}\n\n.custom-button:hover {\n  filter: brightness(${hoverBrightness});\n  transform: scale(${hoverScale});\n  box-shadow: 0 8px 20px rgb(0 0 0 / 16%);\n}\n\n.custom-button:focus-visible {\n  outline: 3px solid ${background};\n  outline-offset: 3px;\n}`, [paddingY, paddingX, borderWidth, borderColor, radius, normalBackground, textColor, fontSize, hoverBrightness, hoverScale, background]);

  function reset() {
    setLabel("Get started"); setStyle("gradient"); setBackground("#6d28d9"); setGradientEnd("#2563eb");
    setTextColor("#ffffff"); setBorderColor("#6d28d9"); setBorderWidth(0); setRadius(12); setFontSize(16);
    setPaddingY(12); setPaddingX(24); setHoverScale(1.03); setHoverBrightness(0.9); setCopied(false);
  }
  async function copyCss() {
    try { await navigator.clipboard.writeText(css); setCopied(true); }
    catch { setCopied(false); }
  }
  const field = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
  const labelClass = "mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200";
  const rangeClass = "w-full accent-violet-600";

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Button settings</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adjust the design and preview normal and hover states.</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"><RotateCcw size={15}/> Reset</button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3"><label className={labelClass} htmlFor="button-label">Button text</label><input id="button-label" className={field} maxLength={80} value={label} onChange={e => setLabel(e.target.value)} /></div>
        <div><label className={labelClass} htmlFor="button-style">Background style</label><select id="button-style" className={field} value={style} onChange={e => setStyle(e.target.value as ButtonStyle)}><option value="solid">Solid color</option><option value="gradient">Linear gradient</option></select></div>
        <div><label className={labelClass} htmlFor="button-bg">{style === "gradient" ? "Gradient start" : "Background"}</label><div className="flex gap-2"><input aria-label="Background color" id="button-bg" type="color" value={background} onChange={e => setBackground(e.target.value)} className="h-10 w-12 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/><input aria-label="Background HEX" className={field} value={background} onChange={e => setBackground(e.target.value)} pattern="^#[0-9A-Fa-f]{6}$" /></div></div>
        {style === "gradient" && <div><label className={labelClass} htmlFor="button-gradient-end">Gradient end</label><div className="flex gap-2"><input aria-label="Gradient end color" id="button-gradient-end" type="color" value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} className="h-10 w-12 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/><input aria-label="Gradient end HEX" className={field} value={gradientEnd} onChange={e => setGradientEnd(e.target.value)} /></div></div>}
        <div><label className={labelClass} htmlFor="button-text-color">Text color</label><div className="flex gap-2"><input id="button-text-color" aria-label="Text color" type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="h-10 w-12 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/><input aria-label="Text color HEX" className={field} value={textColor} onChange={e => setTextColor(e.target.value)} /></div></div>
        <div><label className={labelClass} htmlFor="button-border-color">Border color</label><div className="flex gap-2"><input id="button-border-color" aria-label="Border color" type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="h-10 w-12 rounded border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950"/><input aria-label="Border color HEX" className={field} value={borderColor} onChange={e => setBorderColor(e.target.value)} /></div></div>
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {([{label:"Border width",value:borderWidth,min:0,max:8,unit:"px",set:setBorderWidth},{label:"Corner radius",value:radius,min:0,max:40,unit:"px",set:setRadius},{label:"Font size",value:fontSize,min:10,max:32,unit:"px",set:setFontSize},{label:"Vertical padding",value:paddingY,min:4,max:28,unit:"px",set:setPaddingY},{label:"Horizontal padding",value:paddingX,min:8,max:56,unit:"px",set:setPaddingX},{label:"Hover scale",value:hoverScale,min:1,max:1.1,unit:"×",set:setHoverScale},{label:"Hover brightness",value:hoverBrightness,min:0.5,max:1.2,unit:"",set:setHoverBrightness}] as const).map(item => <div key={item.label}><label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-200"><span>{item.label}</span><span className="font-mono text-violet-600 dark:text-violet-300">{item.value}{item.unit}</span></label><input aria-label={item.label} className={`mt-3 ${rangeClass}`} type="range" min={item.min} max={item.max} step={item.label === "Hover scale" || item.label === "Hover brightness" ? 0.01 : 1} value={item.value} onChange={e => { item.set(Number(e.target.value)); setCopied(false); }} /></div>)}
      </div>
    </section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Live preview</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Hover over the button to test its hover effect.</p>
      <div className="mt-4 flex min-h-48 flex-wrap items-center justify-center gap-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 dark:border-slate-700 dark:bg-slate-950">
        <button type="button" className="custom-button-preview focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" style={{display:"inline-block",padding:`${paddingY}px ${paddingX}px`,border:`${borderWidth}px solid ${borderColor}`,borderRadius:radius,background:normalBackground,color:textColor,fontSize,lineHeight:1.4,fontWeight:600,cursor:"pointer",transition:"transform 180ms ease, filter 180ms ease, box-shadow 180ms ease",}} onMouseEnter={e=>{e.currentTarget.style.filter=`brightness(${hoverBrightness})`;e.currentTarget.style.transform=`scale(${hoverScale})`;e.currentTarget.style.boxShadow="0 8px 20px rgb(0 0 0 / 16%)";}} onMouseLeave={e=>{e.currentTarget.style.filter="none";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>{label || "Button"}</button>
        <span className="text-xs text-slate-500 dark:text-slate-400">Hover to preview</span>
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold text-slate-900 dark:text-white">Generated CSS</h3><button type="button" onClick={()=>void copyCss()} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">{copied?<Check size={16}/>:<Copy size={16}/>} {copied?"Copied CSS":"Copy CSS"}</button></div>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm leading-6 text-emerald-300"><code>{css}</code></pre>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Paste the CSS into your stylesheet and use <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">className=&quot;custom-button&quot;</code> (or <code>class=&quot;custom-button&quot;</code> in HTML). Hover and focus states are included.</p>
    </section>
    <p className="text-xs text-slate-500 dark:text-slate-400">All controls, preview rendering, and CSS generation run locally in your browser.</p>
  </div>;
}
