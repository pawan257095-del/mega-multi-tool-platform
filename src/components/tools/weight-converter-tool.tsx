"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Copy, Check, RotateCcw } from "lucide-react";

type Unit={id:string;label:string;factor:number};
const units:Unit[]=[
 {id:"mg",label:"Milligram (mg)",factor:0.000001},
 {id:"g",label:"Gram (g)",factor:0.001},
 {id:"kg",label:"Kilogram (kg)",factor:1},
 {id:"t",label:"Metric tonne (t)",factor:1000},
 {id:"oz",label:"Ounce (oz)",factor:0.028349523125},
 {id:"lb",label:"Pound (lb)",factor:0.45359237},
 {id:"st",label:"Stone (st)",factor:6.35029318},
 {id:"us-ton",label:"US short ton",factor:907.18474},
 {id:"uk-ton",label:"UK long ton",factor:1016.0469088},
 {id:"mcg",label:"Microgram (µg)",factor:0.000000001},
 {id:"ct",label:"Carat (ct)",factor:0.0002},
 {id:"grain",label:"Grain (gr)",factor:0.00006479891},
];
const inputClass="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
export default function WeightConverterTool(){
 const [amount,setAmount]=useState("1");const [from,setFrom]=useState("kg");const [to,setTo]=useState("lb");const [copied,setCopied]=useState(false);
 const result=useMemo(()=>{if(amount.trim()==="")return null;const n=Number(amount),a=units.find(u=>u.id===from),b=units.find(u=>u.id===to);if(!Number.isFinite(n)||!a||!b)return null;return n*a.factor/b.factor;},[amount,from,to]);
 const format=(n:number)=>new Intl.NumberFormat(undefined,{maximumSignificantDigits:12}).format(n);
 async function copy(){if(result===null)return;try{await navigator.clipboard.writeText(`${amount} ${units.find(u=>u.id===from)?.label} = ${format(result)} ${units.find(u=>u.id===to)?.label}`);setCopied(true);setTimeout(()=>setCopied(false),1500);}catch{setCopied(false);}}
 function reset(){setAmount("1");setFrom("kg");setTo("lb");setCopied(false);}
 return <div className="space-y-5">
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">Value<input className={`${inputClass} mt-2 text-lg`} type="number" step="any" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter a weight or mass"/></label><div className="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]"><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">From<select className={`${inputClass} mt-2`} value={from} onChange={e=>setFrom(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label><button type="button" onClick={()=>{setFrom(to);setTo(from);}} aria-label="Swap units" className="flex h-12 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"><ArrowDownUp size={18}/></button><label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">To<select className={`${inputClass} mt-2`} value={to} onChange={e=>setTo(e.target.value)}>{units.map(u=><option key={u.id} value={u.id}>{u.label}</option>)}</select></label></div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>void copy()} disabled={result===null} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied":"Copy result"}</button><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200"><RotateCcw size={15}/> Reset</button></div></section>
  <section aria-live="polite" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6"><p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Converted result</p><p className="mt-2 break-words text-3xl font-bold text-emerald-950 dark:text-emerald-100">{result===null?"Enter a valid number":`${format(result)} ${to}`}</p>{result!==null&&<p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">{format(Number(amount))} {units.find(u=>u.id===from)?.label} = {format(result)} {units.find(u=>u.id===to)?.label}</p>}</section>
  <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold text-slate-900 dark:text-white">Common conversions</h2><div className="mt-3 grid gap-2 sm:grid-cols-2">{[["1 kg","1000 g"],["1 kg","2.20462 lb"],["1 lb","16 oz"],["1 oz","28.3495 g"],["1 stone","6.35029 kg"],["1 metric tonne","1000 kg"]].map(([a,b])=><div key={a} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-950 dark:text-slate-200">{a} = {b}</div>)}</div></section>
 </div>;
}
