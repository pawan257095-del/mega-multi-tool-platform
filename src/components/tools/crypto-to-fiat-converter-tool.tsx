"use client";

import { useState } from "react";
import { RefreshCw, ArrowDownUp, AlertCircle, ExternalLink } from "lucide-react";

type Coin = { id: string; name: string; symbol: string };
const coins: Coin[] = [
 { id: "bitcoin", name: "Bitcoin", symbol: "BTC" },
 { id: "ethereum", name: "Ethereum", symbol: "ETH" },
 { id: "tether", name: "Tether", symbol: "USDT" },
 { id: "binancecoin", name: "BNB", symbol: "BNB" },
 { id: "solana", name: "Solana", symbol: "SOL" },
 { id: "ripple", name: "XRP", symbol: "XRP" },
 { id: "usd-coin", name: "USDC", symbol: "USDC" },
 { id: "dogecoin", name: "Dogecoin", symbol: "DOGE" },
 { id: "cardano", name: "Cardano", symbol: "ADA" },
 { id: "tron", name: "TRON", symbol: "TRX" },
 { id: "the-open-network", name: "Toncoin", symbol: "TON" },
 { id: "avalanche-2", name: "Avalanche", symbol: "AVAX" },
];
const fiats = ["usd","inr","eur","gbp","jpy","cad","aud","sgd","aed","sar","pkr","bdt","npr","lkr","cny","hkd","chf","brl","mxn","zar"];
const cacheKey = "toolbox:crypto-fiat:v1";
const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
type PriceResponse = Record<string, Record<string, number>>;
export default function CryptoToFiatConverterTool() {
 const [amount,setAmount]=useState("1");
 const [coinId,setCoinId]=useState("bitcoin");
 const [fiat,setFiat]=useState("inr");
 const [prices,setPrices]=useState<PriceResponse|null>(null);
 const [updated,setUpdated]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [cached,setCached]=useState(false);
 async function loadPrice(id=coinId,currency=fiat) {
  setLoading(true); setError(""); setCached(false);
  try {
   const url=`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(currency)}`;
   const response=await fetch(url,{headers:{Accept:"application/json"},cache:"no-store"});
   if(!response.ok) throw new Error(`Price provider returned HTTP ${response.status}.`);
   const data=await response.json() as PriceResponse;
   if(typeof data?.[id]?.[currency]!=="number" || !Number.isFinite(data[id][currency])) throw new Error("The provider did not return a price for this selection.");
   setPrices(data);setUpdated(new Date().toISOString());
   try{localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),id,currency,data}));}catch{}
  } catch (e) {
   try {
    const raw=localStorage.getItem(cacheKey);
    const saved=raw?JSON.parse(raw):null;
    if(saved?.id===id&&saved?.currency===currency&&typeof saved?.data?.[id]?.[currency]==="number"){
     setPrices(saved.data);setUpdated(new Date(saved.savedAt).toISOString());setCached(true);
     setError(`Live price refresh failed (${e instanceof Error?e.message:"network error"}). Showing a previously saved price; it may be stale.`);
    } else {setPrices(null);setError(`${e instanceof Error?e.message:"Unable to fetch cryptocurrency prices."} Check your connection or provider rate limits, then retry.`);}
   } catch {setPrices(null);setError("Unable to fetch cryptocurrency prices. Check your connection or provider rate limits, then retry.");}
  } finally {setLoading(false);}
 }
 const selected=coins.find(c=>c.id===coinId)!;
 const value=Number(amount);
 const price=prices?.[coinId]?.[fiat];
 const converted=amount.trim()!==""&&Number.isFinite(value)&&value>=0&&typeof price==="number"?value*price:null;
 const format=(n:number,currency:string)=>new Intl.NumberFormat(undefined,{style:"currency",currency:currency.toUpperCase(),maximumFractionDigits: currency==="jpy"?0: currency==="inr"?4:6}).format(n);
 return <div className="space-y-5">
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
   <div className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Crypto amount<input className={`${field} mt-2`} type="number" min="0" step="any" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="Enter amount"/></label>
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Cryptocurrency<select className={`${field} mt-2`} value={coinId} onChange={e=>setCoinId(e.target.value)}>{coins.map(c=><option key={c.id} value={c.id}>{c.name} ({c.symbol})</option>)}</select></label>
   </div>
   <div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"><p className="text-xs font-medium text-slate-500 dark:text-slate-400">You convert</p><p className="mt-1 font-semibold text-slate-900 dark:text-white">{amount||"0"} {selected.symbol}</p></div>
    <button type="button" aria-label="Swap to a different cryptocurrency" onClick={()=>{const index=coins.findIndex(c=>c.id===coinId);setCoinId(coins[(index+1)%coins.length].id);}} className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"><ArrowDownUp size={18}/></button>
    <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Fiat currency<select className={`${field} mt-2`} value={fiat} onChange={e=>setFiat(e.target.value)}>{fiats.map(c=><option key={c} value={c}>{c.toUpperCase()}</option>)}</select></label>
   </div>
   <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>void loadPrice()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"><RefreshCw size={15} className={loading?"animate-spin":""}/>{loading?"Fetching price…":"Refresh crypto price"}</button><button type="button" onClick={()=>{setAmount("1");setCoinId("bitcoin");setFiat("inr");setPrices(null);setUpdated("");setError("");setCached(false);}} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">Reset</button></div>
  </section>
  {error&&<div role="alert" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><AlertCircle size={18} className="shrink-0"/><span>{error}</span></div>}
  <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30 sm:p-6"><p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Estimated fiat value</p><p className="mt-2 break-words text-3xl font-bold tracking-tight text-emerald-950 dark:text-emerald-100">{converted===null?"—":format(converted,fiat)}</p>{typeof price==="number"&&<p className="mt-2 text-sm text-emerald-800 dark:text-emerald-300">1 {selected.symbol} = {format(price,fiat)}</p>}{updated&&<p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400">{cached?"Cached price timestamp":"Price fetched at"}: {new Date(updated).toLocaleString()}</p>}</section>
  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"><strong>Important:</strong> Cryptocurrency prices are volatile and may be delayed, cached, or unavailable due to public API limits. This is an informational estimate, not an exchange quote or financial advice. Trading fees, spreads, and taxes are excluded. <a className="inline-flex items-center gap-1 underline" href="https://www.coingecko.com/" target="_blank" rel="noreferrer">Price data provider <ExternalLink size={12}/></a></div>
 </div>;
}
