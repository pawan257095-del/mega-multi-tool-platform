"use client";

import { useState } from "react";
import { ArrowLeftRight, Check, Copy, Download, FileCode2, RotateCcw, WandSparkles } from "lucide-react";

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-mono text-sm leading-6 text-slate-900 outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-violet-950";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50";
const sampleXml = `<person id="42">\n  <name>Pawan</name>\n  <active>true</active>\n  <skills>\n    <skill>JavaScript</skill>\n    <skill>Python</skill>\n  </skills>\n</person>`;
const sampleJson = `{
  "person": {
    "@attributes": { "id": "42" },
    "name": "Pawan",
    "active": "true",
    "skills": { "skill": ["JavaScript", "Python"] }
  }
}`;

type Direction = "xml-to-json" | "json-to-xml";
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function xmlElementToValue(element: Element): JsonValue {
  const result: Record<string, JsonValue> = {};
  if (element.attributes.length) {
    const attrs: Record<string, JsonValue> = {};
    for (const attr of Array.from(element.attributes)) attrs[attr.name] = attr.value;
    result["@attributes"] = attrs;
  }
  const children = Array.from(element.children);
  for (const child of children) {
    const value = xmlElementToValue(child);
    if (Object.prototype.hasOwnProperty.call(result, child.tagName)) {
      const current = result[child.tagName];
      result[child.tagName] = Array.isArray(current) ? [...current, value] : [current, value];
    } else result[child.tagName] = value;
  }
  const text = Array.from(element.childNodes).filter(node => node.nodeType === Node.TEXT_NODE || node.nodeType === Node.CDATA_SECTION_NODE).map(node => node.nodeValue ?? "").join("").trim();
  if (text) {
    if (Object.keys(result).length) result["#text"] = text;
    else return text;
  }
  return Object.keys(result).length ? result : "";
}

function parseXml(source: string): Document {
  const doc = new DOMParser().parseFromString(source, "application/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error(parseError.textContent?.replace(/\s+/g, " ").trim() || "Invalid XML syntax.");
  if (!doc.documentElement || doc.documentElement.tagName === "parsererror") throw new Error("The XML document has no valid root element.");
  return doc;
}

function isObject(value: JsonValue): value is { [key: string]: JsonValue } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function appendXmlValue(doc: XMLDocument, parent: Element, name: string, value: JsonValue) {
  if (!/^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(name) || name.toLowerCase().startsWith("xml")) throw new Error(`Invalid XML element name: ${name}`);
  if (Array.isArray(value)) { value.forEach(item => appendXmlValue(doc, parent, name, item)); return; }
  const element = doc.createElement(name);
  parent.appendChild(element);
  if (isObject(value)) {
    const attrs = value["@attributes"];
    if (attrs !== undefined) {
      if (!isObject(attrs)) throw new Error(`"@attributes" for <${name}> must be a JSON object.`);
      for (const [key, attrValue] of Object.entries(attrs)) {
        if (!/^[A-Za-z_][A-Za-z0-9_.:-]*$/.test(key) || key.toLowerCase().startsWith("xml")) throw new Error(`Invalid XML attribute name: ${key}`);
        if (attrValue !== null && typeof attrValue === "object") throw new Error(`XML attribute "${key}" must have a scalar value.`);
        element.setAttribute(key, attrValue === null ? "" : String(attrValue));
      }
    }
    for (const [childName, childValue] of Object.entries(value)) {
      if (childName === "@attributes") continue;
      if (childName === "#text") {
        if (childValue !== null && typeof childValue === "object") throw new Error(`"#text" inside <${name}> must be a scalar value.`);
        element.appendChild(doc.createTextNode(childValue === null ? "" : String(childValue)));
      } else appendXmlValue(doc, element, childName, childValue);
    }
  } else if (value !== null) element.appendChild(doc.createTextNode(String(value)));
}

function jsonToXml(value: JsonValue, rootName: string): string {
  if (!isObject(value) || Object.keys(value).length !== 1 || !Object.prototype.hasOwnProperty.call(value, rootName)) {
    throw new Error(`JSON must contain one root property named "${rootName}". Example: {"${rootName}": {"item": "value"}}`);
  }
  const doc = document.implementation.createDocument(null, "temporary", null);
  doc.removeChild(doc.documentElement);
  appendXmlValue(doc, doc as unknown as Element, rootName, value[rootName]);
  return new XMLSerializer().serializeToString(doc);
}

export default function XmlJsonConverterTool() {
  const [direction, setDirection] = useState<Direction>("xml-to-json");
  const [source, setSource] = useState(sampleXml);
  const [rootName, setRootName] = useState("person");
  const [output, setOutput] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [pretty, setPretty] = useState(true);

  function convert() {
    if (!source.trim()) { setOutput(""); setMessage("Paste XML or JSON first."); return; }
    try {
      let result = "";
      if (direction === "xml-to-json") {
        const doc = parseXml(source);
        const value: Record<string, JsonValue> = { [doc.documentElement.tagName]: xmlElementToValue(doc.documentElement) };
        result = JSON.stringify(value, null, pretty ? 2 : undefined);
        setMessage("XML parsed and converted to JSON successfully.");
      } else {
        let value: JsonValue;
        try { value = JSON.parse(source) as JsonValue; }
        catch (error) { throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : "Could not parse input."}`); }
        result = jsonToXml(value, rootName.trim() || "root");
        if (pretty) {
          const doc = parseXml(result);
          result = formatXml(doc.documentElement);
        }
        setMessage("JSON parsed and converted to XML successfully.");
      }
      setOutput(result); setCopied(false);
    } catch (error) {
      setOutput(""); setMessage(error instanceof Error ? error.message : "Conversion failed. Check your input."); setCopied(false);
    }
  }

  function formatXml(root: Element): string {
    const serializer = new XMLSerializer();
    const raw = serializer.serializeToString(root);
    const tokens = raw.replace(/>\s*</g, "><").replace(/></g, ">\n<").split("\n");
    let depth = 0;
    return tokens.map(token => {
      if (/^<\//.test(token)) depth = Math.max(0, depth - 1);
      const line = `${"  ".repeat(depth)}${token}`;
      const name = token.match(/^<([^!?\s/>]+)/)?.[1];
      const hasInlineClose = Boolean(name && token.includes(`</${name}>`));
      const opensElement = /^<[^!?/][^>]*>$/.test(token) && !/\/>$/.test(token) && !hasInlineClose;
      if (opensElement) depth++;
      return line;
    }).join("\n");
  }

  async function copyOutput() {
    if (!output) return;
    try { await navigator.clipboard.writeText(output); setCopied(true); setMessage("Output copied to clipboard."); }
    catch { setMessage("Clipboard access was blocked. Select the output and copy it manually."); }
  }

  function downloadOutput() {
    if (!output) return;
    const isJson = direction === "xml-to-json";
    const url = URL.createObjectURL(new Blob([output], { type: isJson ? "application/json;charset=utf-8" : "application/xml;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = isJson ? "converted.json" : "converted.xml"; anchor.click(); URL.revokeObjectURL(url);
  }

  function switchDirection(next: Direction) {
    setDirection(next); setSource(next === "xml-to-json" ? sampleXml : sampleJson); setOutput(""); setMessage(""); setCopied(false);
  }
  function reset() { setSource(""); setOutput(""); setMessage(""); setCopied(false); }

  return <div className="space-y-6">
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Conversion direction">
        <button type="button" onClick={() => switchDirection("xml-to-json")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${direction === "xml-to-json" ? "bg-violet-600 text-white" : buttonClass}`}>XML → JSON</button>
        <button type="button" onClick={() => switchDirection("json-to-xml")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${direction === "json-to-xml" ? "bg-violet-600 text-white" : buttonClass}`}>JSON → XML</button>
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={pretty} onChange={e => setPretty(e.target.checked)} className="accent-violet-600"/> Pretty output</label>
      </div>
      {direction === "json-to-xml" && <div className="mt-4 max-w-sm"><label htmlFor="xml-root-name" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">Root element name</label><input id="xml-root-name" value={rootName} onChange={e => setRootName(e.target.value)} className={inputClass} placeholder="root"/><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Your JSON must contain this property as its single root key. XML attributes use the special key @attributes; mixed text uses #text.</p></div>}
    </section>
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Input {direction === "xml-to-json" ? "XML" : "JSON"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Paste your source document below.</p></div><button type="button" className={buttonClass} onClick={() => { setSource(direction === "xml-to-json" ? sampleXml : sampleJson); setOutput(""); setMessage(""); }}><WandSparkles size={15}/> Load sample</button></div>
        <label htmlFor="xml-json-input" className="mb-2 mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Source</label><textarea id="xml-json-input" value={source} onChange={e => { setSource(e.target.value); setOutput(""); setMessage(""); setCopied(false); }} spellCheck={false} rows={18} className={`${inputClass} resize-y`} placeholder={direction === "xml-to-json" ? "Paste XML here…" : "Paste JSON here…"}/>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{source.length.toLocaleString()} characters · {source ? source.split("\n").length : 0} lines</p>
        <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={convert} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700"><ArrowLeftRight size={16}/> Convert</button><button type="button" onClick={reset} className={buttonClass}><RotateCcw size={15}/> Reset</button></div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900 dark:text-white">Output {direction === "xml-to-json" ? "JSON" : "XML"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your converted document appears here.</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${output ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{output ? "Converted" : "No output yet"}</span></div>
        <label htmlFor="xml-json-output" className="mb-2 mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200">Result</label><textarea id="xml-json-output" value={output} onChange={e => setOutput(e.target.value)} spellCheck={false} rows={18} className={`${inputClass} resize-y`} placeholder="Converted output will appear here…"/>
        <div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={copyOutput} disabled={!output} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check size={16}/> : <Copy size={16}/>} {copied ? "Copied" : "Copy output"}</button><button type="button" onClick={downloadOutput} disabled={!output} className={buttonClass}><Download size={16}/> Download .{direction === "xml-to-json" ? "json" : "xml"}</button><button type="button" onClick={() => { setSource(output); setOutput(""); setDirection(direction === "xml-to-json" ? "json-to-xml" : "xml-to-json"); setMessage("Output moved to input and conversion direction switched."); setCopied(false); }} disabled={!output} className={buttonClass}><FileCode2 size={15}/> Use as opposite input</button></div>
        {message && <p className="mt-4 break-words rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300" role="status">{message}</p>}
      </section>
    </div>
    <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">Privacy and conversion notes: conversion runs locally in your browser. Repeated XML child tags become JSON arrays. Attributes are represented by <code>@attributes</code>, and mixed text by <code>#text</code>. XML-to-JSON cannot preserve every XML-specific distinction (such as namespaces or comments) in a universal way.</p>
  </div>;
}
