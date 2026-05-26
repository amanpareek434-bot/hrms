"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { useDepartments, useEmployees } from "@/lib/hrms";
import type { Department } from "@/lib/types";

const EMPTY: Omit<Department, "id"> = {
  name: "",
  head: "",
  description: "",
};

export default function DepartmentsPage() {
  const { data: departments, create, update, remove } = useDepartments();
  const { data: employees } = useEmployees();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(d: Department) {
    setEditingId(d.id);
    const { id: _id, ...rest } = d;
    setForm(rest);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
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

  async function handleDelete(d: Department) {
    if (!confirm(`Delete ${d.name}?`)) return;
    try {
      await remove(d.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="Departments"
        subtitle={`${departments.length} departments`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            Add Department
          </button>
        }
      />
      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {departments.map((d) => {
            const count = employees.filter((e) => e.department === d.name).length;
            return (
              <div key={d.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{d.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Head: {d.head || "—"}</p>
                  </div>
                  <span className="badge-blue">{count} employees</span>
                </div>
                {d.description ? <p className="mt-3 text-sm text-slate-600">{d.description}</p> : null}
                <div className="mt-4 flex gap-2">
                  <button className="btn-secondary text-xs" onClick={() => openEdit(d)}>
                    Edit
                  </button>
                  <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(d)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {departments.length === 0 ? (
            <div className="card col-span-full py-10 text-center text-sm text-slate-500">No departments yet.</div>
          ) : null}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Department" : "Add Department"}>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Department Head</label>
            <input className="input" value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Department"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
