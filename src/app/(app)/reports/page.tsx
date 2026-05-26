"use client";

import { useMemo } from "react";
import Header from "@/components/Header";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  formatCurrency,
  useAssets,
  useAttendance,
  useCandidates,
  useDepartments,
  useEmployees,
  useLeaves,
  usePayroll,
  useReviews,
} from "@/lib/hrms";

export default function ReportsPage() {
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: attendance } = useAttendance();
  const { data: leaves } = useLeaves();
  const { data: payroll } = usePayroll();
  const { data: candidates } = useCandidates();
  const { data: assets } = useAssets();
  const { data: reviews } = useReviews();

  // Headcount by department
  const headcount = useMemo(
    () => departments.map((d) => ({ name: d.name, count: employees.filter((e) => e.department === d.name).length })).sort((a, b) => b.count - a.count),
    [departments, employees],
  );
  const maxHead = Math.max(1, ...headcount.map((h) => h.count));

  // Headcount by status
  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    employees.forEach((e) => (map[e.status] = (map[e.status] || 0) + 1));
    return Object.entries(map);
  }, [employees]);

  // Payroll by month (last 6 months)
  const payrollMonths = useMemo(() => {
    const map: Record<string, { total: number; paid: number }> = {};
    payroll.forEach((p) => {
      map[p.month] = map[p.month] || { total: 0, paid: 0 };
      map[p.month].total += p.net;
      if (p.paid) map[p.month].paid += p.net;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a)).slice(0, 6).reverse();
  }, [payroll]);
  const maxMonth = Math.max(1, ...payrollMonths.map(([, v]) => v.total));

  // Top earners
  const topEarners = useMemo(
    () => [...employees].filter((e) => e.status === "Active").sort((a, b) => b.salary - a.salary).slice(0, 5),
    [employees],
  );

  // Recruitment funnel
  const funnel = useMemo(() => {
    const stages = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"] as const;
    return stages.map((s) => ({ stage: s, count: candidates.filter((c) => c.stage === s).length }));
  }, [candidates]);
  const totalCand = candidates.length || 1;

  // Leave breakdown
  const leaveByType = useMemo(() => {
    const map: Record<string, number> = {};
    leaves.forEach((l) => (map[l.type] = (map[l.type] || 0) + 1));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [leaves]);

  // Performance distribution
  const ratingBuckets = useMemo(() => {
    const buckets = [
      { range: "4.5 – 5.0", min: 4.5, max: 5.0, count: 0 },
      { range: "4.0 – 4.5", min: 4.0, max: 4.5, count: 0 },
      { range: "3.5 – 4.0", min: 3.5, max: 4.0, count: 0 },
      { range: "3.0 – 3.5", min: 3.0, max: 3.5, count: 0 },
      { range: "< 3.0", min: 0, max: 3.0, count: 0 },
    ];
    reviews.forEach((r) => {
      const v = r.rating || 0;
      const b = buckets.find((b) => v >= b.min && (v < b.max || (b.max === 5.0 && v <= 5.0)));
      if (b) b.count++;
    });
    return buckets;
  }, [reviews]);

  // Asset utilization
  const assetByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    assets.forEach((a) => (map[a.status] = (map[a.status] || 0) + 1));
    return Object.entries(map);
  }, [assets]);

  // Attendance summary (last 30 days)
  const attendance30 = useMemo(() => {
    const map: Record<string, number> = { Present: 0, Absent: 0, "Half Day": 0, Leave: 0, Holiday: 0 };
    const cutoff = Date.now() - 30 * 86400000;
    attendance.forEach((a) => {
      if (new Date(a.date).getTime() >= cutoff) {
        map[a.status] = (map[a.status] || 0) + 1;
      }
    });
    return Object.entries(map);
  }, [attendance]);

  function downloadAll(name: string, rows: Record<string, unknown>[]) {
    downloadCSV(`${name}-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <>
      <Header
        title="Reports"
        subtitle="Cross-module analytics with one-click CSV exports"
        actions={
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary text-xs" onClick={() => downloadAll("employees", employees as unknown as Record<string, unknown>[])}>
              ⬇ Employees
            </button>
            <button className="btn-secondary text-xs" onClick={() => downloadAll("attendance", attendance as unknown as Record<string, unknown>[])}>
              ⬇ Attendance
            </button>
            <button className="btn-secondary text-xs" onClick={() => downloadAll("leaves", leaves as unknown as Record<string, unknown>[])}>
              ⬇ Leaves
            </button>
            <button className="btn-secondary text-xs" onClick={() => downloadAll("payroll", payroll as unknown as Record<string, unknown>[])}>
              ⬇ Payroll
            </button>
            <button className="btn-secondary text-xs" onClick={() => downloadAll("candidates", candidates as unknown as Record<string, unknown>[])}>
              ⬇ Candidates
            </button>
            <button className="btn-secondary text-xs" onClick={() => downloadAll("reviews", reviews as unknown as Record<string, unknown>[])}>
              ⬇ Reviews
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* High-level KPIs */}
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Kpi label="Total Employees" value={employees.length} sub={`${employees.filter((e) => e.status === "Active").length} active`} tone="brand" />
          <Kpi label="Departments" value={departments.length} sub={`${headcount[0]?.name || "—"} largest`} tone="emerald" />
          <Kpi label="Total Payroll" value={formatCurrency(payroll.reduce((s, p) => s + p.net, 0))} sub={`${payroll.length} entries`} tone="amber" />
          <Kpi label="Open Pipeline" value={candidates.filter((c) => c.stage !== "Hired" && c.stage !== "Rejected").length} sub={`${candidates.length} total candidates`} tone="rose" />
        </section>

        {/* Department headcount */}
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Headcount by Department</h2>
          {headcount.length === 0 ? (
            <p className="text-sm text-slate-500">No data.</p>
          ) : (
            <div className="space-y-3">
              {headcount.map((h) => (
                <div key={h.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{h.name}</span>
                    <span className="text-slate-500">{h.count}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-500 to-fuchsia-500"
                      style={{ width: `${(h.count / maxHead) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Two-column row */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Payroll Trend (last 6 months)</h2>
            {payrollMonths.length === 0 ? (
              <p className="text-sm text-slate-500">No payroll data.</p>
            ) : (
              <div className="flex h-48 items-end gap-3">
                {payrollMonths.map(([month, v]) => (
                  <div key={month} className="flex flex-1 flex-col items-center">
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-500 to-fuchsia-500"
                      style={{ height: `${(v.total / maxMonth) * 100}%`, minHeight: "4px" }}
                      title={`${month}: ${formatCurrency(v.total)}`}
                    />
                    <p className="mt-2 text-[10px] font-medium text-slate-600">{month.slice(5)}</p>
                    <p className="text-[10px] text-slate-400">{formatCurrency(v.total).replace("₹", "₹")}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Recruitment Funnel</h2>
            <div className="space-y-2">
              {funnel.map((f) => {
                const pct = (f.count / totalCand) * 100;
                return (
                  <div key={f.stage}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{f.stage}</span>
                      <span className="text-slate-500">{f.count}</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          f.stage === "Hired"
                            ? "bg-emerald-500"
                            : f.stage === "Rejected"
                            ? "bg-slate-400"
                            : f.stage === "Offer"
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
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Status Mix</h2>
            <ul className="space-y-2">
              {byStatus.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-sm">
                  <span className="text-slate-700">{k}</span>
                  <span className="font-semibold text-slate-900">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Leave Type Breakdown</h2>
            {leaveByType.length === 0 ? (
              <p className="text-sm text-slate-500">No leaves yet.</p>
            ) : (
              <ul className="space-y-2">
                {leaveByType.map(([type, count]) => (
                  <li key={type} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-sm">
                    <span className="text-slate-700">{type}</span>
                    <span className="font-semibold text-slate-900">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Asset Utilization</h2>
            <ul className="space-y-2">
              {assetByStatus.map(([k, v]) => (
                <li key={k} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 text-sm">
                  <span className="text-slate-700">{k}</span>
                  <span className="font-semibold text-slate-900">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Performance Rating Distribution</h2>
            <div className="space-y-2">
              {ratingBuckets.map((b) => {
                const maxC = Math.max(1, ...ratingBuckets.map((x) => x.count));
                return (
                  <div key={b.range}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{b.range}</span>
                      <span className="text-slate-500">{b.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500"
                        style={{ width: `${(b.count / maxC) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Attendance (last 30 days)</h2>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {attendance30.map(([k, v]) => (
                <div key={k} className="rounded-lg border border-slate-100 p-3 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">{k}</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-slate-900">Top Earners</h2>
          {topEarners.length === 0 ? (
            <p className="text-sm text-slate-500">No employees yet.</p>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Salary</th>
                </tr>
              </thead>
              <tbody>
                {topEarners.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <p className="font-medium text-slate-900">
                        {e.firstName} {e.lastName}
                      </p>
                      <p className="text-xs text-slate-500">{e.employeeCode}</p>
                    </td>
                    <td>{e.department}</td>
                    <td>{e.designation}</td>
                    <td className="font-semibold">{formatCurrency(e.salary)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string | number; sub?: string; tone: "emerald" | "amber" | "brand" | "rose" }) {
  const map = {
    emerald: "from-emerald-50 to-white border-emerald-200",
    amber: "from-amber-50 to-white border-amber-200",
    brand: "from-brand-50 to-white border-brand-200",
    rose: "from-rose-50 to-white border-rose-200",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${map[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </div>
  );
}
