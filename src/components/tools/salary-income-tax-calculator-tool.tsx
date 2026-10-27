"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Copy, Check, Info } from "lucide-react";

type Regime = "new" | "old";
const inputClass="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const inr=(v:number)=>new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0}).format(Math.max(0,v));
function slabTax(taxable:number, slabs:Array<[number,number]>){let remaining=taxable,prev=0,tax=0;for(const [limit,rate] of slabs){const amount=Math.max(0,Math.min(remaining,limit-prev));tax+=amount*rate/100;remaining-=amount;prev=limit;if(remaining<=0)break;}if(remaining>0){const rate=slabs[slabs.length-1][1];tax+=remaining*rate/100;}return tax;}
export default function SalaryIncomeTaxCalculatorTool(){
 const [salary,setSalary]=useState("1200000");
 const [otherIncome,setOtherIncome]=useState("0");
 const [deductions,setDeductions]=useState("150000");
 const [regime,setRegime]=useState<Regime>("new");
 const [age,setAge]=useState("below60");
 const [copied,setCopied]=useState(false);
 const values=useMemo(()=>{
  const gross=Math.max(0,Number(salary)||0),other=Math.max(0,Number(otherIncome)||0),deduct=Math.max(0,Number(deductions)||0),total=gross+other;
  // Illustrative India FY 2025-26 slabs. Verify against current official rules before filing.
  const standardDeduction=75000;
  const taxableNew=Math.max(0,total-standardDeduction);
  const newSlabs:Array<[number,number]>=[[400000,0],[800000,5],[1200000,10],[1600000,15],[2000000,20],[2400000,25],[Infinity,30]];
  let newTax=slabTax(taxableNew,newSlabs);
  // Rebate illustration: full rebate up to ₹12 lakh taxable income, with marginal relief omitted.
  if(taxableNew<=1200000)newTax=0;
  const taxableOld=Math.max(0,total-50000-deduct);
  let oldSlabs:Array<[number,number]>;
  if(age==="below60")oldSlabs=[[250000,0],[500000,5],[1000000,20],[Infinity,30]];
  else if(age==="60to79")oldSlabs=[[300000,0],[500000,5],[1000000,20],[Infinity,30]];
  else oldSlabs=[[500000,0],[1000000,20],[Infinity,30]];
  let oldTax=slabTax(taxableOld,oldSlabs);
  if(taxableOld<=500000)oldTax=Math.max(0,oldTax-12500);
  // 4% health and education cess; excludes surcharge.
  newTax*=1.04;oldTax*=1.04;
  const tax=regime==="new"?newTax:oldTax;
  return {gross,other,total,taxable:regime==="new"?taxableNew:taxableOld,tax:Math.round(tax),monthly:Math.round(tax/12),effective:total?tax/total*100:0,newTax:Math.round(newTax),oldTax:Math.round(oldTax),saving:Math.abs(Math.round(newTax)-Math.round(oldTax)),better:newTax<=oldTax?"new":"old"};
 },[salary,otherIncome,deductions,regime,age]);
 function reset(){setSalary("1200000");setOtherIncome("0");setDeductions("150000");setRegime("new");setAge("below60");setCopied(false);}
 async function copy(){const text=`Estimated salary/income tax summary\nGross income: ${inr(values.total)}\nRegime: ${regime==="new"?"New tax regime":"Old tax regime"}\nEstimated taxable income: ${inr(values.taxable)}\nEstimated annual tax incl. 4% cess: ${inr(values.tax)}\nAverage monthly tax: ${inr(values.monthly)}\nEffective rate: ${values.effective.toFixed(2)}%\nIllustrative only; verify official rules.`;try{await navigator.clipboard.writeText(text);setCopied(true);}catch{setCopied(false);}}
 return <div className="space-y-5">
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Income details (India)</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Enter annual amounts in Indian rupees.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Annual salary / income (₹)<input className={`${inputClass} mt-1.5`} type="number" min="0" value={salary} onChange={e=>setSalary(e.target.value)}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Other taxable income (₹)<input className={`${inputClass} mt-1.5`} type="number" min="0" value={otherIncome} onChange={e=>setOtherIncome(e.target.value)}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Eligible deductions for old regime (₹)<input className={`${inputClass} mt-1.5`} type="number" min="0" value={deductions} onChange={e=>setDeductions(e.target.value)}/></label><label className="text-sm font-medium text-slate-700 dark:text-slate-200">Age group (old regime slabs)<select className={`${inputClass} mt-1.5`} value={age} onChange={e=>setAge(e.target.value)}><option value="below60">Below 60 years</option><option value="60to79">60–79 years</option><option value="80plus">80 years or above</option></select></label></div><div className="mt-5"><p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">Tax regime</p><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={()=>setRegime("new")} className={`rounded-xl border p-4 text-left ${regime==="new"?"border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30":"border-slate-200 dark:border-slate-700"}`}><span className="font-semibold">New regime</span><span className="mt-1 block text-xs text-slate-500">Illustrative FY 2025–26 slabs</span></button><button type="button" onClick={()=>setRegime("old")} className={`rounded-xl border p-4 text-left ${regime==="old"?"border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30":"border-slate-200 dark:border-slate-700"}`}><span className="font-semibold">Old regime</span><span className="mt-1 block text-xs text-slate-500">Deductions entered above are subtracted</span></button></div></div></section>
  <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Estimated annual tax (including cess)</p><p className="mt-2 text-3xl font-bold text-emerald-950 dark:text-emerald-100">{inr(values.tax)}</p><p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">Average monthly amount: {inr(values.monthly)}</p></div><button type="button" onClick={()=>void copy()} className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:text-emerald-100">{copied?<Check size={15}/>:<Copy size={15}/>} {copied?"Copied":"Copy summary"}</button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/60"><p className="text-xs text-slate-500">Taxable income</p><p className="mt-1 font-semibold">{inr(values.taxable)}</p></div><div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/60"><p className="text-xs text-slate-500">Effective tax rate</p><p className="mt-1 font-semibold">{values.effective.toFixed(2)}%</p></div><div className="rounded-xl bg-white/70 p-3 dark:bg-slate-900/60"><p className="text-xs text-slate-500">Compared regime estimate</p><p className="mt-1 font-semibold">{inr(values.saving)} difference</p><p className="text-xs text-slate-500">Lower estimate: {values.better==="new"?"New":"Old"} regime</p></div></div><button type="button" onClick={reset} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-900 dark:border-emerald-800 dark:text-emerald-100"><RotateCcw size={15}/> Reset</button></section>
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><div className="flex gap-2"><Info size={18} className="shrink-0"/><p><strong>Important:</strong> This is a simplified illustrative estimate for India, using assumed FY 2025–26 slabs. It does not fully model surcharge, marginal relief, capital gains, special income, rebates in every situation, or all deduction eligibility. Rules may change; verify current official Income Tax Department guidance before making tax or filing decisions.</p></div></div>
 </div>;
}
