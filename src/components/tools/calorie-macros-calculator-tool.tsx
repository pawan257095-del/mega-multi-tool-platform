"use client";

import { useMemo, useState } from "react";

type MacroPreset = "balanced" | "high-protein" | "endurance";
type Goal = "maintain" | "lose" | "gain";
type Activity = "1.2" | "1.375" | "1.55" | "1.725" | "1.9";

const activityOptions: { value: Activity; label: string }[] = [
  { value: "1.2", label: "Sedentary — little or no planned exercise" },
  { value: "1.375", label: "Light — light exercise 1–3 days/week" },
  { value: "1.55", label: "Moderate — exercise 3–5 days/week" },
  { value: "1.725", label: "Very active — hard exercise 6–7 days/week" },
  { value: "1.9", label: "Extra active — very hard training / physical work" },
];

const presets: Record<MacroPreset, { label: string; protein: number; carbs: number; fat: number }> = {
  balanced: { label: "Balanced (30% protein / 40% carbs / 30% fat)", protein: 30, carbs: 40, fat: 30 },
  "high-protein": { label: "Higher protein (35% / 35% / 30%)", protein: 35, carbs: 35, fat: 30 },
  endurance: { label: "Carbohydrate-focused (25% / 50% / 25%)", protein: 25, carbs: 50, fat: 25 },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export default function CalorieMacrosCalculatorTool() {
  const [age, setAge] = useState("25");
  const [formula, setFormula] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<Activity>("1.55");
  const [goal, setGoal] = useState<Goal>("maintain");
  const [preset, setPreset] = useState<MacroPreset>("balanced");

  const result = useMemo(() => {
    const a = Number(age);
    const h = Number(height);
    const w = Number(weight);
    const valid = Number.isFinite(a) && Number.isFinite(h) && Number.isFinite(w)
      && a >= 18 && a <= 100 && h >= 100 && h <= 250 && w >= 30 && w <= 300;
    if (!valid) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + (formula === "male" ? 5 : -161);
    const tdee = bmr * Number(activity);
    const calories = Math.max(0, tdee + (goal === "lose" ? -400 : goal === "gain" ? 300 : 0));
    const split = presets[preset];
    return {
      bmr,
      tdee,
      calories,
      protein: (calories * split.protein / 100) / 4,
      carbs: (calories * split.carbs / 100) / 4,
      fat: (calories * split.fat / 100) / 9,
    };
  }, [age, formula, height, weight, activity, goal, preset]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Age (18–100 years)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="18" max="100" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Formula
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={formula} onChange={(e) => setFormula(e.target.value as "male" | "female")}>
            <option value="male">Mifflin–St Jeor (male equation)</option>
            <option value="female">Mifflin–St Jeor (female equation)</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Height (cm)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="100" max="250" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Weight (kg)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="30" max="300" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="block text-sm font-medium md:col-span-2">Activity level
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={activity} onChange={(e) => setActivity(e.target.value as Activity)}>
            {activityOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium">Goal
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
            <option value="maintain">Maintain weight (estimated maintenance)</option>
            <option value="lose">Weight loss (about 400 kcal below estimate)</option>
            <option value="gain">Weight gain (about 300 kcal above estimate)</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Macro distribution
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={preset} onChange={(e) => setPreset(e.target.value as MacroPreset)}>
            {Object.entries(presets).map(([value, item]) => <option key={value} value={value}>{item.label}</option>)}
          </select>
        </label>
      </section>

      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter valid adult values: age 18–100, height 100–250 cm, and weight 30–300 kg.</p>
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated BMR</p><p className="mt-2 text-2xl font-semibold">{formatNumber(result.bmr)} kcal/day</p><p className="mt-1 text-xs text-muted-foreground">Resting energy estimate</p></div>
            <div className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">Estimated maintenance</p><p className="mt-2 text-2xl font-semibold">{formatNumber(result.tdee)} kcal/day</p><p className="mt-1 text-xs text-muted-foreground">BMR × activity factor</p></div>
            <div className="rounded-2xl border border-primary/40 bg-primary/5 p-5"><p className="text-sm text-muted-foreground">Daily goal estimate</p><p className="mt-2 text-2xl font-semibold">{formatNumber(result.calories)} kcal/day</p><p className="mt-1 text-xs text-muted-foreground">Based on selected goal</p></div>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold">Daily macro targets</h3>
            <p className="mt-1 text-sm text-muted-foreground">{presets[preset].protein}% protein · {presets[preset].carbs}% carbohydrates · {presets[preset].fat}% fat</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Protein</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.protein)} g</p><p className="text-xs text-muted-foreground">4 kcal per gram</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Carbohydrates</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.carbs)} g</p><p className="text-xs text-muted-foreground">4 kcal per gram</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Fat</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.fat)} g</p><p className="text-xs text-muted-foreground">9 kcal per gram</p></div>
            </div>
          </section>
        </>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Important:</strong> These are population-level estimates, not a diagnosis or a prescribed diet. Real energy needs can differ substantially. This tool is intended for adults and does not account for pregnancy, breastfeeding, medical conditions, medications, or eating-disorder history. For a personal nutrition plan, consult a qualified clinician or registered dietitian.
      </aside>
    </div>
  );
}
