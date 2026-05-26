"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { computeLeaveBalances, formatDate, useLeaves } from "@/lib/hrms";
import type { LeaveType } from "@/lib/types";

const TYPES: LeaveType[] = ["Casual", "Sick", "Earned", "Unpaid", "Maternity", "Paternity"];

interface Me {
  uid: string;
  role: string;
  employeeId?: string;
}

export default function MyLeavesPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: leaves, create, remove, refresh } = useLeaves();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "Casual" as LeaveType,
    fromDate: new Date().toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <PageMsg msg="Loading…" />;
  if (!me?.employeeId) return <PageMsg msg="Your account is not linked to an employee." back />;

  const employeeId = me.employeeId;
  const myLeaves = leaves
    .filter((l) => l.employeeId === employeeId)
    .filter((l) => statusFilter === "All" || l.status === statusFilter)
    .sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));

  const balances = computeLeaveBalances(employeeId, leaves);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId) return;
    setSubmitting(true);
    try {
      await create({
        employeeId,
        type: form.type,
        fromDate: form.fromDate,
        toDate: form.toDate,
        reason: form.reason,
        status: "Pending",
      });
      setOpen(false);
      setForm({ type: "Casual", fromDate: new Date().toISOString().slice(0, 10), toDate: new Date().toISOString().slice(0, 10), reason: "" });
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelLeave(id: string) {
    if (!confirm("Cancel this leave request?")) return;
    try {
      await remove(id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="My Leaves"
        subtitle={`${myLeaves.length} request${myLeaves.length === 1 ? "" : "s"}`}
        actions={
          <>
            <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              Apply Leave
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        <section className="card">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-slate-100">
            Balances · {new Date().getFullYear()}
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

        <section className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((l) => {
                  const days = Math.max(1, Math.round((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / 86400000) + 1);
                  return (
                    <tr key={l.id}>
                      <td>{l.type}</td>
                      <td>{formatDate(l.fromDate)}</td>
                      <td>{formatDate(l.toDate)}</td>
                      <td>{days}</td>
                      <td className="max-w-md truncate text-slate-600" title={l.reason}>
                        {l.reason || "—"}
                      </td>
                      <td>{formatDate(l.appliedOn)}</td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="text-right">
                        {l.status === "Pending" ? (
                          <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => cancelLeave(l.id)}>
                            Cancel
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {myLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No leave requests.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div>
          <Link href="/me" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
            ← Back to profile
          </Link>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Apply for Leave">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
          <div className="md:col-span-2">
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input type="date" className="input" value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} required />
          </div>
          <div>
            <label className="label">To</label>
            <input type="date" className="input" value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Reason</label>
            <textarea className="input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "badge-green",
    Pending: "badge-amber",
    Rejected: "badge-rose",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

function PageMsg({ msg, back }: { msg: string; back?: boolean }) {
  return (
    <>
      <Header title="My Leaves" />
      <div className="p-6 text-sm text-slate-500">
        <p>{msg}</p>
        {back ? (
          <Link href="/me" className="mt-2 inline-block text-brand-600 hover:underline">
            ← Back
          </Link>
        ) : null}
      </div>
    </>
  );
}
