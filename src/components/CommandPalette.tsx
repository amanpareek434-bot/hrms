"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  group: string;
  href: string;
  keywords: string;
}

const QUICK_LINKS: SearchItem[] = [
  { id: "q-dashboard",     title: "Dashboard",         group: "Pages", href: "/dashboard",     keywords: "dashboard home overview" },
  { id: "q-employees",     title: "Employees",         group: "Pages", href: "/employees",     keywords: "employees team people staff" },
  { id: "q-attendance",    title: "Attendance",        group: "Pages", href: "/attendance",    keywords: "attendance time check-in" },
  { id: "q-leaves",        title: "Leaves",            group: "Pages", href: "/leaves",        keywords: "leaves vacation off pto" },
  { id: "q-departments",   title: "Departments",       group: "Pages", href: "/departments",   keywords: "departments teams org" },
  { id: "q-payroll",       title: "Payroll",           group: "Pages", href: "/payroll",       keywords: "payroll salary payslip" },
  { id: "q-recruitment",   title: "Recruitment",       group: "Pages", href: "/recruitment",   keywords: "recruitment hiring candidates" },
  { id: "q-performance",   title: "Performance",       group: "Pages", href: "/performance",   keywords: "performance reviews appraisal" },
  { id: "q-assets",        title: "Assets",            group: "Pages", href: "/assets",        keywords: "assets equipment laptop" },
  { id: "q-documents",     title: "Documents",         group: "Pages", href: "/documents",     keywords: "documents files docs" },
  { id: "q-holidays",      title: "Holidays",          group: "Pages", href: "/holidays",      keywords: "holidays calendar leaves off" },
  { id: "q-announcements", title: "Announcements",     group: "Pages", href: "/announcements", keywords: "announcements news post" },
  { id: "q-calendar",      title: "Calendar",          group: "Pages", href: "/calendar",      keywords: "calendar month events" },
  { id: "q-reports",       title: "Reports",           group: "Pages", href: "/reports",       keywords: "reports analytics charts" },
  { id: "q-settings",      title: "Settings",          group: "Pages", href: "/settings",      keywords: "settings company profile" },
];

interface ApiSets {
  employees: Array<{ id: string; firstName: string; lastName: string; email: string; designation?: string; department?: string }>;
  candidates: Array<{ id: string; name: string; position?: string; stage?: string; email?: string }>;
  departments: Array<{ id: string; name: string; head?: string }>;
  documents: Array<{ id: string; title: string; category: string; employeeId: string }>;
}

const EMPTY_SETS: ApiSets = { employees: [], candidates: [], departments: [], documents: [] };

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const [data, setData] = useState<ApiSets>(EMPTY_SETS);

  // Fetch data when palette opens
  useEffect(() => {
    if (!open) return;
    setQ("");
    setActiveIdx(0);
    setTimeout(() => inputRef.current?.focus(), 50);
    (async () => {
      try {
        const [e, c, d, dc] = await Promise.all([
          fetch("/api/employees").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/candidates").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/departments").then((r) => (r.ok ? r.json() : [])),
          fetch("/api/documents").then((r) => (r.ok ? r.json() : [])),
        ]);
        setData({ employees: e, candidates: c, departments: d, documents: dc });
      } catch {
        setData(EMPTY_SETS);
      }
    })();
  }, [open]);

  const results = useMemo(() => {
    const items: SearchItem[] = [];

    QUICK_LINKS.forEach((it) => items.push(it));

    data.employees.forEach((e) =>
      items.push({
        id: `e-${e.id}`,
        title: `${e.firstName} ${e.lastName}`,
        subtitle: `${e.designation || ""} · ${e.department || ""}`,
        group: "Employees",
        href: `/employees/${e.id}`,
        keywords: `${e.firstName} ${e.lastName} ${e.email} ${e.designation || ""} ${e.department || ""}`.toLowerCase(),
      }),
    );

    data.candidates.forEach((c) =>
      items.push({
        id: `c-${c.id}`,
        title: c.name,
        subtitle: `${c.position || ""} · ${c.stage || ""}`,
        group: "Candidates",
        href: "/recruitment",
        keywords: `${c.name} ${c.email || ""} ${c.position || ""} ${c.stage || ""}`.toLowerCase(),
      }),
    );

    data.departments.forEach((d) =>
      items.push({
        id: `d-${d.id}`,
        title: d.name,
        subtitle: d.head ? `Head: ${d.head}` : "",
        group: "Departments",
        href: "/departments",
        keywords: `${d.name} ${d.head || ""}`.toLowerCase(),
      }),
    );

    data.documents.forEach((d) =>
      items.push({
        id: `do-${d.id}`,
        title: d.title,
        subtitle: d.category,
        group: "Documents",
        href: `/employees/${d.employeeId}`,
        keywords: `${d.title} ${d.category}`.toLowerCase(),
      }),
    );

    const query = q.trim().toLowerCase();
    const filtered = query
      ? items.filter((it) => it.title.toLowerCase().includes(query) || it.keywords.includes(query))
      : items.slice(0, 30);

    return filtered.slice(0, 50);
  }, [q, data]);

  useEffect(() => {
    setActiveIdx(0);
  }, [q]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const it = results[activeIdx];
        if (it) {
          router.push(it.href);
          onClose();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, activeIdx, onClose, router]);

  if (!open) return null;

  // Group items
  const groups: Record<string, SearchItem[]> = {};
  results.forEach((r) => {
    (groups[r.group] = groups[r.group] || []).push(r);
  });

  let runningIdx = -1;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/70" onClick={onClose}>
      <div
        className="mt-20 w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-ink-900 dark:ring-1 dark:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-slate-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search employees, candidates, departments, documents, pages…"
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:border-white/10 dark:bg-ink-800 dark:text-slate-400">
            ESC
          </kbd>
        </div>

        <div className="max-h-96 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No results.</p>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group} className="mb-2">
                <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">{group}</p>
                {items.map((it) => {
                  runningIdx++;
                  const active = runningIdx === activeIdx;
                  return (
                    <Link
                      key={it.id}
                      href={it.href}
                      onClick={onClose}
                      className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                        active
                          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                          : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{it.title}</p>
                        {it.subtitle ? <p className="truncate text-xs text-slate-500 dark:text-slate-400">{it.subtitle}</p> : null}
                      </div>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`h-4 w-4 ${active ? "" : "opacity-0"}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2 text-[10px] text-slate-500 dark:border-white/5 dark:text-slate-400">
          <span className="flex gap-3">
            <span><kbd className="rounded border border-slate-200 px-1 dark:border-white/10">↑↓</kbd> Navigate</span>
            <span><kbd className="rounded border border-slate-200 px-1 dark:border-white/10">↵</kbd> Open</span>
          </span>
          <span>{results.length} result{results.length === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}
