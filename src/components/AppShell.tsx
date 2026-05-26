"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import { ThemeToggle } from "./ThemeProvider";
import type { SessionPayload } from "@/lib/auth";

export default function AppShell({ user, children }: { user: SessionPayload | null; children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-ink-950">
      <Sidebar
        user={user}
        onSearch={() => setSearchOpen(true)}
        mobileOpen={drawerOpen}
        onMobileClose={() => setDrawerOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-white/5 dark:bg-ink-900 lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href={user?.role === "user" || user?.role === "employee" ? "/me" : "/dashboard"} className="flex flex-1 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-glow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4">
                <g strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5v-1.5a4 4 0 014-4h5a4 4 0 014 4v1.5"/><circle cx="17" cy="6.5" r="2.2"/><path d="M16.5 14h1a3.3 3.3 0 013.3 3.3v1.2"/></g>
              </svg>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100">PeopleHub</span>
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
          </button>
          <ThemeToggle />
        </div>

        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
