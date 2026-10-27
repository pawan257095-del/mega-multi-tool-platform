"use client";

import { useMemo, useState } from "react";

function formatLitres(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value);
}

export default function WaterIntakeCalculatorTool() {
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState<"low" | "moderate" | "high">("moderate");
  const [climate, setClimate] = useState<"mild" | "hot">("mild");
  const [units, setUnits] = useState<"litres" | "cups">("litres");

  const result = useMemo(() => {
    const w = Number(weight);
    if (weight.trim() === "" || !Number.isFinite(w) || w < 20 || w > 300) return null;
    // Heuristic only: 30 mL/kg baseline, plus modest optional activity/climate allowances.
    const baseline = w * 0.03;
    const activityExtra = activity === "low" ? 0 : activity === "moderate" ? 0.35 : 0.7;
    const climateExtra = climate === "hot" ? 0.4 : 0;
    const litres = baseline + activityExtra + climateExtra;
    return { baseline, litres, cups: litres / 0.24 };
  }, [weight, activity, climate]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Body weight (kg)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="20" max="300" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Typical activity level
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={activity} onChange={(e) => setActivity(e.target.value as "low" | "moderate" | "high")}>
            <option value="low">Low — mostly sedentary</option>
            <option value="moderate">Moderate — regular daily movement</option>
            <option value="high">High — frequent exercise or physical work</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Climate
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={climate} onChange={(e) => setClimate(e.target.value as "mild" | "hot")}>
            <option value="mild">Mild / temperate</option>
            <option value="hot">Hot / humid conditions</option>
          </select>
        </label>
        <label className="block text-sm font-medium">Display units
          <select className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" value={units} onChange={(e) => setUnits(e.target.value as "litres" | "cups")}>
            <option value="litres">Litres per day</option>
            <option value="cups">240 mL cups per day</option>
          </select>
        </label>
      </section>
      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter a valid body weight between 20 and 300 kg.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Illustrative daily fluid baseline</p>
            <p className="mt-2 text-3xl font-semibold">{units === "litres" ? `${formatLitres(result.litres)} L/day` : `${Math.round(result.cups)} cups/day`}</p>
            <p className="mt-2 text-sm text-muted-foreground">Based on 30 mL/kg plus optional activity and heat allowances. This is a rough heuristic, not an official individual requirement.</p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold">Estimate breakdown</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Weight-based baseline</p><p className="mt-1 text-xl font-semibold">{units === "litres" ? `${formatLitres(result.baseline)} L` : `${Math.round(result.baseline / 0.24)} cups`}</p></div>
              <div className="rounded-xl bg-muted/50 p-4"><p className="text-sm text-muted-foreground">Additional allowance in this estimate</p><p className="mt-1 text-xl font-semibold">{units === "litres" ? `${formatLitres(result.litres - result.baseline)} L` : `${Math.round((result.litres - result.baseline) / 0.24)} cups`}</p></div>
            </div>
          </section>
        </>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground space-y-2">
        <p><strong className="text-foreground">Hydration safety:</strong> Fluid needs vary with food intake, sweating, illness, medications, pregnancy, and medical conditions. This estimate is not a medical prescription, and more water is not always better.</p>
        <p>People with kidney, heart, or liver conditions, or those advised to restrict fluids, should follow their clinician’s guidance. Avoid forcing large amounts of water quickly; excessive intake can be dangerous. Thirst and pale-yellow urine can be practical cues for many healthy adults, but are not reliable in every situation.</p>
      </aside>
    </div>
  );
}
