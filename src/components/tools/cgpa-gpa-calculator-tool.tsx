"use client";

import { useMemo, useState } from "react";

type Course = {
  id: number;
  name: string;
  credits: string;
  gradePoint: string;
};

const defaultCourses: Course[] = [
  { id: 1, name: "Course 1", credits: "4", gradePoint: "9" },
  { id: 2, name: "Course 2", credits: "3", gradePoint: "8" },
  { id: 3, name: "Course 3", credits: "3", gradePoint: "8" },
];

function numeric(value: string): number {
  if (value.trim() === "") return NaN;
  return Number(value);
}

export default function CgpaGpaCalculatorTool() {
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [previousCgpa, setPreviousCgpa] = useState("");
  const [previousCredits, setPreviousCredits] = useState("");
  const [scale, setScale] = useState("10");
  const [nextId, setNextId] = useState(4);

  const result = useMemo(() => {
    const rows = courses.map((course) => ({
      ...course,
      creditValue: numeric(course.credits),
      pointValue: numeric(course.gradePoint),
    }));
    const valid = rows.filter((r) =>
      r.name.trim() !== "" &&
      Number.isFinite(r.creditValue) && r.creditValue > 0 &&
      Number.isFinite(r.pointValue) && r.pointValue >= 0 && r.pointValue <= Number(scale)
    );
    const hasInvalid = rows.some((r) =>
      r.name.trim() === "" ||
      !Number.isFinite(r.creditValue) || r.creditValue <= 0 ||
      !Number.isFinite(r.pointValue) || r.pointValue < 0 || r.pointValue > Number(scale)
    );
    const totalCredits = valid.reduce((sum, r) => sum + r.creditValue, 0);
    const weightedPoints = valid.reduce((sum, r) => sum + r.creditValue * r.pointValue, 0);
    const gpa = totalCredits > 0 ? weightedPoints / totalCredits : null;

    const oldCgpa = previousCgpa.trim() === "" ? null : numeric(previousCgpa);
    const oldCredits = previousCredits.trim() === "" ? null : numeric(previousCredits);
    const cumulativeValid =
      oldCgpa !== null && Number.isFinite(oldCgpa) && oldCgpa >= 0 && oldCgpa <= Number(scale) &&
      oldCredits !== null && Number.isFinite(oldCredits) && oldCredits >= 0 &&
      gpa !== null && totalCredits > 0;
    const cgpa = cumulativeValid
      ? ((oldCgpa! * oldCredits!) + weightedPoints) / (oldCredits! + totalCredits)
      : null;
    return { gpa, cgpa, totalCredits, validCount: valid.length, rowCount: rows.length, hasInvalid };
  }, [courses, previousCgpa, previousCredits, scale]);

  function updateCourse(id: number, key: keyof Omit<Course, "id">, value: string) {
    setCourses((current) => current.map((course) => course.id === id ? { ...course, [key]: value } : course));
  }

  function addCourse() {
    setCourses((current) => [...current, { id: nextId, name: `Course ${nextId}`, credits: "3", gradePoint: "8" }]);
    setNextId((id) => id + 1);
  }

  function removeCourse(id: number) {
    setCourses((current) => current.length > 1 ? current.filter((course) => course.id !== id) : current);
  }

  const inputClass = "w-full rounded-lg border border-slate-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Semester subjects</h2>
            <p className="mt-1 text-sm text-slate-500">Enter each course’s credit value and grade points.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="grade-scale" className="text-slate-500">Grade scale</label>
            <select id="grade-scale" value={scale} onChange={(e) => setScale(e.target.value)} className="rounded-lg border border-slate-300 bg-transparent px-3 py-2 dark:border-slate-700">
              <option value="10">0–10</option>
              <option value="4">0–4</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {courses.map((course, index) => (
            <div key={course.id} className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_auto] sm:items-end">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`course-name-${course.id}`}>Subject {index + 1}</label>
                <input id={`course-name-${course.id}`} value={course.name} onChange={(e) => updateCourse(course.id, "name", e.target.value)} className={inputClass} placeholder="Subject name" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`course-credits-${course.id}`}>Credits</label>
                <input id={`course-credits-${course.id}`} type="number" min="0.1" step="0.5" value={course.credits} onChange={(e) => updateCourse(course.id, "credits", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500" htmlFor={`course-grade-${course.id}`}>Grade points</label>
                <input id={`course-grade-${course.id}`} type="number" min="0" max={scale} step="0.1" value={course.gradePoint} onChange={(e) => updateCourse(course.id, "gradePoint", e.target.value)} className={inputClass} />
              </div>
              <button type="button" onClick={() => removeCourse(course.id)} disabled={courses.length === 1} aria-label={`Remove ${course.name}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-30 dark:border-slate-700 dark:hover:bg-slate-800">Remove</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addCourse} className="mt-4 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">+ Add subject</button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900 dark:bg-blue-950/20">
          <p className="text-sm text-slate-500">Semester GPA</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{result.gpa === null ? "—" : result.gpa.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Weighted by course credits</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Updated CGPA</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{result.cgpa === null ? "—" : result.cgpa.toFixed(2)}</p>
          <p className="mt-1 text-xs text-slate-500">Requires previous CGPA and credits</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Semester credits</p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{result.totalCredits.toFixed(1)}</p>
          <p className="mt-1 text-xs text-slate-500">{result.validCount} of {result.rowCount} subjects valid</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-lg font-semibold">Update cumulative CGPA (optional)</h2>
        <p className="mb-4 text-sm text-slate-500">Enter your CGPA before this semester and the total credits already completed. The calculator combines old and current weighted grade points.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="previous-cgpa" className="mb-1.5 block text-sm font-medium">Previous CGPA</label>
            <input id="previous-cgpa" type="number" min="0" max={scale} step="0.01" value={previousCgpa} onChange={(e) => setPreviousCgpa(e.target.value)} placeholder={`0–${scale}`} className={inputClass} />
          </div>
          <div>
            <label htmlFor="previous-credits" className="mb-1.5 block text-sm font-medium">Previously completed credits</label>
            <input id="previous-credits" type="number" min="0" step="0.5" value={previousCredits} onChange={(e) => setPreviousCredits(e.target.value)} placeholder="e.g. 42" className={inputClass} />
          </div>
        </div>
        {result.hasInvalid && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">Some subject entries are invalid. Use positive credits and grade points within the selected scale; invalid rows are excluded from the result.</p>}
      </section>

      <p className="text-xs leading-5 text-slate-500">Formula: GPA = Σ(credits × grade points) ÷ Σ(credits). Updated CGPA = (previous CGPA × previous credits + current weighted grade points) ÷ (previous credits + current credits). Your institution may use a different grading policy or conversion formula; follow its official rules.</p>
    </div>
  );
}
