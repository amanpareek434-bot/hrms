"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { downloadCSV, toCSV } from "@/lib/csv";
import { formatDate, initials, useEmployees, useLeaves } from "@/lib/hrms";
import type { LeaveRequest, LeaveStatus, LeaveType } from "@/lib/types";

const TYPES: LeaveType[] = ["Casual", "Sick", "Earned", "Unpaid", "Maternity", "Paternity"];
const STATUSES: LeaveStatus[] = ["Pending", "Approved", "Rejected"];

const EMPTY: Omit<LeaveRequest, "id" | "appliedOn"> = {
  employeeId: "",
  type: "Casual",
  fromDate: new Date().toISOString().slice(0, 10),
  toDate: new Date().toISOString().slice(0, 10),
  reason: "",
  status: "Pending",
};

export default function LeavesPage() {
  const { data: leaves, create, setStatus, remove } = useLeaves();
  const { data: employees } = useEmployees();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (statusFilter === "All") return leaves;
    return leaves.filter((l) => l.status === statusFilter);
  }, [leaves, statusFilter]);

  function dayCount(from: string, to: string) {
    const ms = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(1, Math.round(ms / 86400000) + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId) return;
    setSubmitting(true);
    try {
      await create(form);
      setForm(EMPTY);
      setModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  function handleExport() {
    const rows = leaves.map((l) => {
      const emp = employees.find((e) => e.id === l.employeeId);
      return {
        employeeCode: emp?.employeeCode ?? "",
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        type: l.type,
        fromDate: l.fromDate,
        toDate: l.toDate,
        days: dayCount(l.fromDate, l.toDate),
        reason: l.reason,
        status: l.status,
        appliedOn: l.appliedOn,
      };
    });
    downloadCSV(`leaves-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <>
      <Header
        title="Leave Management"
        subtitle={`${leaves.length} requests · ${leaves.filter((l) => l.status === "Pending").length} pending`}
        actions={
          <>
            <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn-primary" onClick={() => setModalOpen(true)}>
              New Leave Request
            </button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => {
                  const emp = employees.find((e) => e.id === l.employeeId);
                  const name = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
                  return (
                    <tr key={l.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {initials(name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500">{emp?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700">{l.type}</td>
                      <td className="text-slate-700">{formatDate(l.fromDate)}</td>
                      <td className="text-slate-700">{formatDate(l.toDate)}</td>
                      <td className="font-medium text-slate-900">{dayCount(l.fromDate, l.toDate)}</td>
                      <td className="max-w-xs truncate text-slate-600" title={l.reason}>
                        {l.reason || "—"}
                      </td>
                      <td>
                        <StatusBadge status={l.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          {l.status === "Pending" ? (
                            <>
                              <button className="btn-ghost px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50" onClick={() => setStatus(l.id, "Approved")}>
                                Approve
                              </button>
                              <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => setStatus(l.id, "Rejected")}>
                                Reject
                              </button>
                            </>
                          ) : (
                            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => setStatus(l.id, "Pending")}>
                              Reset
                            </button>
                          )}
                          <button
                            className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                            onClick={() => {
                              if (confirm("Delete this leave request?")) remove(l.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No leave requests found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Leave Request">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Employee</label>
            <select className="input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required>
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} · {emp.employeeCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Leave Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LeaveType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as LeaveStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
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
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
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
