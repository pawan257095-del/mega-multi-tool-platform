"use client";

import { useMemo, useState } from "react";

function fmt(value: number) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value);
}

export default function IdealWeightCalculatorTool() {
  const [height, setHeight] = useState("170");
  const [currentWeight, setCurrentWeight] = useState("70");

  const result = useMemo(() => {
    const h = Number(height);
    const w = Number(currentWeight);
    if (height.trim() === "" || !Number.isFinite(h) || h < 100 || h > 250) return null;
    const inchesOverFiveFeet = h / 2.54 - 60;
    // Classic height-based formula estimates in kilograms; included for comparison, not prescription.
    const devineMale = 50 + 2.3 * inchesOverFiveFeet;
    const devineFemale = 45.5 + 2.3 * inchesOverFiveFeet;
    const robinsonMale = 52 + 1.9 * inchesOverFiveFeet;
    const robinsonFemale = 49 + 1.7 * inchesOverFiveFeet;
    const millerMale = 56.2 + 1.41 * inchesOverFiveFeet;
    const millerFemale = 53.1 + 1.36 * inchesOverFiveFeet;
    const validWeight = currentWeight.trim() !== "" && Number.isFinite(w) && w >= 20 && w <= 400;
    const avg = (devineMale + devineFemale + robinsonMale + robinsonFemale + millerMale + millerFemale) / 6;
    return {
      devineMale, devineFemale, robinsonMale, robinsonFemale, millerMale, millerFemale,
      avg,
      currentWeight: validWeight ? w : null,
      difference: validWeight ? w - avg : null,
    };
  }, [height, currentWeight]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-2">
        <label className="block text-sm font-medium">Height (cm)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="100" max="250" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        </label>
        <label className="block text-sm font-medium">Current weight (kg, optional)
          <input className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2" type="number" min="20" max="400" step="0.1" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)} />
        </label>
      </section>
      {!result ? (
        <p role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">Enter a valid height between 100 and 250 cm. Current weight, if entered, should be between 20 and 400 kg.</p>
      ) : (
        <>
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground">Average of six classic formula estimates</p>
            <p className="mt-2 text-3xl font-semibold">{fmt(result.avg)} kg</p>
            <p className="mt-2 text-sm text-muted-foreground">This average is a comparison aid, not a clinically validated personal target.</p>
          </section>
          <section className="rounded-2xl border border-border bg-card p-5">
            <h3 className="text-lg font-semibold">Formula estimates</h3>
            <p className="mt-1 text-sm text-muted-foreground">Historical height-based equations vary and were developed for population estimates.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-border"><th className="py-2 pr-4 font-medium">Formula</th><th className="py-2 pr-4 font-medium">Male equation</th><th className="py-2 font-medium">Female equation</th></tr></thead>
                <tbody>
                  <tr className="border-b border-border"><td className="py-3 pr-4">Devine</td><td className="py-3 pr-4">{fmt(result.devineMale)} kg</td><td className="py-3">{fmt(result.devineFemale)} kg</td></tr>
                  <tr className="border-b border-border"><td className="py-3 pr-4">Robinson</td><td className="py-3 pr-4">{fmt(result.robinsonMale)} kg</td><td className="py-3">{fmt(result.robinsonFemale)} kg</td></tr>
                  <tr><td className="py-3 pr-4">Miller</td><td className="py-3 pr-4">{fmt(result.millerMale)} kg</td><td className="py-3">{fmt(result.millerFemale)} kg</td></tr>
                </tbody>
              </table>
            </div>
          </section>
          {result.currentWeight !== null && result.difference !== null && (
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm text-muted-foreground">Current weight compared with formula average</p>
              <p className="mt-2 text-xl font-semibold">{result.difference > 0 ? `${fmt(result.difference)} kg above` : result.difference < 0 ? `${fmt(Math.abs(result.difference))} kg below` : "Equal to"} the average estimate</p>
              <p className="mt-1 text-xs text-muted-foreground">This comparison does not determine whether your weight is healthy.</p>
            </section>
          )}
        </>
      )}
      <aside className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        <strong className="text-foreground">Important:</strong> There is no single ideal weight for everyone. These older equations do not directly measure body fat, muscle, bone structure, or health. They may be unsuitable for children, pregnancy, athletes, and people with certain health conditions. Do not use the output as a target for rapid weight change; consult a qualified healthcare professional for individual advice.
      </aside>
    </div>
  );
}
