import Link from "next/link";

export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-ink-950">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />

      <div className="relative grid min-h-screen lg:grid-cols-2">
        {/* Left panel — Brand */}
        <div className="hidden bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 p-12 lg:flex lg:flex-col lg:justify-between">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                <g strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5v-1.5a4 4 0 014-4h5a4 4 0 014 4v1.5"/><circle cx="17" cy="6.5" r="2.2"/><path d="M16.5 14h1a3.3 3.3 0 013.3 3.3v1.2"/></g>
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold">PeopleHub</p>
              <p className="text-xs text-white/70">HRMS Console</p>
            </div>
          </Link>

          <div className="space-y-6 text-white">
            <h2 className="text-4xl font-bold leading-tight">
              The modern HR workspace
              <br />
              your team will love.
            </h2>
            <p className="max-w-md text-white/80">
              Manage employees, attendance, leaves, and payroll from one beautiful console. Built with Next.js + MySQL.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { k: "100%", v: "MySQL backed" },
                { k: "6", v: "Modules" },
                { k: "CSV", v: "Bulk import" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl bg-white/10 p-4 backdrop-blur">
                  <p className="text-2xl font-bold">{s.k}</p>
                  <p className="text-xs text-white/70">{s.v}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/60">© {new Date().getFullYear()} PeopleHub. All rights reserved.</p>
        </div>

        {/* Right panel — Form */}
        <div className="flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-8 inline-flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                  <g strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M2.5 19.5v-1.5a4 4 0 014-4h5a4 4 0 014 4v1.5"/><circle cx="17" cy="6.5" r="2.2"/><path d="M16.5 14h1a3.3 3.3 0 013.3 3.3v1.2"/></g>
                </svg>
              </div>
              <span className="text-lg font-semibold text-slate-900 dark:text-slate-100">PeopleHub</span>
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
