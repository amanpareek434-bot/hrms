"use client";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import CommandPalette from "./CommandPalette";
import type { SessionPayload } from "@/lib/auth";

export default function AppShell({ user, children }: { user: SessionPayload | null; children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

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
      <Sidebar user={user} onSearch={() => setSearchOpen(true)} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
