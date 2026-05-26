"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeProvider";

interface User {
  uid: string;
  email: string;
  name: string;
  role: string;
}

export default function LandingHeader({ user }: { user: User | null }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-white transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-ink-950/60 backdrop-blur-xl supports-[backdrop-filter]:bg-ink-950/50"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-glow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">PeopleHub</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-white/70 md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#modules" className="transition hover:text-white">Modules</a>
          <a href="#workflow" className="transition hover:text-white">Workflow</a>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="border-white/10 bg-white/5 text-white hover:bg-white/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10" />
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
            >
              Open Dashboard
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5 hover:text-white sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
              >
                Get started free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
