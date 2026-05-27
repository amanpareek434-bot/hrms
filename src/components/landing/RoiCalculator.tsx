"use client";

import { useMemo, useState } from "react";

// Conservative assumptions per employee per month (industry averages):
// - 45 min on attendance / leave admin (HR side)
// - 25 min payroll prep
// - 15 min misc — documents, queries, status checks
// Total ~ 1.4 hours saved per employee per month.
const MIN_PER_EMP_PER_MONTH = 85;
// Average loaded HR cost (₹/hr)
const HR_HOURLY = 500;

export default function RoiCalculator() {
  const [employees, setEmployees] = useState(50);

  const stats = useMemo(() => {
    const hoursSavedMonth = (employees * MIN_PER_EMP_PER_MONTH) / 60;
    const moneySavedMonth = hoursSavedMonth * HR_HOURLY;
    const moneySavedYear = moneySavedMonth * 12;
    const paperFormsSaved = employees * 8; // forms/employee/month
    return {
      hoursSavedMonth: Math.round(hoursSavedMonth),
      moneySavedMonth: Math.round(moneySavedMonth),
      moneySavedYear: Math.round(moneySavedYear),
      paperFormsSaved: Math.round(paperFormsSaved),
    };
  }, [employees]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-violet-500/5 dark:border-white/10 dark:bg-ink-800 sm:p-10">
      <div className="pointer-events-none absolute -right-32 -top-32 h-72 w-72 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 blur-3xl" />

      <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent">
            Calculator
          </p>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">
            How much time will you save?
          </h3>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Move the slider to match your team size. We&apos;ll estimate the HR admin time, money and paper PeopleHub saves you every month.
          </p>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Team size
              </label>
              <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {employees}
                <span className="ml-1 text-base font-normal text-slate-500">employees</span>
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={employees}
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="mt-3 w-full accent-violet-600"
            />
            <div className="mt-2 flex justify-between text-[10px] text-slate-400">
              <span>5</span>
              <span>100</span>
              <span>250</span>
              <span>500+</span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[10, 25, 50, 100, 250].map((n) => (
              <button
                key={n}
                onClick={() => setEmployees(n)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  employees === n
                    ? "border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-white/10 dark:text-slate-400"
                }`}
              >
                {n} people
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Hours saved / month"
            value={stats.hoursSavedMonth.toLocaleString("en-IN")}
            suffix="hrs"
            tone="violet"
          />
          <Stat
            label="Money saved / month"
            value={fmt(stats.moneySavedMonth)}
            tone="emerald"
          />
          <Stat
            label="Money saved / year"
            value={fmt(stats.moneySavedYear)}
            tone="fuchsia"
            big
          />
          <Stat
            label="Paper forms eliminated"
            value={stats.paperFormsSaved.toLocaleString("en-IN")}
            suffix="/mo"
            tone="amber"
          />
        </div>
      </div>

      <p className="relative mt-6 text-xs text-slate-500 dark:text-slate-400">
        * Based on industry averages: ~85 min/employee/month of HR admin (attendance, leaves, payroll prep, queries) at
        ₹500/hr loaded cost. Actuals vary — many teams see 2–3× this once eSSL sync replaces manual punch-in.
      </p>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  tone,
  big,
}: {
  label: string;
  value: string;
  suffix?: string;
  tone: "violet" | "emerald" | "fuchsia" | "amber";
  big?: boolean;
}) {
  const toneClasses: Record<string, string> = {
    violet: "from-violet-500/20 to-violet-500/5 text-violet-700 dark:text-violet-200",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-700 dark:text-emerald-200",
    fuchsia: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-700 dark:text-fuchsia-200",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-200",
  };
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${toneClasses[tone]} p-4 dark:border-white/10 ${
        big ? "col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">{label}</p>
      <p className={`mt-1 font-bold text-slate-900 dark:text-slate-50 ${big ? "text-3xl" : "text-2xl"}`}>
        {value}
        {suffix ? <span className="ml-1 text-sm font-normal opacity-70">{suffix}</span> : null}
      </p>
    </div>
  );
}
