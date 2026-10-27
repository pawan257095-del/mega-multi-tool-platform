"use client";

import { useMemo, useState } from "react";

type PromptMode = "writing" | "coding" | "research" | "learning" | "business" | "custom";

const modeDetails: Record<PromptMode, { label: string; role: string; steps: string[]; defaultOutput: string }> = {
  writing: {
    label: "Writing & content",
    role: "an experienced writing and content specialist",
    steps: ["Clarify the audience and purpose", "Use the requested tone and format", "Keep claims grounded and avoid inventing facts"],
    defaultOutput: "A polished draft followed by a short list of assumptions, if any.",
  },
  coding: {
    label: "Coding & debugging",
    role: "a senior software engineer and careful debugging partner",
    steps: ["Ask for missing requirements only when essential", "Explain the solution and relevant trade-offs", "Include runnable code and practical tests when appropriate"],
    defaultOutput: "Implementation, setup instructions, and a concise test checklist.",
  },
  research: {
    label: "Research & analysis",
    role: "a rigorous research analyst",
    steps: ["Separate verified facts from assumptions", "Compare credible evidence and note uncertainty", "Cite sources when external research is requested"],
    defaultOutput: "Executive summary, evidence, analysis, limitations, and recommendations.",
  },
  learning: {
    label: "Learning & tutoring",
    role: "a patient expert tutor",
    steps: ["Start from the learner's current level", "Teach concepts in a logical sequence with examples", "Check understanding with practice questions and feedback"],
    defaultOutput: "Step-by-step explanation, worked example, practice questions, and answers.",
  },
  business: {
    label: "Business & strategy",
    role: "a practical business strategist",
    steps: ["Define the target customer and desired outcome", "Make assumptions and constraints explicit", "Prioritize actionable recommendations and measurable next steps"],
    defaultOutput: "Recommendation, rationale, risks, metrics, and a prioritized action plan.",
  },
  custom: {
    label: "Custom task",
    role: "a capable specialist for the task described",
    steps: ["Understand the goal and constraints", "Structure the work into clear steps", "State assumptions and limitations"],
    defaultOutput: "A well-structured answer with actionable next steps.",
  },
};

export default function PromptGeneratorTool() {
  const [task, setTask] = useState("");
  const [mode, setMode] = useState<PromptMode>("coding");
  const [context, setContext] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Clear and practical");
  const [format, setFormat] = useState("Step-by-step guide");
  const [constraints, setConstraints] = useState("");
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeQuestions, setIncludeQuestions] = useState(false);

  const prompt = useMemo(() => {
    const details = modeDetails[mode];
    const lines = [
      `Act as ${details.role}.`,
      "",
      "## Goal",
      task.trim() || "[Describe the specific task and desired outcome]",
      ...(context.trim() ? ["", "## Context", context.trim()] : []),
      ...(audience.trim() ? ["", "## Audience", audience.trim()] : []),
      "",
      "## Instructions",
      ...details.steps.map((step, i) => `${i + 1}. ${step}.`),
      `4. Use a ${tone.toLowerCase()} tone.`,
      `5. Present the result as: ${format}.`,
      ...(includeExamples ? ["6. Include a relevant example or concrete illustration where useful."] : []),
      ...(includeQuestions ? ["7. If essential information is missing, ask concise clarifying questions before proceeding; otherwise state reasonable assumptions and continue."] : ["7. If details are missing, state reasonable assumptions rather than blocking progress."]),
      ...(constraints.trim() ? ["", "## Constraints", constraints.trim()] : []),
      "",
      "## Expected output",
      details.defaultOutput,
      "Be specific, organized, and avoid unsupported claims. Make the final answer directly useful for the stated goal.",
    ];
    return lines.join("\n");
  }, [task, mode, context, audience, tone, format, constraints, includeExamples, includeQuestions]);

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Clipboard access may be denied; prompt remains selectable in the output area.
    }
  }

  const fieldClass = "w-full rounded-xl border border-slate-300 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700";
  const labelClass = "mb-1.5 block text-sm font-medium";

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div>
          <h2 className="text-lg font-semibold">Prompt details</h2>
          <p className="mt-1 text-sm text-slate-500">Fill in what you know. The prompt updates as you edit.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="prompt-mode">Task type</label>
          <select id="prompt-mode" className={fieldClass} value={mode} onChange={(e) => setMode(e.target.value as PromptMode)}>
            {Object.entries(modeDetails).map(([value, details]) => <option key={value} value={value}>{details.label}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="prompt-task">What do you want the AI to do?</label>
          <textarea id="prompt-task" value={task} onChange={(e) => setTask(e.target.value)} placeholder="Example: Build a responsive portfolio website for a junior developer…" className={`${fieldClass} min-h-24 resize-y`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="prompt-context">Background or context (optional)</label>
          <textarea id="prompt-context" value={context} onChange={(e) => setContext(e.target.value)} placeholder="Relevant details, tools, existing work, or situation…" className={`${fieldClass} min-h-20 resize-y`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="prompt-audience">Who is the result for? (optional)</label>
          <input id="prompt-audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="e.g. beginners, customers, engineering team" className={fieldClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="prompt-tone">Tone</label>
            <select id="prompt-tone" value={tone} onChange={(e) => setTone(e.target.value)} className={fieldClass}>
              <option>Clear and practical</option><option>Friendly and conversational</option><option>Formal and professional</option><option>Concise and direct</option><option>Creative and engaging</option><option>Technical and precise</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="prompt-format">Output format</label>
            <select id="prompt-format" value={format} onChange={(e) => setFormat(e.target.value)} className={fieldClass}>
              <option>Step-by-step guide</option><option>Bullet-point summary</option><option>Detailed report</option><option>Table with comparisons</option><option>Code with explanation</option><option>Checklist and action plan</option><option>Email or message draft</option>
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="prompt-constraints">Constraints (optional)</label>
          <textarea id="prompt-constraints" value={constraints} onChange={(e) => setConstraints(e.target.value)} placeholder="Budget, deadline, tech stack, word limit, must/avoid…" className={`${fieldClass} min-h-20 resize-y`} />
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeExamples} onChange={(e) => setIncludeExamples(e.target.checked)} className="size-4 rounded border-slate-300" /> Ask for examples where useful</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeQuestions} onChange={(e) => setIncludeQuestions(e.target.checked)} className="size-4 rounded border-slate-300" /> Ask clarifying questions when essential</label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Generated prompt</h2>
            <p className="mt-1 text-sm text-slate-500">Ready to copy into your preferred AI tool.</p>
          </div>
          <button type="button" onClick={copyPrompt} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Copy prompt</button>
        </div>
        <textarea readOnly value={prompt} aria-label="Generated prompt" className="min-h-[32rem] w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 outline-none dark:border-slate-800 dark:bg-slate-950" />
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => { setTask(""); setContext(""); setAudience(""); setConstraints(""); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">Clear text fields</button>
          <span className="self-center text-xs text-slate-500">{prompt.length} characters</span>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">This tool assembles a structured prompt from your inputs. It does not call an AI service or guarantee a particular response from another model.</p>
      </section>
    </div>
  );
}
