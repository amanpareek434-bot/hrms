"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ThemeToggle } from "./ThemeProvider";

const ADMIN_NAV: Array<{ section?: string; href: string; label: string; icon: string }> = [
  { section: "Overview", href: "/dashboard", label: "Dashboard", icon: "M3 12l9-9 9 9M5 10v10h14V10" },
  { href: "/calendar", label: "Calendar", icon: "M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" },
  { href: "/reports", label: "Reports", icon: "M9 19V6l12-3v13M9 19a3 3 0 100-6 3 3 0 000 6zm12-3a3 3 0 100-6 3 3 0 000 6z" },
  { section: "People", href: "/employees", label: "Employees", icon: "M16 14a4 4 0 10-8 0M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" },
  { href: "/departments", label: "Departments", icon: "M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" },
  { href: "/recruitment", label: "Recruitment", icon: "M9 12h6M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2zM12 4v4h4" },
  { href: "/documents", label: "Documents", icon: "M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" },
  { section: "Time", href: "/attendance", label: "Attendance", icon: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/leaves", label: "Leaves", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" },
  { href: "/holidays", label: "Holidays", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
  { section: "Growth", href: "/performance", label: "Performance", icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { section: "Operations", href: "/payroll", label: "Payroll", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M5 12a7 7 0 1014 0 7 7 0 00-14 0z" },
  { href: "/assets", label: "Assets", icon: "M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" },
  { href: "/announcements", label: "Announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
  { section: "Admin", href: "/settings", label: "Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM12 15a3 3 0 100-6 3 3 0 000 6z" },
  { href: "/integrations/essl", label: "eSSL Device", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
];

const EMPLOYEE_NAV: Array<{ section?: string; href: string; label: string; icon: string }> = [
  { section: "Personal", href: "/me", label: "My Profile", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/me/punch", label: "Punch In / Out", icon: "M12 17a4 4 0 11.001-7.999A4 4 0 0112 17zM6 12a6 6 0 1112 0M3 12a9 9 0 1118 0" },
  { href: "/me/leaves", label: "My Leaves", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" },
  { href: "/me/attendance", label: "My Attendance", icon: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/me/payslips", label: "My Payslips", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M5 12a7 7 0 1014 0 7 7 0 00-14 0z" },
  { section: "Workplace", href: "/announcements", label: "Announcements", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" },
  { href: "/holidays", label: "Holidays", icon: "M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" },
  { href: "/calendar", label: "Calendar", icon: "M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" },
];

interface User {
  uid?: string;
  email: string;
  name: string;
  role: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function Sidebar({ user, onSearch }: { user: User | null; onSearch?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  const isEmployee = user?.role === "employee" || user?.role === "user";
  const nav = isEmployee ? EMPLOYEE_NAV : ADMIN_NAV;

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-white/5 dark:bg-ink-900 lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:self-start">
      <Link
        href={isEmployee ? "/me" : "/dashboard"}
        className="flex h-16 items-center gap-3 border-b border-slate-200 px-6 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
            <g strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5v-1.5a4 4 0 014-4h5a4 4 0 014 4v1.5"/><circle cx="17" cy="6.5" r="2.2"/><path d="M16.5 14h1a3.3 3.3 0 013.3 3.3v1.2"/></g>
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">PeopleHub</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{isEmployee ? "Employee" : "HRMS Console"}</p>
        </div>
      </Link>

      {onSearch ? (
        <button
          onClick={onSearch}
          className="mx-3 mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-100 dark:border-white/5 dark:bg-ink-800 dark:text-slate-400 dark:hover:bg-ink-800/70"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          <span className="flex-1 text-left">Search…</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 text-[10px] font-mono text-slate-500 dark:border-white/10 dark:bg-ink-900 dark:text-slate-400">Ctrl K</kbd>
        </button>
      ) : null}

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {nav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <div key={item.href}>
              {item.section ? (
                <p className="mb-1 mt-3 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.section}
                </p>
              ) : null}
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-white/5">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-semibold text-white">
                {initials(user.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{user.name}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link href="/login" className="btn-primary w-full">
              Sign in
            </Link>
            <div className="flex justify-center">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
