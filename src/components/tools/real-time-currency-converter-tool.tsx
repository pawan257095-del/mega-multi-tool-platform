
"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownUp, RefreshCw, AlertCircle } from "lucide-react";

type Rates = { amount?: number; base: string; date: string; rates: Record<string, number> };
const CACHE_PREFIX = "toolbox:currency-rates:v1:";
const currencies = ["USD","EUR","GBP","INR","JPY","CAD","AUD","CHF","CNY","SGD","NZD","AED","SAR","PKR","BDT","LKR","NPR","THB","KRW","HKD","ZAR","BRL","MXN","IDR","MYR","TRY","SEK","NOK","DKK","PLN","CZK","HUF"];
const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

export default function RealTimeCurrencyConverterTool() {
 const [amount,setAmount]=useState("1"); const [from,setFrom]=useState("USD"); const [to,setTo]=useState("INR"); const [rates,setRates]=useState<Rates|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [updated,setUpdated]=useState("");

 const loadRates = useCallback(async (base = from) => {
  setLoading(true);setError("");
  const cacheKey=`${CACHE_PREFIX}${base}`;
  try {
   // The current Frankfurter API uses /v1/latest?base=... (not the legacy .app endpoint).
   const response=await fetch(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(base)}`,{headers:{Accept:"application/json"},cache:"no-store"});
   if(!response.ok) throw new Error(`Exchange-rate service returned HTTP ${response.status}.`);
   const raw=await response.json() as Rates;
   if(!raw || raw.base!==base || !raw.date || !raw.rates || typeof raw.rates!=="object") throw new Error("The exchange-rate service returned an unexpected response.");
   const data:Rates={...raw,amount:1};
   setRates(data);setUpdated(data.date);
   try{localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),data}));}catch{}
  } catch(e) {
   // Use only previously fetched real rates; never fabricate fallback values.
   let cached: {savedAt:number;data:Rates}|null=null;
   try{const raw=localStorage.getItem(cacheKey);if(raw)cached=JSON.parse(raw);}catch{}
   if(cached?.data?.base===base&&cached.data.rates&&cached.data.date){
    setRates(cached.data);setUpdated(cached.data.date);
    const ageHours=Math.max(0,Math.round((Date.now()-cached.savedAt)/3600000));
    setError(`Could not refresh rates (${e instanceof Error?e.message:"network error"}). Showing previously saved rates from ${cached.data.date}${ageHours>0?`; cache age about ${ageHours} hour(s)`:""}.`);
   } else {
    setRates(null);setUpdated("");
    setError(`${e instanceof Error?e.message:"Could not load exchange rates. Check your internet connection and try again."} Open https://api.frankfurter.dev/v1/latest?base=${base} to test the provider. If that page loads but this tool fails, check the browser console for a CORS or network error.`);
   }
  } finally {setLoading(false);}
 }, [from]);

 useEffect(() => {
  const timer = window.setTimeout(() => {
   void loadRates(from);
  }, 0);

  return () => window.clearTimeout(timer);
 }, [from, loadRates]);

 const numeric=Number(amount); const rate=from===to?1:(rates?.base===from?rates?.rates[to]:undefined); const converted=Number.isFinite(numeric)&&amount.trim()!==""&&numeric>=0&&rate!==undefined?numeric*rate:null;
 const money=(n:number,c:string)=>new Intl.NumberFormat(undefined,{style:"currency",currency:c,maximumFractionDigits:4}).format(n);

 return <div className="space-y-5"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Amount<input className={`${field} mt-2`} type="number" min="0" step="any" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label><div className="hidden sm:block"/></div><div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]"><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">From currency<select className={`${field} mt-2`} value={from} onChange={e=>setFrom(e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label><button type="button" onClick={()=>{setFrom(to);setTo(from);}} aria-label="Swap currencies" className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"><ArrowDownUp size={18}/></button><label className="text-sm font-semibold text-slate-700 dark:text-slate-200">To currency<select className={`${field} mt-2`} value={to} onChange={e=>setTo(e.target.value)}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label></div><div className="mt-5 flex flex-wrap gap-2"><button onClick={()=>void loadRates(from)} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><RefreshCw size={15} className={loading?"animate-spin":""}/>{loading?"Loading rates…":"Refresh exchange rates"}</button><button onClick={()=>{setAmount("1");setFrom("USD");setTo("INR");}} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Reset</button></div></section>{error&&<div role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200"><AlertCircle size={18} className="shrink-0"/>{error} This converter uses a public third-party rate service and requires internet access.</div>}<section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6"><p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Converted amount</p><p className="mt-2 break-words text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100">{converted===null?"—":money(converted,to)}</p>{rate!==undefined&&<p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">1 {from} = {rate.toLocaleString(undefined,{maximumFractionDigits:8})} {to}</p>}{updated&&<p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">Rate reference date: {updated}</p>}</section><p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Rates are reference rates, not guaranteed bank, card, or cash-exchange rates. Fees and spreads may apply. The rate provider determines update frequency; “real-time” does not mean live trading quotes.</p></div>;
}
