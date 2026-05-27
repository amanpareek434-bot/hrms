"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { downloadCSV, toCSV } from "@/lib/csv";
import {
  formatCurrency,
  formatDate,
  initials,
  useEmployees,
  useExpenses,
} from "@/lib/hrms";
import type {
  Expense,
  ExpenseCategory,
  ExpenseStatus,
} from "@/lib/types";

const CATEGORIES: ExpenseCategory[] = [
  "Travel",
  "Food",
  "Accommodation",
  "Internet",
  "Phone",
  "Office Supplies",
  "Client Entertainment",
  "Training",
  "Medical",
  "Other",
];

const STATUSES: ExpenseStatus[] = ["Pending", "Approved", "Rejected", "Reimbursed"];

const EMPTY: Omit<Expense, "id" | "createdAt"> = {
  employeeId: "",
  expenseDate: new Date().toISOString().slice(0, 10),
  category: "Travel",
  amount: 0,
  currency: "INR",
  merchant: "",
  description: "",
  attachmentUrl: "",
  status: "Pending",
};

export default function ExpensesPage() {
  const { data: expenses, create, update, setStatus, remove } = useExpenses();
  const { data: employees } = useEmployees();
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (categoryFilter !== "All" && e.category !== categoryFilter) return false;
      return true;
    });
  }, [expenses, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const pending = expenses.filter((e) => e.status === "Pending");
    const approved = expenses.filter((e) => e.status === "Approved");
    const reimbursed = expenses.filter((e) => e.status === "Reimbursed");
    return {
      pendingCount: pending.length,
      pendingAmt: pending.reduce((s, e) => s + Number(e.amount), 0),
      approvedAmt: approved.reduce((s, e) => s + Number(e.amount), 0),
      reimbursedAmt: reimbursed.reduce((s, e) => s + Number(e.amount), 0),
    };
  }, [expenses]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(e: Expense) {
    setEditingId(e.id);
    setForm({
      employeeId: e.employeeId,
      expenseDate: e.expenseDate,
      category: e.category,
      amount: e.amount,
      currency: e.currency,
      merchant: e.merchant || "",
      description: e.description || "",
      attachmentUrl: e.attachmentUrl || "",
      status: e.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!form.employeeId || !form.amount) return;
    setSubmitting(true);
    try {
      if (editingId) {
        await update(editingId, form);
      } else {
        await create(form);
      }
      setForm(EMPTY);
      setEditingId(null);
      setModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReject() {
    if (!rejectingId) return;
    try {
      await setStatus(rejectingId, "Rejected", rejectReason);
      setRejectingId(null);
      setRejectReason("");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    const rows = expenses.map((e) => {
      const emp = employees.find((x) => x.id === e.employeeId);
      return {
        employeeCode: emp?.employeeCode ?? "",
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        date: e.expenseDate,
        category: e.category,
        merchant: e.merchant || "",
        amount: e.amount,
        currency: e.currency,
        status: e.status,
        description: e.description || "",
        rejectedReason: e.rejectedReason || "",
      };
    });
    downloadCSV(`expenses-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <>
      <Header
        title="Expenses & Reimbursements"
        subtitle={`${expenses.length} claims · ${stats.pendingCount} pending`}
        actions={
          <>
            <select
              className="input w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="input w-44"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button className="btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn-primary" onClick={openNew}>
              New Claim
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-4 p-4 sm:p-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Pending" value={stats.pendingCount} />
          <Stat label="Pending amount" value={formatCurrency(stats.pendingAmt)} />
          <Stat label="Approved (unpaid)" value={formatCurrency(stats.approvedAmt)} />
          <Stat label="Reimbursed total" value={formatCurrency(stats.reimbursedAmt)} />
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Merchant</th>
                  <th className="text-right">Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const emp = employees.find((x) => x.id === e.employeeId);
                  const name = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/20 dark:text-brand-200">
                            {initials(name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">{name}</p>
                            <p className="text-xs text-slate-500">{emp?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700 dark:text-slate-300">{formatDate(e.expenseDate)}</td>
                      <td className="text-slate-700 dark:text-slate-300">{e.category}</td>
                      <td className="text-slate-600 dark:text-slate-400">{e.merchant || "—"}</td>
                      <td className="text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(e.amount)}
                      </td>
                      <td>
                        <StatusBadge status={e.status} />
                        {e.status === "Rejected" && e.rejectedReason ? (
                          <p className="mt-1 max-w-xs truncate text-xs text-rose-600" title={e.rejectedReason}>
                            {e.rejectedReason}
                          </p>
                        ) : null}
                      </td>
                      <td>
                        {e.attachmentUrl ? (
                          <a
                            href={e.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-600 hover:underline dark:text-brand-300"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          {e.status === "Pending" ? (
                            <>
                              <button
                                className="btn-ghost px-2 py-1 text-xs text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                                onClick={() => setStatus(e.id, "Approved")}
                              >
                                Approve
                              </button>
                              <button
                                className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                onClick={() => {
                                  setRejectingId(e.id);
                                  setRejectReason("");
                                }}
                              >
                                Reject
                              </button>
                              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(e)}>
                                Edit
                              </button>
                            </>
                          ) : e.status === "Approved" ? (
                            <button
                              className="btn-ghost px-2 py-1 text-xs"
                              onClick={() => setStatus(e.id, "Pending")}
                            >
                              Reset
                            </button>
                          ) : e.status === "Rejected" ? (
                            <button
                              className="btn-ghost px-2 py-1 text-xs"
                              onClick={() => setStatus(e.id, "Pending")}
                            >
                              Reopen
                            </button>
                          ) : null}
                          <button
                            className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            onClick={() => {
                              if (confirm("Delete this expense claim?")) remove(e.id);
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
                      No expense claims found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? "Edit Expense Claim" : "New Expense Claim"}
      >
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Employee</label>
            <select
              className="input"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              required
            >
              <option value="">Select employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} · {emp.employeeCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input"
              value={form.amount || ""}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <label className="label">Currency</label>
            <input
              className="input"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Merchant / Vendor</label>
            <input
              className="input"
              placeholder="e.g. Uber, Taj Hotel, Airtel"
              value={form.merchant || ""}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Receipt URL (optional)</label>
            <input
              className="input"
              placeholder="https://drive.google.com/…"
              value={form.attachmentUrl || ""}
              onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-slate-500">
              Paste a link to the receipt (Drive, Dropbox, S3, etc.).
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Purpose, project, client name…"
              value={form.description || ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Submit Claim"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!rejectingId}
        onClose={() => setRejectingId(null)}
        title="Reject expense claim"
      >
        <div className="space-y-4">
          <div>
            <label className="label">Reason (shown to employee)</label>
            <textarea
              className="input"
              rows={3}
              placeholder="e.g. Receipt missing, policy violation, duplicate claim"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setRejectingId(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary bg-rose-600 hover:bg-rose-700"
              onClick={handleReject}
            >
              Reject claim
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved: "badge-green",
    Pending: "badge-amber",
    Rejected: "badge-rose",
    Reimbursed: "badge-blue",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}
