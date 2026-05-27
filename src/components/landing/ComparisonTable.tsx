"use client";

import { useState } from "react";

type Competitor = "spreadsheets" | "legacy" | "saas";

const COMPETITORS: { id: Competitor; label: string }[] = [
  { id: "spreadsheets", label: "Spreadsheets" },
  { id: "legacy", label: "Legacy HR Software" },
  { id: "saas", label: "Cloud HR SaaS" },
];

interface Row {
  feature: string;
  peoplehub: string;
  spreadsheets: string;
  legacy: string;
  saas: string;
}

const ROWS: Row[] = [
  {
    feature: "Setup time",
    peoplehub: "5 minutes",
    spreadsheets: "Hours of formatting",
    legacy: "Weeks · consultant required",
    saas: "Days · onboarding sessions",
  },
  {
    feature: "Cost / month (50 employees)",
    peoplehub: "₹0 (self-hosted)",
    spreadsheets: "₹0 + your sanity",
    legacy: "₹15,000 – 50,000+",
    saas: "₹10,000 – 30,000",
  },
  {
    feature: "Data ownership",
    peoplehub: "Your MySQL · your server",
    spreadsheets: "You — if you don't lose the file",
    legacy: "Vendor server",
    saas: "Vendor cloud",
  },
  {
    feature: "eSSL biometric sync",
    peoplehub: "Built-in, plug-and-play",
    spreadsheets: "Manual entry from device",
    legacy: "Custom integration · extra cost",
    saas: "Add-on · paid tier",
  },
  {
    feature: "Employee self-service",
    peoplehub: "Dedicated portal · WebAuthn",
    spreadsheets: "None",
    legacy: "Clunky old portal",
    saas: "Yes",
  },
  {
    feature: "Expense reimbursement",
    peoplehub: "Auto-flows into payroll",
    spreadsheets: "Email + manual tracking",
    legacy: "Separate module · paid",
    saas: "Yes",
  },
  {
    feature: "Payslip PDF",
    peoplehub: "One click · branded",
    spreadsheets: "Manual layout each time",
    legacy: "Yes — but ugly",
    saas: "Yes",
  },
  {
    feature: "Cmd+K search · Dark mode",
    peoplehub: "Both, polished",
    spreadsheets: "Ctrl+F is your friend",
    legacy: "Neither",
    saas: "Partial",
  },
  {
    feature: "Lock-in / migration",
    peoplehub: "Plain SQL — own your data",
    spreadsheets: "CSV in/out",
    legacy: "Painful · proprietary formats",
    saas: "Possible · export tools vary",
  },
  {
    feature: "Customization",
    peoplehub: "It's your code — change anything",
    spreadsheets: "Fragile macros",
    legacy: "Request a quote",
    saas: "Limited to what's exposed",
  },
];

export default function ComparisonTable() {
  const [competitor, setCompetitor] = useState<Competitor>("spreadsheets");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Compare against:
        </span>
        {COMPETITORS.map((c) => (
          <button
            key={c.id}
            onClick={() => setCompetitor(c.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              competitor === c.id
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-white/10 dark:bg-ink-800 dark:text-slate-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xl shadow-violet-500/5 dark:border-white/10 dark:bg-ink-800">
        <table className="min-w-full divide-y divide-slate-100 dark:divide-white/10">
          <thead className="bg-slate-50/50 dark:bg-white/[0.02]">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Feature
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  PeopleHub
                </span>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {COMPETITORS.find((c) => c.id === competitor)?.label}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {ROWS.map((r) => (
              <tr key={r.feature} className="transition hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{r.feature}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      className="h-4 w-4 shrink-0 text-emerald-500"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {r.peoplehub}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {r[competitor]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
