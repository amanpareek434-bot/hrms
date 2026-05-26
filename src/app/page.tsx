import Link from "next/link";
import LandingHeader from "@/components/LandingHeader";
import { getCurrentUser } from "@/lib/auth";

export default async function LandingPage() {
  const user = await getCurrentUser();

  return (
    <div className="bg-white dark:bg-ink-950">
      <LandingHeader user={user} />

      {/* ============================================ */}
      {/* DARK AURORA HERO                              */}
      {/* ============================================ */}
      <div className="relative isolate overflow-hidden bg-ink-950 text-white">
        {/* Aurora glow */}
        <div className="pointer-events-none absolute inset-0 bg-aurora-1" />
        {/* Faint grid overlay */}
        <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid-32 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        {/* Top fade */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ink-950 to-transparent" />

        {/* HERO */}
        <section className="relative z-10 mx-auto max-w-7xl px-6 pt-28 pb-24 text-center sm:pt-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            New · eSSL biometric sync · Self-service portal · Cmd+K · Dark mode
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            The complete HRMS,
            <br />
            <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              for the modern workplace.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            15 integrated modules — Employees, Attendance, Leaves, Payroll, Recruitment, Performance, Assets,
            Documents, Calendar, Reports + plug-and-play <strong className="text-white">eSSL biometric sync</strong>.
            Admins manage. Employees self-serve. All on your own MySQL.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
              >
                Open Dashboard
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
                >
                  Get started — it&apos;s free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>

          <p className="mt-4 text-xs text-white/50">No credit card required · Self-hosted · MySQL backed · 100% open source</p>

          {/* Stats strip */}
          <div className="mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-6 border-y border-white/10 py-8 text-left sm:grid-cols-4">
            {[
              { v: "15+", l: "Integrated modules" },
              { v: "eSSL", l: "Biometric ready" },
              { v: "2", l: "Portals: admin + employee" },
              { v: "100%", l: "Open source" },
            ].map((s) => (
              <div key={s.l}>
                <p className="bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
                  {s.v}
                </p>
                <p className="text-xs uppercase tracking-wider text-white/50">{s.l}</p>
              </div>
            ))}
          </div>

          {/* Dashboard preview — glass card */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-violet-900/30 backdrop-blur">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-xs text-white/50">peoplehub.app/dashboard</span>
                <div className="ml-auto hidden items-center gap-2 sm:flex">
                  <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                    <kbd className="font-mono">⌘ K</kbd>  Search
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-0">
                <div className="col-span-3 hidden border-r border-white/10 p-3 lg:block">
                  <div className="space-y-1">
                    {[
                      { l: "Dashboard", active: true },
                      { l: "Calendar" },
                      { l: "Reports" },
                      { l: "Employees" },
                      { l: "Recruitment" },
                      { l: "Documents" },
                      { l: "Attendance" },
                      { l: "Leaves" },
                      { l: "Performance" },
                      { l: "Payroll" },
                      { l: "Assets" },
                      { l: "eSSL Device" },
                    ].map((item) => (
                      <div
                        key={item.l}
                        className={`flex items-center gap-2 rounded-lg px-2 py-1 text-[11px] ${
                          item.active
                            ? "bg-gradient-to-r from-violet-500/30 to-fuchsia-500/20 text-white"
                            : "text-white/60"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
                        {item.l}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 space-y-3 p-4 lg:col-span-9">
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { l: "Employees", v: "248", t: "from-violet-500/20 to-violet-500/5 text-violet-200" },
                      { l: "Present", v: "231", t: "from-emerald-500/20 to-emerald-500/5 text-emerald-200" },
                      { l: "Open Roles", v: "12", t: "from-amber-500/20 to-amber-500/5 text-amber-200" },
                      { l: "Payroll", v: "₹1.8M", t: "from-fuchsia-500/20 to-fuchsia-500/5 text-fuchsia-200" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className={`rounded-lg border border-white/10 bg-gradient-to-br ${s.t} p-2.5 text-left`}
                      >
                        <p className="text-[10px] uppercase tracking-wider text-white/60">{s.l}</p>
                        <p className="mt-0.5 text-base font-bold text-white">{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">Headcount</p>
                      {[
                        { n: "Engineering", w: "90%" },
                        { n: "Sales", w: "65%" },
                        { n: "Marketing", w: "45%" },
                      ].map((d) => (
                        <div key={d.n} className="mb-1.5">
                          <div className="flex justify-between text-[9px] text-white/50">
                            <span>{d.n}</span>
                            <span>{d.w}</span>
                          </div>
                          <div className="h-1 overflow-hidden rounded-full bg-white/5">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400" style={{ width: d.w }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3 text-left">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/70">🎂 This month</p>
                      {[
                        { n: "Aarav Singh", d: "15 Jun" },
                        { n: "Diya Patel", d: "03 Jun" },
                        { n: "Vivaan R.", d: "22 Jun" },
                      ].map((b) => (
                        <div key={b.n} className="flex items-center justify-between py-0.5 text-[10px]">
                          <span className="text-white/80">{b.n}</span>
                          <span className="text-pink-300">{b.d}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom fade to white */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white dark:to-ink-950" />
      </div>

      {/* ============================================ */}
      {/* TRUST LOGOS                                   */}
      {/* ============================================ */}
      <section className="bg-white py-12 dark:bg-ink-950">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-400">
            Built on a modern, battle-tested stack
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-slate-500">
            {["Next.js 14", "TypeScript", "Tailwind CSS", "MySQL 8", "Node.js", "JWT + bcrypt"].map((t) => (
              <span key={t} className="text-sm font-semibold transition hover:text-slate-900 dark:hover:text-slate-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES                                      */}
      {/* ============================================ */}
      <section id="features" className="relative bg-slate-50 py-24 dark:bg-ink-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
              Why PeopleHub
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">Everything HR. Nothing extra.</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              A focused, fast HR console — without the bloat of legacy enterprise software.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "eSSL biometric sync",
                desc: "Plug your eSSL / ZKTeco attendance machine into the same LAN. One click pulls all punches, aggregates check-in/out per day, and even auto-creates employees from device enrollment.",
                icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
                tone: "from-cyan-500 to-teal-500",
              },
              {
                title: "Dual-portal architecture",
                desc: "Admin console for HR + a clean self-service portal for employees. Role-based middleware enforces the boundary at the edge.",
                icon: "M16 14a4 4 0 10-8 0M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2",
                tone: "from-violet-500 to-fuchsia-500",
              },
              {
                title: "Cmd + K search",
                desc: "Find any employee, candidate, department or document in a keystroke. Group-aware results, full keyboard navigation.",
                icon: "M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z",
                tone: "from-cyan-400 to-blue-500",
              },
              {
                title: "Dark mode everywhere",
                desc: "OS-aware theme with persistent toggle. From landing to payslip — every surface looks great in either mode.",
                icon: "M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z",
                tone: "from-indigo-500 to-purple-600",
              },
              {
                title: "Payslip PDFs",
                desc: "One-click printable payslip with your company branding, earnings breakdown and net pay. Save as PDF or email.",
                icon: "M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z",
                tone: "from-emerald-400 to-teal-500",
              },
              {
                title: "Leave balances",
                desc: "Real-time balance tracking per leave type — Casual, Sick, Earned, Maternity, Paternity. Auto-deduct on approval.",
                icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z",
                tone: "from-amber-400 to-orange-500",
              },
              {
                title: "Recruitment kanban",
                desc: "Drag candidates across Applied → Screening → Interview → Offer → Hired. Switch to table view with one click.",
                icon: "M9 12h6M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2zM12 4v4h4",
                tone: "from-pink-400 to-rose-500",
              },
              {
                title: "Unified calendar",
                desc: "One monthly view layering holidays, approved leaves, birthdays and work anniversaries.",
                icon: "M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z",
                tone: "from-rose-400 to-pink-500",
              },
              {
                title: "Reports & exports",
                desc: "Headcount, payroll trend, recruitment funnel, rating distribution — and a CSV download on every dataset.",
                icon: "M9 19V6l12-3v13M9 19a3 3 0 100-6 3 3 0 000 6zm12-3a3 3 0 100-6 3 3 0 000 6z",
                tone: "from-violet-500 to-indigo-500",
              },
              {
                title: "Self-hosted & secure",
                desc: "Your MySQL. Your data. JWT in httpOnly cookies, bcrypt-hashed passwords. No vendor lock-in, ever.",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                tone: "from-slate-500 to-slate-700",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 dark:border-white/10 dark:bg-ink-800"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.tone} text-white shadow-lg`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MODULES — grouped by category                 */}
      {/* ============================================ */}
      <section id="modules" className="bg-white py-24 dark:bg-ink-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
              Modules
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">15 modules. One workspace.</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Organised the way HR actually works — by function, not feature.
            </p>
          </div>

          <div className="mt-16 space-y-10">
            {[
              {
                group: "Overview",
                color: "from-violet-500 to-fuchsia-500",
                items: [
                  { title: "Dashboard", desc: "8 live KPIs, birthdays, anniversaries, upcoming holidays, recruitment & performance snapshots." },
                  { title: "Calendar", desc: "Unified monthly view of holidays, leaves, birthdays and anniversaries." },
                  { title: "Reports", desc: "Headcount, payroll trend, recruitment funnel, attendance & rating analytics + 6 CSV exports." },
                ],
              },
              {
                group: "People",
                color: "from-cyan-500 to-blue-500",
                items: [
                  { title: "Employees", desc: "Full CRUD with 7-tab profile view, CSV import/export, DOB tracking, login provisioning." },
                  { title: "Departments", desc: "Org structure at a glance with live headcount per team." },
                  { title: "Recruitment", desc: "Kanban + table views of the hiring pipeline with stage tracking and expected-salary insights." },
                  { title: "Documents", desc: "Per-employee files — Offer Letters, Contracts, ID Proofs, Resumes, Certificates and more." },
                ],
              },
              {
                group: "Time",
                color: "from-emerald-500 to-teal-500",
                items: [
                  { title: "Attendance", desc: "Daily marking with time in/out, status, notes. One-click Mark All Present." },
                  { title: "Leaves", desc: "Apply, approve, reject. Per-employee balances per leave type with progress bars." },
                  { title: "Holidays", desc: "Year-wise grouped calendar with National / Regional / Company categories." },
                  { title: "eSSL Device Sync", desc: "Pull biometric punches from your eSSL/ZKTeco machine over LAN. Auto-create employees from device enrollment." },
                ],
              },
              {
                group: "Growth & Operations",
                color: "from-amber-500 to-orange-500",
                items: [
                  { title: "Performance", desc: "Quarterly reviews with 0–5 star ratings, strengths/improvements/goals workflow." },
                  { title: "Payroll", desc: "Auto-generate monthly payroll, editable components, printable PDF payslips per employee." },
                  { title: "Assets", desc: "Equipment tracking — laptops, phones, access cards. Assignment, status, serial numbers." },
                  { title: "Announcements", desc: "Company notice board with priority levels and department targeting." },
                ],
              },
              {
                group: "Admin & Self-service",
                color: "from-pink-500 to-rose-500",
                items: [
                  { title: "Settings", desc: "Company profile, currency, timezone, working hours, weekly off days." },
                  { title: "Self-service Portal", desc: "Employees apply leaves, download payslips, view assets & documents — without admin access." },
                ],
              },
            ].map((g) => (
              <div key={g.group}>
                <div className="mb-4 flex items-center gap-3">
                  <span className={`inline-block h-2 w-12 rounded-full bg-gradient-to-r ${g.color}`} />
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{g.group}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {g.items.map((m) => (
                    <div
                      key={m.title}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 dark:border-white/10 dark:bg-ink-800"
                    >
                      <div className={`h-1 bg-gradient-to-r ${g.color}`} />
                      <div className="p-5">
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{m.title}</h3>
                        <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">{m.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* DUAL PORTAL CALLOUT                           */}
      {/* ============================================ */}
      <section className="bg-slate-50 py-24 dark:bg-ink-900">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
              Built for two audiences
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">One app. Two portals.</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Admins see everything. Employees see what matters to them — automatically.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-ink-800">
              <div className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">HR Admin Console</p>
                <h3 className="mt-1 text-2xl font-bold">Manage the whole org</h3>
                <p className="mt-2 text-sm text-white/80">Every module. Every employee. Full read/write power.</p>
              </div>
              <ul className="space-y-2 p-6 text-sm text-slate-700 dark:text-slate-300">
                {[
                  "All 14 modules accessible",
                  "Create employee logins on the fly",
                  "Approve / reject leaves",
                  "Generate payroll for the month",
                  "Build the recruitment pipeline",
                  "Configure company settings & policies",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="mt-0.5 h-4 w-4 shrink-0 text-violet-600 dark:text-violet-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-ink-800">
              <div className="bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/80">Employee Self-Service</p>
                <h3 className="mt-1 text-2xl font-bold">Everything I need, nothing I don&apos;t</h3>
                <p className="mt-2 text-sm text-white/80">Clean, focused portal scoped to the logged-in employee only.</p>
              </div>
              <ul className="space-y-2 p-6 text-sm text-slate-700 dark:text-slate-300">
                {[
                  "See my profile, salary, tenure",
                  "Check leave balances at a glance",
                  "Apply for leaves in seconds",
                  "Download my payslips as PDF",
                  "View my assets & documents",
                  "Read company announcements",
                ].map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* WORKFLOW                                      */}
      {/* ============================================ */}
      <section id="workflow" className="bg-white py-24 dark:bg-ink-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
              How it works
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">Up and running in 5 steps.</h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {[
              { n: "01", title: "Spin up the database", desc: "Run schema.sql in MySQL Workbench. All tables + seed data ready in seconds." },
              { n: "02", title: "Create your admin", desc: "Sign up. The first account becomes the HR admin with full module access." },
              { n: "03", title: "Connect biometric device", desc: "Plug your eSSL machine into LAN, paste the IP into the eSSL Integrations page, and one click imports every enrolled user." },
              { n: "04", title: "Sync attendance", desc: "Click Sync Now — daily punches flow into HRMS as check-in / check-out automatically." },
              { n: "05", title: "Give employees access", desc: "One-click Create Login per employee. They land on a focused self-service portal." },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/10 dark:border-white/10 dark:bg-ink-800"
              >
                <span className="absolute -top-4 left-6 inline-flex h-8 items-center rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 text-xs font-bold text-white shadow-glow">
                  STEP {s.n}
                </span>
                <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA                                           */}
      {/* ============================================ */}
      <section className="bg-white py-24 dark:bg-ink-950">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative isolate overflow-hidden rounded-3xl bg-ink-950 p-10 text-center text-white shadow-2xl shadow-violet-900/30 sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-aurora-1 opacity-90" />
            <div className="pointer-events-none absolute inset-0 bg-grid-faint bg-grid-32 opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
            <h2 className="relative text-4xl font-bold sm:text-5xl">
              Ready to give your team{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                a real HRMS?
              </span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-white/70">
              15 modules. Two portals. Dark mode. Cmd+K. Payslip PDFs. eSSL biometric sync. All on your own server in under 5 minutes.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              {user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
                >
                  Open your dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-base font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-fuchsia-400"
                  >
                    Create your free account
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FAQ                                           */}
      {/* ============================================ */}
      <section id="faq" className="bg-slate-50 py-24 dark:bg-ink-900">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-sm font-semibold uppercase tracking-wider text-transparent">
              Questions
            </p>
            <h2 className="mt-2 text-4xl font-bold text-slate-900 dark:text-slate-100">Frequently asked</h2>
          </div>

          <div className="mt-12 space-y-4">
            {[
              {
                q: "Can I connect my eSSL / ZKTeco biometric machine?",
                a: "Yes — out of the box. Connect the machine to the same LAN, paste its IP into Integrations → eSSL Device, and click Test Connection. The app talks ZKTeco TCP protocol on port 4370 to pull enrolled users and punches. You can either Import Users once, or enable Auto-create so newly enrolled device users land in HRMS automatically the next time you Sync.",
              },
              {
                q: "How is the employee portal different from the admin console?",
                a: "Role-based middleware enforces it. Admin users see all 15 modules; employee users land on /me and can only see their own profile, leaves, payslips, assets, documents and reviews. They cannot reach admin pages — middleware redirects them.",
              },
              {
                q: "Where is my data stored?",
                a: "On your own MySQL server. PeopleHub never phones home — it talks only to the database you point it at in .env.local.",
              },
              {
                q: "Can I import existing employees?",
                a: "Yes — drop a CSV on the Employees page. A template is one click away, and the import is idempotent (re-running won't duplicate rows).",
              },
              {
                q: "Does dark mode work everywhere?",
                a: "Yes — landing, login, dashboard, every module page, modals, the payslip print view, even the command palette. The toggle persists across sessions and respects your OS preference on first visit.",
              },
              {
                q: "How do payslip PDFs work?",
                a: "Every payroll row has a 'Payslip' link that opens a printable A4 layout (with your company logo & branding). Hit 'Download / Print PDF' to use your browser's print-to-PDF — no PDF library needed.",
              },
              {
                q: "Are leave balances accurate?",
                a: "Yes. We compute used/pending/remaining from approved + pending leave rows in real time, per type, per year. Default allocations (Casual 12, Sick 8, Earned 15, Maternity 180, Paternity 15) are configurable in src/lib/hrms.ts.",
              },
              {
                q: "Is it really free?",
                a: "100%. Full source code is yours to run, modify, and self-host. No SaaS bills, no per-seat limits, no proprietary lock-in.",
              },
              {
                q: "What stack does it use?",
                a: "Next.js 14 App Router + TypeScript + Tailwind CSS; MySQL 8 via mysql2 connection pool; JWT auth (jose) in httpOnly cookies; bcryptjs for passwords. No ORM — plain SQL.",
              },
              {
                q: "Can I customize it?",
                a: "Yes. Plain TypeScript and plain SQL. Add a column to a table, expose it via the API route, render it in the UI. Adding a new module = schema entry + 2 API files + 1 page + a sidebar item.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-slate-200 bg-white p-5 transition open:border-violet-300 open:shadow-lg open:shadow-violet-500/10 dark:border-white/10 dark:bg-ink-800"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900 dark:text-slate-100">
                  {item.q}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5 text-slate-400 transition group-open:rotate-180 group-open:text-violet-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FOOTER                                        */}
      {/* ============================================ */}
      <footer className="relative overflow-hidden bg-ink-950 text-white">
        <div className="pointer-events-none absolute inset-0 bg-aurora-1 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-glow">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-5 w-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">PeopleHub</p>
                  <p className="text-xs text-white/50">Modern HRMS for modern teams.</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-white/60">
                Open-source, self-hosted HR management — built with Next.js, TypeScript & MySQL.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Product</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                <li><a href="#features" className="transition hover:text-white">Features</a></li>
                <li><a href="#modules" className="transition hover:text-white">All modules</a></li>
                <li><a href="#workflow" className="transition hover:text-white">How it works</a></li>
                <li><a href="#faq" className="transition hover:text-white">FAQ</a></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">For Admins</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {user ? (
                  <>
                    <li><Link href="/dashboard" className="transition hover:text-white">Dashboard</Link></li>
                    <li><Link href="/employees" className="transition hover:text-white">Employees</Link></li>
                    <li><Link href="/reports" className="transition hover:text-white">Reports</Link></li>
                    <li><Link href="/settings" className="transition hover:text-white">Settings</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href="/signup" className="transition hover:text-white">Create account</Link></li>
                    <li><Link href="/login" className="transition hover:text-white">Sign in</Link></li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">For Employees</p>
              <ul className="mt-3 space-y-1.5 text-sm text-white/70">
                {user ? (
                  <>
                    <li><Link href="/me" className="transition hover:text-white">My Profile</Link></li>
                    <li><Link href="/announcements" className="transition hover:text-white">Announcements</Link></li>
                    <li><Link href="/holidays" className="transition hover:text-white">Holidays</Link></li>
                    <li><Link href="/calendar" className="transition hover:text-white">Calendar</Link></li>
                  </>
                ) : (
                  <>
                    <li className="text-white/50">Ask your HR admin</li>
                    <li className="text-white/50">to provision a login.</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
            © {new Date().getFullYear()} PeopleHub HRMS. All rights reserved. Built with Next.js 14, TypeScript, Tailwind CSS &amp; MySQL 8.
          </div>
        </div>
      </footer>
    </div>
  );
}
