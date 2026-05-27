"use client";

import Header from "@/components/Header";
import StatCard from "@/components/StatCard";
import {
  formatCurrency,
  formatDate,
  initials,
  useAnnouncements,
  useAssets,
  useAttendance,
  useCandidates,
  useDepartments,
  useEmployees,
  useExpenses,
  useHolidays,
  useLeaves,
  usePayroll,
  useReviews,
} from "@/lib/hrms";
import type { AnnouncementPriority, ReviewStatus } from "@/lib/types";

export default function DashboardPage() {
  const { data: employees } = useEmployees();
  const { data: attendance } = useAttendance();
  const { data: leaves } = useLeaves();
  const { data: departments } = useDepartments();
  const { data: payroll } = usePayroll();
  const { data: announcements } = useAnnouncements();
  const { data: holidays } = useHolidays();
  const { data: assets } = useAssets();
  const { data: candidates } = useCandidates();
  const { data: reviews } = useReviews();
  const { data: expenses } = useExpenses();

  const today = new Date().toISOString().slice(0, 10);
  const todaysAttendance = attendance.filter((a) => a.date === today);
  const presentToday = todaysAttendance.filter((a) => a.status === "Present").length;
  const onLeaveToday = todaysAttendance.filter((a) => a.status === "Leave").length;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending");
  const payrollTotal = payroll.reduce((sum, p) => sum + p.net, 0);

  const deptCounts = departments.map((d) => ({
    name: d.name,
    count: employees.filter((e) => e.department === d.name).length,
  }));
  const maxDept = Math.max(1, ...deptCounts.map((d) => d.count));

  // Birthdays this month
  const thisMonth = new Date().getMonth();
  const birthdaysThisMonth = employees
    .filter((e) => e.dateOfBirth && new Date(e.dateOfBirth).getMonth() === thisMonth)
    .sort((a, b) => {
      const da = a.dateOfBirth ? new Date(a.dateOfBirth).getDate() : 0;
      const db = b.dateOfBirth ? new Date(b.dateOfBirth).getDate() : 0;
      return da - db;
    });

  // Work anniversaries this month
  const anniversariesThisMonth = employees
    .filter((e) => e.joiningDate && new Date(e.joiningDate).getMonth() === thisMonth)
    .sort((a, b) => new Date(a.joiningDate).getDate() - new Date(b.joiningDate).getDate());

  // Upcoming holidays (next 60 days)
  const inSixtyDays = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
  const upcomingHolidays = holidays
    .filter((h) => h.date >= today && h.date <= inSixtyDays)
    .slice(0, 4);

  // Latest announcement
  const latestAnnouncement = announcements[0];

  // Recruitment pipeline (excluding hired & rejected)
  const activeCandidates = candidates.filter((c) => c.stage !== "Hired" && c.stage !== "Rejected");

  // Asset utilization
  const assignedAssets = assets.filter((a) => a.status === "Assigned").length;
  const assetUtilization = assets.length ? Math.round((assignedAssets / assets.length) * 100) : 0;

  // Pending reviews (Draft + Submitted)
  const pendingReviews = reviews.filter((r) => r.status !== "Acknowledged").length;

  // Expenses awaiting approval
  const pendingExpenses = expenses.filter((e) => e.status === "Pending");
  const pendingExpensesAmt = pendingExpenses.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <>
      <Header title="Dashboard" subtitle="Overview of your organization" />
      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {latestAnnouncement ? (
          <section
            className={`relative overflow-hidden rounded-xl border p-5 shadow-card ${
              latestAnnouncement.priority === "Urgent"
                ? "border-rose-200 bg-gradient-to-br from-rose-50 to-white"
                : latestAnnouncement.priority === "High"
                ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white"
                : "border-brand-200 bg-gradient-to-br from-brand-50 to-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={latestAnnouncement.priority} />
                  <span className="text-xs text-slate-500">
                    Posted {formatDate(latestAnnouncement.postedAt?.slice(0, 10))}
                  </span>
                </div>
                <h2 className="mt-2 text-base font-semibold text-slate-900">{latestAnnouncement.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-700">{latestAnnouncement.body}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Employees"
            value={employees.length}
            delta={`${employees.filter((e) => e.status === "Active").length} active`}
            tone="brand"
            icon={<Icon path="M16 14a4 4 0 10-8 0M12 12a4 4 0 100-8 4 4 0 000 8zM4 21v-2a4 4 0 014-4h8a4 4 0 014 4v2" />}
          />
          <StatCard
            label="Present Today"
            value={presentToday}
            delta={`${todaysAttendance.length} marked · ${onLeaveToday} on leave`}
            tone="emerald"
            icon={<Icon path="M5 13l4 4L19 7" />}
          />
          <StatCard
            label="Open Positions"
            value={activeCandidates.length}
            delta={`${candidates.filter((c) => c.stage === "Offer").length} at offer stage`}
            tone="amber"
            icon={<Icon path="M9 12h6M9 16h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2zM12 4v4h4" />}
          />
          <StatCard
            label="Monthly Payroll"
            value={formatCurrency(payrollTotal)}
            delta={`${payroll.filter((p) => p.paid).length}/${payroll.length} paid`}
            tone="rose"
            icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v2M5 12a7 7 0 1014 0 7 7 0 00-14 0z" />}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pending Leaves"
            value={pendingLeaves.length}
            delta="Awaiting approval"
            tone="amber"
            icon={<Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />}
          />
          <StatCard
            label="Asset Utilization"
            value={`${assetUtilization}%`}
            delta={`${assignedAssets}/${assets.length} assigned`}
            tone="brand"
            icon={<Icon path="M20 7H4a2 2 0 00-2 2v9a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />}
          />
          <StatCard
            label="Pending Reviews"
            value={pendingReviews}
            delta={`${reviews.length} total this cycle`}
            tone="rose"
            icon={<Icon path="M9 19V6l12-3v13M9 19a3 3 0 100-6 3 3 0 000 6zm12-3a3 3 0 100-6 3 3 0 000 6z" />}
          />
          <StatCard
            label="Pending Expenses"
            value={pendingExpenses.length}
            delta={pendingExpenses.length ? formatCurrency(pendingExpensesAmt) : "All clear"}
            tone="amber"
            icon={<Icon path="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m10 4H9a2 2 0 01-2-2v-6a2 2 0 012-2h10a2 2 0 012 2v6a2 2 0 01-2 2zm-7-5a2 2 0 11-4 0 2 2 0 014 0z" />}
          />
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Holidays Ahead"
            value={upcomingHolidays.length}
            delta="Next 60 days"
            tone="emerald"
            icon={<Icon path="M8 7V3m8 4V3M3 11h18M5 5h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Department Headcount</h2>
              <span className="text-xs text-slate-500">{employees.length} employees</span>
            </div>
            <div className="space-y-3">
              {deptCounts.length === 0 ? (
                <p className="text-sm text-slate-500">No departments yet.</p>
              ) : (
                deptCounts.map((d) => (
                  <div key={d.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{d.name}</span>
                      <span className="text-slate-500">{d.count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500"
                        style={{ width: `${(d.count / maxDept) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Pending Leave Requests</h2>
            <div className="space-y-3">
              {pendingLeaves.length === 0 ? (
                <p className="text-sm text-slate-500">No pending requests.</p>
              ) : (
                pendingLeaves.slice(0, 5).map((l) => {
                  const emp = employees.find((e) => e.id === l.employeeId);
                  const name = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
                  return (
                    <div key={l.id} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                        {initials(name)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">
                          {l.type} · {formatDate(l.fromDate)} → {formatDate(l.toDate)}
                        </p>
                      </div>
                      <span className="badge-amber">Pending</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">🎂 Birthdays this month</h2>
            <div className="space-y-2">
              {birthdaysThisMonth.length === 0 ? (
                <p className="text-sm text-slate-500">No birthdays this month.</p>
              ) : (
                birthdaysThisMonth.map((e) => {
                  const dob = e.dateOfBirth ? new Date(e.dateOfBirth) : null;
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-xs font-semibold text-pink-700">
                        {initials(`${e.firstName} ${e.lastName}`)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {e.firstName} {e.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{e.department}</p>
                      </div>
                      <span className="text-xs font-semibold text-pink-600">
                        {dob ? dob.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : ""}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">🎉 Work anniversaries</h2>
            <div className="space-y-2">
              {anniversariesThisMonth.length === 0 ? (
                <p className="text-sm text-slate-500">No anniversaries this month.</p>
              ) : (
                anniversariesThisMonth.map((e) => {
                  const joined = e.joiningDate ? new Date(e.joiningDate) : null;
                  const years = joined ? new Date().getFullYear() - joined.getFullYear() : 0;
                  return (
                    <div key={e.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                        {initials(`${e.firstName} ${e.lastName}`)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {e.firstName} {e.lastName}
                        </p>
                        <p className="text-xs text-slate-500">{e.designation}</p>
                      </div>
                      <span className="text-xs font-semibold text-emerald-600">
                        {years > 0 ? `${years} yr${years === 1 ? "" : "s"}` : "Joined"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">🌴 Upcoming holidays</h2>
            <div className="space-y-2">
              {upcomingHolidays.length === 0 ? (
                <p className="text-sm text-slate-500">No holidays in the next 60 days.</p>
              ) : (
                upcomingHolidays.map((h) => {
                  const days = Math.round((new Date(h.date).getTime() - new Date(today).getTime()) / 86400000);
                  return (
                    <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{h.name}</p>
                        <p className="text-xs text-slate-500">
                          {formatDate(h.date)} · {h.type}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-brand-600">
                        {days === 0 ? "Today" : `${days}d`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recruitment Pipeline</h2>
              <span className="text-xs text-slate-500">{candidates.length} candidates</span>
            </div>
            <div className="space-y-2">
              {(["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"] as const).map((stage) => {
                const count = candidates.filter((c) => c.stage === stage).length;
                const pct = candidates.length ? (count / candidates.length) * 100 : 0;
                return (
                  <div key={stage}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{stage}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          stage === "Hired"
                            ? "bg-emerald-500"
                            : stage === "Rejected"
                            ? "bg-slate-400"
                            : stage === "Offer"
                            ? "bg-amber-500"
                            : "bg-brand-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Performance Snapshot</h2>
              <span className="text-xs text-slate-500">{reviews.length} reviews</span>
            </div>
            <div className="space-y-2">
              {(["Draft", "Submitted", "Acknowledged"] as ReviewStatus[]).map((status) => {
                const count = reviews.filter((r) => r.status === status).length;
                const pct = reviews.length ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{status}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          status === "Acknowledged" ? "bg-emerald-500" : status === "Submitted" ? "bg-brand-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg border border-slate-100 p-3">
              <p className="text-xs uppercase tracking-wider text-slate-500">Avg rating</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {(() => {
                  const rated = reviews.filter((r) => r.rating && r.rating > 0);
                  if (rated.length === 0) return "—";
                  return (rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length).toFixed(2);
                })()}
                <span className="text-sm font-normal text-slate-500"> / 5</span>
              </p>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900">Recent Employees</h2>
            <span className="text-xs text-slate-500">Newest joins</span>
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...employees]
                  .sort((a, b) => (b.joiningDate || "").localeCompare(a.joiningDate || ""))
                  .slice(0, 5)
                  .map((e) => (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {initials(`${e.firstName} ${e.lastName}`)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {e.firstName} {e.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700">{e.department}</td>
                      <td className="text-slate-700">{e.designation}</td>
                      <td className="text-slate-700">{formatDate(e.joiningDate)}</td>
                      <td>
                        <StatusBadge status={e.status} />
                      </td>
                    </tr>
                  ))}
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-sm text-slate-500">
                      No employees yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "badge-green",
    "On Leave": "badge-amber",
    Resigned: "badge-slate",
    Terminated: "badge-rose",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  const map: Record<AnnouncementPriority, string> = {
    Low: "badge-slate",
    Normal: "badge-blue",
    High: "badge-amber",
    Urgent: "badge-rose",
  };
  return <span className={map[priority]}>{priority}</span>;
}
