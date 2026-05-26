"use client";

export default function Header({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="app-header flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-white/5 dark:bg-ink-900 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100 sm:text-xl">{title}</h1>
        {subtitle ? <p className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
