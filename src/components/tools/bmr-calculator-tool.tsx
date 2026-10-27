"use client";

import { useMemo, useState } from "react";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(value));
}

export default function BmrCalculatorTool() {
  const [age, setAge] = useState("25");
  const [equation, setEquation] = useState<"male" | "female">("male");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("70");

  const result = useMemo(() => {
    const a = Number(age);
    const h = Number(height);
    const w = Number(weight);
    const valid = age.trim() !== "" && height.trim() !== "" && weight.trim() !== ""
      && Number.isFinite(a) && Number.isFinite(h) && Number.isFinite(w)
      && Number.isInteger(a) && a >= 18 && a <= 100
      && h >= 100 && h <= 250 && w >= 30 && w <= 300;
    if (!valid) return null;
    const bmr = 10 * w + 6.25 * h - 5 * a + (equation === "male" ? 5 : -161);
    return { bmr, sedentary: bmr * 1.2, light: bmr * 1.375, moderate: bmr * 1.55 };
  }, [age, equation, height, weight]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Age (18–100 years)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="18" max="100" step="1" value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Equation
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={equation} onChange={(e) => setEquation(e.target.value as "male" | "female")}>
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
      </section>
      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter valid values: age 18–100 years, height 100–250 cm, and weight 30–300 kg. Age must be a whole number.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Estimated Basal Metabolic Rate (BMR)</p>
            <p className="mt-2 text-3xl font-semibold">{formatNumber(result.bmr)} kcal/day</p>
            <p className="mt-2 text-sm text-muted-foreground">An estimate of energy your body uses at rest to support essential functions.</p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold">Illustrative daily energy estimates</h3>
            <p className="mt-1 text-sm text-muted-foreground">These are BMR multiplied by common activity factors (TDEE estimates), not BMR itself.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Sedentary (×1.20)</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.sedentary)} kcal/day</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Light activity (×1.375)</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.light)} kcal/day</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm">Moderate activity (×1.55)</p><p className="mt-1 text-xl font-semibold">{formatNumber(result.moderate)} kcal/day</p></div>
            </div>
          </section>
        </>
      )}
      <section className="rounded-xl border border-border p-4 text-sm text-muted-foreground space-y-2">
        <p><strong className="text-foreground">Formula:</strong> Mifflin–St Jeor. Male equation: 10 × weight (kg) + 6.25 × height (cm) − 5 × age + 5. Female equation: 10 × weight (kg) + 6.25 × height (cm) − 5 × age − 161.</p>
        <p><strong className="text-foreground">Important:</strong> BMR equations provide estimates and may not match an individual’s actual energy expenditure. This tool is intended for adults and is not medical advice. It does not account for pregnancy, breastfeeding, health conditions, or medications. Ask a qualified clinician or registered dietitian for individual guidance.</p>
      </section>
    </div>
  );
}
