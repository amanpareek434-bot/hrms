"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { formatDate, useHolidays } from "@/lib/hrms";
import type { Holiday, HolidayType } from "@/lib/types";

const TYPES: HolidayType[] = ["National", "Regional", "Company", "Optional"];

const EMPTY: Omit<Holiday, "id"> = {
  date: new Date().toISOString().slice(0, 10),
  name: "",
  type: "National",
  description: "",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function HolidaysPage() {
  const { data: holidays, create, update, remove } = useHolidays();
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const years = useMemo(() => {
    const set = new Set<string>();
    holidays.forEach((h) => set.add(h.date.slice(0, 4)));
    set.add(String(new Date().getFullYear()));
    return Array.from(set).sort();
  }, [holidays]);

  const grouped = useMemo(() => {
    const filtered = holidays.filter((h) => h.date.startsWith(yearFilter));
    const byMonth: Record<number, Holiday[]> = {};
    filtered.forEach((h) => {
      const m = Number(h.date.slice(5, 7)) - 1;
      (byMonth[m] = byMonth[m] || []).push(h);
    });
    Object.values(byMonth).forEach((arr) => arr.sort((a, b) => a.date.localeCompare(b.date)));
    return byMonth;
  }, [holidays, yearFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = holidays.filter((h) => h.date >= today).slice(0, 3);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(h: Holiday) {
    setEditingId(h.id);
    setForm({ date: h.date, name: h.name, type: h.type, description: h.description || "" });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.date) return;
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

  async function handleDelete(h: Holiday) {
    if (!confirm(`Delete holiday "${h.name}"?`)) return;
    try {
      await remove(h.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="Holiday Calendar"
        subtitle={`${holidays.length} holidays · ${upcoming.length} upcoming`}
        actions={
          <>
            <select className="input w-32" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={openCreate}>
              Add Holiday
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {upcoming.length > 0 ? (
          <section className="card">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Next up</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {upcoming.map((h) => {
                const days = Math.round((new Date(h.date).getTime() - new Date(today).getTime()) / 86400000);
                return (
                  <div key={h.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs uppercase tracking-wider text-slate-500">{h.type}</p>
                    <p className="mt-1 font-semibold text-slate-900">{h.name}</p>
                    <p className="text-xs text-slate-600">
                      {formatDate(h.date)} · {days === 0 ? "Today" : `in ${days} day${days === 1 ? "" : "s"}`}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MONTHS.map((mname, i) => {
            const list = grouped[i] || [];
            if (list.length === 0) return null;
            return (
              <div key={mname} className="card">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">{mname} {yearFilter}</h3>
                <ul className="space-y-2">
                  {list.map((h) => (
                    <li key={h.id} className="flex items-start justify-between gap-2 rounded-lg border border-slate-100 p-3">
                      <div>
                        <p className="font-medium text-slate-900">{h.name}</p>
                        <p className="text-xs text-slate-500">{formatDate(h.date)} · {h.type}</p>
                        {h.description ? <p className="mt-1 text-xs text-slate-600">{h.description}</p> : null}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(h)}>
                          Edit
                        </button>
                        <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(h)}>
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {Object.keys(grouped).length === 0 ? (
            <div className="card col-span-full py-10 text-center text-sm text-slate-500">No holidays for {yearFilter}.</div>
          ) : null}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Holiday" : "Add Holiday"}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as HolidayType })}>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Description (optional)</label>
            <textarea className="input" rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Holiday"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
