"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { downloadCSV, toCSV } from "@/lib/csv";
import { formatCurrency, formatDate, initials, useCandidates, useDepartments } from "@/lib/hrms";
import type { Candidate, CandidateStage } from "@/lib/types";

const STAGES: CandidateStage[] = ["Applied", "Screening", "Interview", "Offer", "Hired", "Rejected"];

const EMPTY: Omit<Candidate, "id"> = {
  name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  stage: "Applied",
  source: "",
  appliedOn: new Date().toISOString().slice(0, 10),
  expectedSalary: 0,
  notes: "",
};

export default function RecruitmentPage() {
  const { data: candidates, create, update, setStage, remove } = useCandidates();
  const { data: departments } = useDepartments();
  const [view, setView] = useState<"board" | "table">("board");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    STAGES.forEach((s) => (map[s] = candidates.filter((c) => c.stage === s).length));
    return map;
  }, [candidates]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(c: Candidate) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      email: c.email || "",
      phone: c.phone || "",
      position: c.position,
      department: c.department || "",
      stage: c.stage,
      source: c.source || "",
      appliedOn: c.appliedOn || "",
      expectedSalary: c.expectedSalary || 0,
      notes: c.notes || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.position) return;
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

  async function handleDelete(c: Candidate) {
    if (!confirm(`Delete candidate "${c.name}"?`)) return;
    try {
      await remove(c.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    downloadCSV(`candidates-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(candidates));
  }

  return (
    <>
      <Header
        title="Recruitment"
        subtitle={`${candidates.length} candidates · ${counts["Interview"] + counts["Offer"]} in active pipeline`}
        actions={
          <>
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
              <button
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${view === "board" ? "bg-brand-50 text-brand-700" : "text-slate-600"}`}
                onClick={() => setView("board")}
              >
                Board
              </button>
              <button
                className={`rounded-md px-3 py-1 text-xs font-medium transition ${view === "table" ? "bg-brand-50 text-brand-700" : "text-slate-600"}`}
                onClick={() => setView("table")}
              >
                Table
              </button>
            </div>
            <button className="btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn-primary" onClick={openCreate}>
              Add Candidate
            </button>
          </>
        }
      />

      <div className="p-6">
        {view === "board" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {STAGES.map((stage) => {
              const list = candidates.filter((c) => c.stage === stage);
              return (
                <div key={stage} className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">{stage}</p>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-700">{list.length}</span>
                  </div>
                  <div className="space-y-2">
                    {list.map((c) => (
                      <div key={c.id} className="rounded-lg bg-white p-3 shadow-sm transition hover:shadow-md">
                        <div className="flex items-start gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                            <p className="truncate text-xs text-slate-500">{c.position}</p>
                          </div>
                        </div>
                        {c.expectedSalary ? (
                          <p className="mt-2 text-xs text-slate-600">Expects {formatCurrency(c.expectedSalary)}</p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <select
                            className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px]"
                            value={c.stage}
                            onChange={(e) => setStage(c.id, e.target.value)}
                          >
                            {STAGES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                          <button className="btn-ghost px-1.5 py-0.5 text-[10px]" onClick={() => openEdit(c)}>
                            Edit
                          </button>
                          <button className="btn-ghost px-1.5 py-0.5 text-[10px] text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(c)}>
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                    {list.length === 0 ? <p className="text-xs italic text-slate-400">No candidates</p> : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Department</th>
                    <th>Source</th>
                    <th>Applied</th>
                    <th>Expected</th>
                    <th>Stage</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {initials(c.name)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700">{c.position}</td>
                      <td className="text-slate-700">{c.department || "—"}</td>
                      <td className="text-slate-700">{c.source || "—"}</td>
                      <td className="text-slate-700">{formatDate(c.appliedOn)}</td>
                      <td className="text-slate-700">{c.expectedSalary ? formatCurrency(c.expectedSalary) : "—"}</td>
                      <td>
                        <select
                          className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                          value={c.stage}
                          onChange={(e) => setStage(c.id, e.target.value)}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(c)}>
                            Edit
                          </button>
                          <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(c)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                        No candidates yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Candidate" : "Add Candidate"}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Position</label>
            <input className="input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">—</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Stage</label>
            <select className="input" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value as CandidateStage })}>
              {STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Source</label>
            <input className="input" value={form.source || ""} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="LinkedIn, Referral…" />
          </div>
          <div>
            <label className="label">Applied On</label>
            <input
              type="date"
              className="input"
              value={form.appliedOn || ""}
              onChange={(e) => setForm({ ...form, appliedOn: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Expected Salary (₹)</label>
            <input
              type="number"
              className="input"
              value={form.expectedSalary || 0}
              onChange={(e) => setForm({ ...form, expectedSalary: Number(e.target.value) })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={3} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Candidate"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
