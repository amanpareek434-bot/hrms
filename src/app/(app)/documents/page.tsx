"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { formatDate, initials, useDocuments, useEmployees } from "@/lib/hrms";
import type { DocumentCategory, EmployeeDocument } from "@/lib/types";

const CATEGORIES: DocumentCategory[] = [
  "Offer Letter", "Contract", "ID Proof", "Resume", "Certificate", "Payslip", "Tax", "Other",
];

const EMPTY: Omit<EmployeeDocument, "id"> = {
  employeeId: "",
  title: "",
  category: "Other",
  fileUrl: "",
  notes: "",
  uploadedOn: new Date().toISOString().slice(0, 10),
};

export default function DocumentsPage() {
  const { data: documents, create, update, remove } = useDocuments();
  const { data: employees } = useEmployees();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [empFilter, setEmpFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (categoryFilter !== "All" && d.category !== categoryFilter) return false;
      if (empFilter !== "All" && d.employeeId !== empFilter) return false;
      if (!q) return true;
      const emp = employees.find((e) => e.id === d.employeeId);
      const name = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : "";
      return d.title.toLowerCase().includes(q) || name.includes(q);
    });
  }, [documents, search, categoryFilter, empFilter, employees]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(d: EmployeeDocument) {
    setEditingId(d.id);
    setForm({
      employeeId: d.employeeId,
      title: d.title,
      category: d.category,
      fileUrl: d.fileUrl || "",
      notes: d.notes || "",
      uploadedOn: d.uploadedOn || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.employeeId) return;
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

  async function handleDelete(d: EmployeeDocument) {
    if (!confirm(`Delete "${d.title}"?`)) return;
    try {
      await remove(d.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="Documents"
        subtitle={`${documents.length} files · ${employees.length} employees`}
        actions={
          <button className="btn-primary" onClick={openCreate}>
            Add Document
          </button>
        }
      />

      <div className="space-y-4 p-6">
        <div className="card">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <input
              className="input flex-1"
              placeholder="Search by title or employee…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="input sm:w-44" value={empFilter} onChange={(e) => setEmpFilter(e.target.value)}>
              <option value="All">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            <select className="input sm:w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Employee</th>
                  <th>Category</th>
                  <th>Uploaded</th>
                  <th>Link</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const emp = employees.find((e) => e.id === d.employeeId);
                  const name = emp ? `${emp.firstName} ${emp.lastName}` : "Unknown";
                  return (
                    <tr key={d.id}>
                      <td>
                        <p className="font-medium text-slate-900">{d.title}</p>
                        {d.notes ? <p className="text-xs text-slate-500">{d.notes}</p> : null}
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-[10px] font-semibold text-brand-700">
                            {initials(name)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900">{name}</p>
                            <p className="text-xs text-slate-500">{emp?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-slate">{d.category}</span>
                      </td>
                      <td className="text-slate-700">{formatDate(d.uploadedOn)}</td>
                      <td>
                        {d.fileUrl ? (
                          <a
                            href={d.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-brand-600 hover:underline"
                          >
                            Open →
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(d)}>
                            Edit
                          </button>
                          <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(d)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No documents found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Document" : "Add Document"}>
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
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Uploaded On</label>
            <input
              type="date"
              className="input"
              value={form.uploadedOn || ""}
              onChange={(e) => setForm({ ...form, uploadedOn: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">File URL</label>
            <input
              className="input"
              placeholder="https://drive.google.com/…"
              value={form.fileUrl || ""}
              onChange={(e) => setForm({ ...form, fileUrl: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea className="input" rows={2} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Document"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
