"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { formatCurrency, formatDate, useExpenses } from "@/lib/hrms";
import type { Expense, ExpenseCategory } from "@/lib/types";

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

interface Me {
  uid: string;
  role: string;
  employeeId?: string;
}

export default function MyExpensesPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: expenses, create, remove, refresh } = useExpenses();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    expenseDate: new Date().toISOString().slice(0, 10),
    category: "Travel" as ExpenseCategory,
    amount: 0,
    currency: "INR",
    merchant: "",
    description: "",
    attachmentUrl: "",
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

  const myExpenses = useMemo(() => {
    if (!me?.employeeId) return [];
    return expenses
      .filter((e) => e.employeeId === me.employeeId)
      .filter((e) => statusFilter === "All" || e.status === statusFilter);
  }, [expenses, me, statusFilter]);

  const stats = useMemo(() => {
    return {
      pending: myExpenses.filter((e) => e.status === "Pending").reduce((s, e) => s + Number(e.amount), 0),
      approved: myExpenses.filter((e) => e.status === "Approved").reduce((s, e) => s + Number(e.amount), 0),
      reimbursed: myExpenses.filter((e) => e.status === "Reimbursed").reduce((s, e) => s + Number(e.amount), 0),
    };
  }, [myExpenses]);

  if (loading) return <PageMsg msg="Loading…" />;
  if (!me?.employeeId)
    return <PageMsg msg="Your account is not linked to an employee." back />;

  const employeeId = me.employeeId;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!employeeId || !form.amount) return;
    setSubmitting(true);
    try {
      await create({
        employeeId,
        expenseDate: form.expenseDate,
        category: form.category,
        amount: form.amount,
        currency: form.currency,
        merchant: form.merchant,
        description: form.description,
        attachmentUrl: form.attachmentUrl,
        status: "Pending",
      });
      setOpen(false);
      setForm({
        expenseDate: new Date().toISOString().slice(0, 10),
        category: "Travel",
        amount: 0,
        currency: "INR",
        merchant: "",
        description: "",
        attachmentUrl: "",
      });
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelClaim(id: string) {
    if (!confirm("Delete this expense claim?")) return;
    try {
      await remove(id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="My Expenses"
        subtitle={`${myExpenses.length} claim${myExpenses.length === 1 ? "" : "s"}`}
        actions={
          <>
            <select
              className="input w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Reimbursed">Reimbursed</option>
            </select>
            <button className="btn-primary" onClick={() => setOpen(true)}>
              New Claim
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Pending" value={formatCurrency(stats.pending)} tone="amber" />
          <Stat label="Approved (awaiting payment)" value={formatCurrency(stats.approved)} tone="green" />
          <Stat label="Reimbursed lifetime" value={formatCurrency(stats.reimbursed)} tone="blue" />
        </div>

        <section className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
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
                {myExpenses.map((e) => (
                  <tr key={e.id}>
                    <td>{formatDate(e.expenseDate)}</td>
                    <td>{e.category}</td>
                    <td className="text-slate-600">{e.merchant || "—"}</td>
                    <td className="text-right font-semibold">{formatCurrency(e.amount)}</td>
                    <td>
                      <StatusBadge status={e.status} />
                      {e.status === "Rejected" && e.rejectedReason ? (
                        <p
                          className="mt-1 max-w-xs truncate text-xs text-rose-600"
                          title={e.rejectedReason}
                        >
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
                      {e.status === "Pending" ? (
                        <button
                          className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
                          onClick={() => cancelClaim(e.id)}
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {myExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                      No expense claims yet. Click <strong>New Claim</strong> to submit one.
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

      <Modal open={open} onClose={() => setOpen(false)} title="New Expense Claim">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
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
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as ExpenseCategory })
              }
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
              value={form.merchant}
              onChange={(e) => setForm({ ...form, merchant: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Receipt URL</label>
            <input
              className="input"
              placeholder="https://drive.google.com/…"
              value={form.attachmentUrl}
              onChange={(e) => setForm({ ...form, attachmentUrl: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Purpose, project, client name…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Claim"}
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
    Reimbursed: "badge-blue",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "amber" | "green" | "blue";
}) {
  const ring =
    tone === "amber"
      ? "ring-amber-200 dark:ring-amber-500/30"
      : tone === "green"
      ? "ring-emerald-200 dark:ring-emerald-500/30"
      : "ring-sky-200 dark:ring-sky-500/30";
  return (
    <div className={`card ring-1 ${ring}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function PageMsg({ msg, back }: { msg: string; back?: boolean }) {
  return (
    <>
      <Header title="My Expenses" />
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
