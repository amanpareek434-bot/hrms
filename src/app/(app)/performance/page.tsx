"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { formatDate, initials, useEmployees, useReviews } from "@/lib/hrms";
import type { PerformanceReview, ReviewStatus } from "@/lib/types";

const STATUSES: ReviewStatus[] = ["Draft", "Submitted", "Acknowledged"];

function currentPeriod(): string {
  const d = new Date();
  const q = Math.floor(d.getMonth() / 3) + 1;
  return `${d.getFullYear()}-Q${q}`;
}

const EMPTY: Omit<PerformanceReview, "id"> = {
  employeeId: "",
  period: currentPeriod(),
  reviewer: "",
  rating: 0,
  strengths: "",
  improvements: "",
  goals: "",
  status: "Draft",
  reviewedOn: new Date().toISOString().slice(0, 10),
};

export default function PerformancePage() {
  const { data: reviews, create, update, remove } = useReviews();
  const { data: employees } = useEmployees();
  const [periodFilter, setPeriodFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const periods = useMemo(() => {
    const set = new Set<string>();
    reviews.forEach((r) => set.add(r.period));
    set.add(currentPeriod());
    return Array.from(set).sort().reverse();
  }, [reviews]);

  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      if (periodFilter !== "All" && r.period !== periodFilter) return false;
      if (statusFilter !== "All" && r.status !== statusFilter) return false;
      return true;
    });
  }, [reviews, periodFilter, statusFilter]);

  const avgRating = useMemo(() => {
    const rated = filtered.filter((r) => r.rating && r.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((s, r) => s + (r.rating || 0), 0) / rated.length;
  }, [filtered]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY, period: periodFilter !== "All" ? periodFilter : currentPeriod() });
    setModalOpen(true);
  }

  function openEdit(r: PerformanceReview) {
    setEditingId(r.id);
    setForm({
      employeeId: r.employeeId,
      period: r.period,
      reviewer: r.reviewer || "",
      rating: r.rating || 0,
      strengths: r.strengths || "",
      improvements: r.improvements || "",
      goals: r.goals || "",
      status: r.status,
      reviewedOn: r.reviewedOn || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employeeId || !form.period) return;
    setSubmitting(true);
    try {
      if (editingId) await update(editingId, form);
      else await create(form);
      setModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(r: PerformanceReview) {
    if (!confirm("Delete this review?")) return;
    try {
      await remove(r.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="Performance Reviews"
        subtitle={`${reviews.length} reviews · Avg rating ${avgRating.toFixed(2)} / 5`}
        actions={
          <>
            <select className="input w-32" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              <option value="All">All Periods</option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select className="input w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={openCreate}>
              New Review
            </button>
          </>
        }
      />

      <div className="p-6">
        <div className="grid gap-4">
          {filtered.length === 0 ? (
            <div className="card py-12 text-center text-sm text-slate-500">No reviews found.</div>
          ) : (
            filtered.map((r) => {
              const emp = employees.find((e) => e.id === r.employeeId);
              const name = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
              return (
                <div key={r.id} className="card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-1 items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                        {initials(name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{name}</p>
                          <span className="badge-slate">{r.period}</span>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="text-xs text-slate-500">
                          {emp?.designation || "—"} · {emp?.department || "—"} · Reviewed by{" "}
                          <span className="text-slate-700">{r.reviewer || "—"}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <StarRating value={r.rating || 0} />
                          <span className="text-sm font-semibold text-slate-700">{(r.rating || 0).toFixed(1)}</span>
                          {r.reviewedOn ? <span className="text-xs text-slate-500">· {formatDate(r.reviewedOn)}</span> : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button className="btn-secondary text-xs" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(r)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {(r.strengths || r.improvements || r.goals) && (
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {r.strengths ? (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Strengths</p>
                          <p className="mt-1 text-sm text-slate-700">{r.strengths}</p>
                        </div>
                      ) : null}
                      {r.improvements ? (
                        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Improvements</p>
                          <p className="mt-1 text-sm text-slate-700">{r.improvements}</p>
                        </div>
                      ) : null}
                      {r.goals ? (
                        <div className="rounded-lg border border-brand-100 bg-brand-50/50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Goals</p>
                          <p className="mt-1 text-sm text-slate-700">{r.goals}</p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Review" : "New Review"}>
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
            <label className="label">Period</label>
            <input
              className="input"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              placeholder="2026-Q1"
              required
            />
          </div>
          <div>
            <label className="label">Reviewer</label>
            <input
              className="input"
              value={form.reviewer || ""}
              onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Rating (0 – 5)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              className="input"
              value={form.rating || 0}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ReviewStatus })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Reviewed On</label>
            <input
              type="date"
              className="input"
              value={form.reviewedOn || ""}
              onChange={(e) => setForm({ ...form, reviewedOn: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Strengths</label>
            <textarea
              className="input"
              rows={3}
              value={form.strengths || ""}
              onChange={(e) => setForm({ ...form, strengths: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Areas for Improvement</label>
            <textarea
              className="input"
              rows={3}
              value={form.improvements || ""}
              onChange={(e) => setForm({ ...form, improvements: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Goals for next period</label>
            <textarea
              className="input"
              rows={3}
              value={form.goals || ""}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Create Review"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function StarRating({ value }: { value: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((i) => {
        const fillClass = i <= full ? "text-amber-400" : i === full + 1 && half ? "text-amber-300" : "text-slate-200";
        return (
          <svg key={i} viewBox="0 0 24 24" fill="currentColor" className={`h-4 w-4 ${fillClass}`}>
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    Draft: "badge-slate",
    Submitted: "badge-blue",
    Acknowledged: "badge-green",
  };
  return <span className={map[status]}>{status}</span>;
}
