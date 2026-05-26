"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { formatDate, useAnnouncements, useDepartments } from "@/lib/hrms";
import type { Announcement, AnnouncementPriority, AnnouncementTarget } from "@/lib/types";

const PRIORITIES: AnnouncementPriority[] = ["Low", "Normal", "High", "Urgent"];
const TARGETS: AnnouncementTarget[] = ["All", "Department"];

const EMPTY: Omit<Announcement, "id" | "postedAt"> = {
  title: "",
  body: "",
  postedBy: "",
  target: "All",
  targetDept: "",
  priority: "Normal",
  expiresAt: "",
};

export default function AnnouncementsPage() {
  const { data: announcements, create, update, remove } = useAnnouncements();
  const { data: departments } = useDepartments();
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    if (priorityFilter === "All") return announcements;
    return announcements.filter((a) => a.priority === priorityFilter);
  }, [announcements, priorityFilter]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY);
    setModalOpen(true);
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id);
    setForm({
      title: a.title,
      body: a.body,
      postedBy: a.postedBy,
      target: a.target,
      targetDept: a.targetDept || "",
      priority: a.priority,
      expiresAt: a.expiresAt || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.body) return;
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

  async function handleDelete(a: Announcement) {
    if (!confirm(`Delete announcement "${a.title}"?`)) return;
    try {
      await remove(a.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  return (
    <>
      <Header
        title="Announcements"
        subtitle={`${announcements.length} posts · ${announcements.filter((a) => a.priority === "Urgent").length} urgent`}
        actions={
          <>
            <select className="input w-40" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <button className="btn-primary" onClick={openCreate}>
              New Announcement
            </button>
          </>
        }
      />

      <div className="space-y-4 p-6">
        {filtered.length === 0 ? (
          <div className="card py-12 text-center text-sm text-slate-500">No announcements yet.</div>
        ) : (
          filtered.map((a) => (
            <article key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={a.priority} />
                    <span className="badge-slate">{a.target === "Department" && a.targetDept ? a.targetDept : "All employees"}</span>
                    {a.expiresAt ? (
                      <span className="text-xs text-slate-500">Expires {formatDate(a.expiresAt)}</span>
                    ) : null}
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-slate-900">{a.title}</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{a.body}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Posted by <span className="font-medium text-slate-700">{a.postedBy || "—"}</span> ·{" "}
                    {formatDate(a.postedAt?.slice(0, 10))}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="btn-secondary text-xs" onClick={() => openEdit(a)}>
                    Edit
                  </button>
                  <button className="btn-ghost text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(a)}>
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Announcement" : "New Announcement"}>
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <label className="label">Message</label>
            <textarea className="input" rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </div>
          <div>
            <label className="label">Posted By</label>
            <input className="input" value={form.postedBy} onChange={(e) => setForm({ ...form, postedBy: e.target.value })} />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as AnnouncementPriority })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Target</label>
            <select
              className="input"
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value as AnnouncementTarget })}
            >
              {TARGETS.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All employees" : "Specific department"}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select
              className="input"
              value={form.targetDept || ""}
              onChange={(e) => setForm({ ...form, targetDept: e.target.value })}
              disabled={form.target !== "Department"}
            >
              <option value="">Select…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Expires On (optional)</label>
            <input
              type="date"
              className="input"
              value={form.expiresAt || ""}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Post Announcement"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  const map: Record<AnnouncementPriority, string> = {
    Low: "badge-slate",
    Normal: "badge-blue",
    High: "badge-amber",
    Urgent: "badge-rose",
  };
  return <span className={map[priority]}>{priority}</span>;
}
