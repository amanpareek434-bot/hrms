"use client";

import { useEffect, useState } from "react";

const ITEMS = [
  {
    quote:
      "We retired three Excel sheets and a half-broken biometric desktop app in a single weekend. The eSSL sync alone saves us 4–5 hours every Monday morning.",
    name: "Priya Mehta",
    role: "HR Manager · 80-person SaaS company",
    initials: "PM",
    tone: "from-violet-500 to-fuchsia-500",
  },
  {
    quote:
      "Self-service was the unlock. Employees stopped asking me for payslips, leave balances and assigned-laptop info. My inbox finally has space.",
    name: "Rohan Iyer",
    role: "Founder · 35-person agency",
    initials: "RI",
    tone: "from-cyan-500 to-blue-500",
  },
  {
    quote:
      "Expense reimbursement plugging straight into payroll generation was the killer feature. No more 'did we pay Ravi's hotel?' messages.",
    name: "Aanya Khurana",
    role: "Finance Lead · D2C brand",
    initials: "AK",
    tone: "from-emerald-500 to-teal-500",
  },
  {
    quote:
      "It's open source and self-hosted, which means our data never leaves our infra. Compliance team approved this in one meeting — a first.",
    name: "Vikram Shah",
    role: "CTO · fintech startup",
    initials: "VS",
    tone: "from-amber-500 to-rose-500",
  },
];

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % ITEMS.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [paused]);

  const item = ITEMS[active];

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-violet-500/5 dark:border-white/10 dark:bg-ink-800 sm:p-12"
    >
      <div
        className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${item.tone} opacity-10 blur-3xl transition`}
      />
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="relative h-10 w-10 text-violet-300 dark:text-violet-500/50"
      >
        <path d="M9.983 3v7.391c0 5.704-3.731 9.57-8.983 10.609l-.995-2.151c2.432-.917 3.995-3.638 3.995-5.849h-4v-10h9.983zm14.017 0v7.391c0 5.704-3.748 9.571-9 10.609l-.996-2.151c2.433-.917 3.996-3.638 3.996-5.849h-3.983v-10h9.983z" />
      </svg>

      <blockquote className="relative mt-4 text-xl font-medium leading-relaxed text-slate-900 dark:text-slate-100 sm:text-2xl">
        &ldquo;{item.quote}&rdquo;
      </blockquote>

      <div className="relative mt-8 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.tone} font-bold text-white`}
        >
          {item.initials}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
        </div>
        <div className="ml-auto flex gap-1.5">
          {ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === active
                  ? "w-8 bg-gradient-to-r from-violet-500 to-fuchsia-500"
                  : "w-2 bg-slate-200 hover:bg-slate-300 dark:bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
