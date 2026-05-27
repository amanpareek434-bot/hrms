"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  tagline: string;
  bullets: { title: string; desc: string }[];
  gradient: string;
}

const TABS: Tab[] = [
  {
    id: "admin",
    label: "For HR Admin",
    tagline: "Run the whole show from one screen.",
    gradient: "from-violet-500 via-fuchsia-500 to-pink-500",
    bullets: [
      { title: "16 modules in one console", desc: "Employees, payroll, leaves, recruitment, performance, assets, expenses — no tab juggling." },
      { title: "Bulk import & exports", desc: "CSV import for employees, CSV download on every dataset for reporting." },
      { title: "Approve in one click", desc: "Approve/reject leaves and expense claims directly from the dashboard." },
      { title: "Auto-generate payroll", desc: "Click Generate — basic, HRA, allowances, reimbursements computed and ready to pay." },
      { title: "Audit-friendly", desc: "Every approval has an approver_id and timestamp. No shadow edits." },
    ],
  },
  {
    id: "employee",
    label: "For Employees",
    tagline: "Self-service that actually serves.",
    gradient: "from-emerald-500 via-cyan-500 to-blue-500",
    bullets: [
      { title: "Apply leave in 10 seconds", desc: "Pick dates, type a reason, hit submit. Balance updates live." },
      { title: "Submit expenses with receipt", desc: "Paste a Drive/Dropbox link, log the bill, wait for approval — money lands in next salary." },
      { title: "Punch in via fingerprint", desc: "WebAuthn-backed biometric punch-in from your phone — no app install." },
      { title: "Download payslips", desc: "Printable PDF with company branding, every month, in one click." },
      { title: "Track your stuff", desc: "See your assets, documents, leave balance and reviews — all scoped to you." },
    ],
  },
  {
    id: "biometric",
    label: "Biometric / eSSL",
    tagline: "Your attendance machine, plug-and-play.",
    gradient: "from-cyan-500 via-teal-500 to-emerald-500",
    bullets: [
      { title: "Direct TCP to your device", desc: "Talks ZKTeco protocol on port 4370 — no middleware, no cloud roundtrip." },
      { title: "One-click user import", desc: "Bring every enrolled fingerprint into HRMS as an employee with `ESSL-<id>` codes." },
      { title: "Auto-create on sync", desc: "Toggle ON: newly enrolled device users land in HRMS automatically next sync." },
      { title: "Smart aggregation", desc: "Multiple punches per day collapse into first check-in, last check-out — in IST." },
      { title: "WebAuthn fallback", desc: "No device? Employees can punch via phone fingerprint via WebAuthn." },
    ],
  },
];

export default function FeatureTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              active === t.id
                ? `bg-gradient-to-r ${t.gradient} text-white shadow-glow`
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div
        key={tab.id}
        className="mt-10 grid grid-cols-1 gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-violet-500/5 dark:border-white/10 dark:bg-ink-800 sm:p-10 lg:grid-cols-5"
      >
        <div className="lg:col-span-2">
          <span
            className={`inline-block rounded-full bg-gradient-to-r ${tab.gradient} bg-clip-text text-xs font-semibold uppercase tracking-wider text-transparent`}
          >
            {tab.label}
          </span>
          <h3 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{tab.tagline}</h3>
          <div className={`mt-6 h-1 w-24 rounded-full bg-gradient-to-r ${tab.gradient}`} />
        </div>
        <ul className="lg:col-span-3 space-y-4">
          {tab.bullets.map((b) => (
            <li key={b.title} className="flex items-start gap-4">
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${tab.gradient} text-white`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">{b.title}</p>
                <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{b.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
