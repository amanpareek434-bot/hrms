"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { downloadCSV, toCSV } from "@/lib/csv";
import { formatDate, useAssets, useEmployees } from "@/lib/hrms";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";

const CATEGORIES: AssetCategory[] = ["Laptop", "Desktop", "Phone", "Tablet", "Monitor", "Access Card", "Vehicle", "Other"];
const STATUSES: AssetStatus[] = ["Available", "Assigned", "In Repair", "Retired"];

const EMPTY: Omit<Asset, "id"> = {
  name: "",
  category: "Laptop",
  serialNo: "",
  assignedTo: "",
  assignedOn: "",
  returnedOn: "",
  status: "Available",
  notes: "",
};

export default function AssetsPage() {
  const { data: assets, create, update, remove } = useAssets();
  const { data: employees } = useEmployees();
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (statusFilter !== "All" && a.status !== statusFilter) return false;
      if (categoryFilter !== "All" && a.category !== categoryFilter) return false;
      return true;
    });
  }, [assets, statusFilter, categoryFilter]);

  const counts = useMemo(
    () => ({
      total: assets.length,
      assigned: assets.filter((a) => a.status === "Assigned").length,
      available: assets.filter((a) => a.status === "Available").length,
      repair: assets.filter((a) => a.status === "In Repair").length,
    }),
    [assets],
  );

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(a: Asset) {
    setEditingId(a.id);
    setForm({
      name: a.name,
      category: a.category,
      serialNo: a.serialNo || "",
      assignedTo: a.assignedTo || "",
      assignedOn: a.assignedOn || "",
      returnedOn: a.returnedOn || "",
      status: a.status,
      notes: a.notes || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      if (payload.status !== "Assigned") payload.assignedTo = "";
      if (editingId) await update(editingId, payload);
      else await create(payload);
      setModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(a: Asset) {
    if (!confirm(`Delete asset "${a.name}"?`)) return;
    try {
      await remove(a.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    const rows = assets.map((a) => {
      const emp = employees.find((e) => e.id === a.assignedTo);
      return {
        name: a.name,
        category: a.category,
        serialNo: a.serialNo,
        assignedTo: emp ? `${emp.firstName} ${emp.lastName}` : "",
        employeeCode: emp?.employeeCode ?? "",
        assignedOn: a.assignedOn,
        status: a.status,
        notes: a.notes,
      };
    });
    downloadCSV(`assets-${new Date().toISOString().slice(0, 10)}.csv`, toCSV(rows));
  }

  return (
    <>
      <Header
        title="Assets & Equipment"
        subtitle={`${counts.total} total · ${counts.assigned} assigned · ${counts.available} available · ${counts.repair} in repair`}
        actions={
          <>
            <select className="input w-36" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
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
            <button className="btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn-primary" onClick={openCreate}>
              Add Asset
            </button>
          </>
        }
      />

      <div className="p-6">
        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Category</th>
                  <th>Serial</th>
                  <th>Assigned To</th>
                  <th>Assigned On</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const emp = employees.find((e) => e.id === a.assignedTo);
                  return (
                    <tr key={a.id}>
                      <td>
                        <p className="font-medium text-slate-900">{a.name}</p>
                        {a.notes ? <p className="text-xs text-slate-500">{a.notes}</p> : null}
                      </td>
                      <td className="text-slate-700">{a.category}</td>
                      <td className="font-mono text-xs text-slate-700">{a.serialNo || "—"}</td>
                      <td className="text-slate-700">
                        {emp ? (
                          <>
                            <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-slate-500">{emp.department}</p>
                          </>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="text-slate-700">{formatDate(a.assignedOn)}</td>
                      <td>
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(a)}>
                            Edit
                          </button>
                          <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(a)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                      No assets found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Asset" : "Add Asset"}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as AssetCategory })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Serial Number</label>
            <input className="input" value={form.serialNo || ""} onChange={(e) => setForm({ ...form, serialNo: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as AssetStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Assigned To</label>
            <select
              className="input"
              value={form.assignedTo || ""}
              onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              disabled={form.status !== "Assigned"}
            >
              <option value="">—</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} · {emp.employeeCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Assigned On</label>
            <input
              type="date"
              className="input"
              value={form.assignedOn || ""}
              onChange={(e) => setForm({ ...form, assignedOn: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Returned On</label>
            <input
              type="date"
              className="input"
              value={form.returnedOn || ""}
              onChange={(e) => setForm({ ...form, returnedOn: e.target.value })}
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
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Asset"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function StatusBadge({ status }: { status: AssetStatus }) {
  const map: Record<AssetStatus, string> = {
    Available: "badge-green",
    Assigned: "badge-blue",
    "In Repair": "badge-amber",
    Retired: "badge-slate",
  };
  return <span className={map[status]}>{status}</span>;
}
