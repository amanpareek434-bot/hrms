"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import {
  computeLeaveBalances,
  formatCurrency,
  formatDate,
  initials,
  useAnnouncements,
  useAssets,
  useAttendance,
  useDocuments,
  useEmployees,
  useHolidays,
  useLeaves,
  usePayroll,
  useReviews,
} from "@/lib/hrms";
import type { LeaveType } from "@/lib/types";

const LEAVE_TYPES: LeaveType[] = ["Casual", "Sick", "Earned", "Unpaid", "Maternity", "Paternity"];

interface Me {
  uid: string;
  email: string;
  name: string;
  role: string;
  employeeId?: string;
}

export default function MePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const employeeId = me?.employeeId;

  const { data: employees } = useEmployees();
  const { data: attendance } = useAttendance();
  const { data: leaves, create: createLeave, refresh: refreshLeaves } = useLeaves();
  const { data: payroll } = usePayroll();
  const { data: assets } = useAssets();
  const { data: documents } = useDocuments(employeeId);
  const { data: announcements } = useAnnouncements();
  const { data: holidays } = useHolidays();
  const { data: reviews } = useReviews();

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: "Casual" as LeaveType,
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <>
        <Header title="Loading…" />
        <div className="p-6 text-sm text-slate-500">Fetching your profile…</div>
      </>
    );
  }

  if (!me) {
    return (
      <>
        <Header title="Not signed in" />
        <div className="p-6">
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
        </div>
      </>
    );
  }

  if (!employeeId) {
    return (
      <>
        <Header title="Welcome" subtitle={me.name} />
        <div className="p-6">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">No employee record linked</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Your account is not linked to an employee profile yet. Ask your HR admin to create an employee login from the Employees page.
            </p>
          </div>
        </div>
      </>
    );
  }

  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) {
    return (
      <>
        <Header title="Welcome" subtitle={me.name} />
        <div className="p-6">
          <div className="card">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your linked employee record was not found. Please contact HR.
            </p>
          </div>
        </div>
      </>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const empAttendance = attendance.filter((a) => a.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date));
  const empLeaves = leaves.filter((l) => l.employeeId === employeeId).sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
  const empPayroll = payroll.filter((p) => p.employeeId === employeeId).sort((a, b) => b.month.localeCompare(a.month));
  const empAssets = assets.filter((a) => a.assignedTo === employeeId);
  const empReviews = reviews.filter((r) => r.employeeId === employeeId).sort((a, b) => b.period.localeCompare(a.period));

  const balances = computeLeaveBalances(employeeId, leaves);

  // Last 30-day attendance
  const cutoff = Date.now() - 30 * 86400000;
  const last30 = empAttendance.filter((a) => new Date(a.date).getTime() >= cutoff);
  const present30 = last30.filter((a) => a.status === "Present").length;

  const today = new Date().toISOString().slice(0, 10);
  const inSixtyDays = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
  const upcomingHolidays = holidays.filter((h) => h.date >= today && h.date <= inSixtyDays).slice(0, 4);

  const ytdNet = empPayroll.filter((p) => p.paid).reduce((s, p) => s + p.net, 0);

  async function submitLeave(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setSubmitting(true);
    try {
      await createLeave({
        employeeId,
        type: leaveForm.type,
        fromDate: leaveForm.fromDate,
        toDate: leaveForm.toDate,
        reason: leaveForm.reason,
        status: "Pending",
      });
      setLeaveOpen(false);
      setLeaveForm({ type: "Casual", fromDate: today, toDate: today, reason: "" });
      await refreshLeaves();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title={`Hi, ${employee.firstName} 👋`}
        subtitle={`${employee.designation} · ${employee.department}`}
        actions={
          <>
            <Link
              href="/me/punch"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:from-emerald-400 hover:to-cyan-400"
            >
              🔵 Punch In
            </Link>
            <button className="btn-primary" onClick={() => setLeaveOpen(true)}>
              Apply Leave
            </button>
          </>
        }
      />

      <div className="space-y-6 p-6">
        {/* Profile + KPIs */}
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-glow">
                {initials(fullName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">{fullName}</h1>
                <p className="text-sm text-slate-600 dark:text-slate-400">{employee.designation}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {employee.email} {employee.phone ? `· ${employee.phone}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="badge-blue">{employee.employeeCode}</span>
                  <span className="badge-slate">{employee.department}</span>
                  <span className="badge-green">{employee.status}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Present (30d)" value={String(present30)} />
              <Stat label="Salary" value={formatCurrency(employee.salary)} />
              <Stat label="Joined" value={formatDate(employee.joiningDate)} />
              <Stat label="Paid YTD" value={formatCurrency(ytdNet)} />
            </div>
          </div>
        </section>

        {/* Leave balances */}
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Leave Balances · {new Date().getFullYear()}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {balances.map((b) => {
              const pct = b.allocated === Infinity ? 100 : Math.max(0, (b.remaining / b.allocated) * 100);
              return (
                <div key={b.type} className="rounded-xl border border-slate-200 p-4 dark:border-white/5">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{b.type}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {b.allocated === Infinity ? "∞" : b.remaining}
                    {b.allocated !== Infinity ? <span className="text-xs font-normal text-slate-400"> / {b.allocated}</span> : null}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {b.used} used{b.pending > 0 ? ` · ${b.pending} pending` : ""}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-100 dark:bg-white/5">
                    <div
                      className={`h-full rounded-full ${pct < 25 ? "bg-rose-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* My leaves + announcements */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">My Leave Requests</h2>
              <Link href="/me/leaves" className="text-xs text-brand-600 hover:underline dark:text-brand-300">
                See all
              </Link>
            </div>
            {empLeaves.length === 0 ? (
              <p className="text-sm text-slate-500">No leave requests.</p>
            ) : (
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Days</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {empLeaves.slice(0, 5).map((l) => {
                    const days = Math.max(1, Math.round((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / 86400000) + 1);
                    return (
                      <tr key={l.id}>
                        <td>{l.type}</td>
                        <td>{formatDate(l.fromDate)}</td>
                        <td>{formatDate(l.toDate)}</td>
                        <td>{days}</td>
                        <td>
                          <StatusBadge status={l.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">📣 Latest Announcements</h2>
            <div className="space-y-3">
              {announcements.slice(0, 3).map((a) => (
                <div key={a.id} className="rounded-lg border border-slate-100 p-3 dark:border-white/5">
                  <PriorityBadge p={a.priority} />
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{a.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{a.body}</p>
                </div>
              ))}
              {announcements.length === 0 ? <p className="text-sm text-slate-500">No announcements.</p> : null}
            </div>
          </div>
        </section>

        {/* Payslips */}
        <section className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">My Payslips</h2>
            <Link href="/me/payslips" className="text-xs text-brand-600 hover:underline dark:text-brand-300">
              See all
            </Link>
          </div>
          {empPayroll.length === 0 ? (
            <p className="text-sm text-slate-500">No payslips yet.</p>
          ) : (
            <table className="table-base">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {empPayroll.slice(0, 6).map((p) => (
                  <tr key={p.id}>
                    <td className="font-medium">{p.month}</td>
                    <td>{formatCurrency(p.basic)}</td>
                    <td>{formatCurrency(p.hra)}</td>
                    <td>{formatCurrency(p.allowances)}</td>
                    <td>{formatCurrency(p.deductions)}</td>
                    <td className="font-semibold">{formatCurrency(p.net)}</td>
                    <td>{p.paid ? <span className="badge-green">Paid</span> : <span className="badge-amber">Pending</span>}</td>
                    <td className="text-right">
                      <Link href={`/payroll/payslip/${p.id}`} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                        Payslip →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Holidays + Assets + Docs + Reviews */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">🌴 Upcoming Holidays</h2>
            <div className="space-y-2">
              {upcomingHolidays.length === 0 ? (
                <p className="text-sm text-slate-500">No holidays in the next 60 days.</p>
              ) : (
                upcomingHolidays.map((h) => (
                  <div key={h.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2 dark:border-white/5">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{h.name}</p>
                      <p className="text-xs text-slate-500">{formatDate(h.date)} · {h.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">💻 My Assets</h2>
            {empAssets.length === 0 ? (
              <p className="text-sm text-slate-500">No assets assigned.</p>
            ) : (
              <div className="space-y-2">
                {empAssets.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-100 p-3 dark:border-white/5">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{a.name}</p>
                    <p className="text-xs text-slate-500">{a.category} · {a.serialNo || "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">📄 My Documents</h2>
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">No documents.</p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {documents.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{d.title}</p>
                      <p className="text-xs text-slate-500">{d.category} · {formatDate(d.uploadedOn)}</p>
                    </div>
                    {d.fileUrl ? (
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-300">
                        Open →
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">⭐ My Reviews</h2>
            {empReviews.length === 0 ? (
              <p className="text-sm text-slate-500">No reviews yet.</p>
            ) : (
              empReviews.slice(0, 3).map((r) => (
                <div key={r.id} className="mb-3 rounded-lg border border-slate-100 p-3 dark:border-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.period}</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{(r.rating || 0).toFixed(1)}<span className="text-xs font-normal text-slate-500"> / 5</span></p>
                  </div>
                  <p className="text-xs text-slate-500">Reviewer: {r.reviewer || "—"} · {r.status}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Modal open={leaveOpen} onClose={() => setLeaveOpen(false)} title="Apply for Leave">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submitLeave}>
          <div>
            <label className="label">Type</label>
            <select className="input" value={leaveForm.type} onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value as LeaveType })}>
              {LEAVE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>{/* spacer */}</div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={leaveForm.fromDate} onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} required />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={leaveForm.toDate} onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Reason</label>
            <textarea className="input" rows={3} value={leaveForm.reason} onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setLeaveOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Request"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3 dark:border-white/5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "badge-green",
    Pending: "badge-amber",
    Rejected: "badge-rose",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    Low: "badge-slate",
    Normal: "badge-blue",
    High: "badge-amber",
    Urgent: "badge-rose",
  };
  return <span className={map[p] || "badge-slate"}>{p}</span>;
}
