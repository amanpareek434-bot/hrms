"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useCompanySettings } from "@/lib/hrms";
import type { CompanySettings } from "@/lib/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT: CompanySettings = {
  name: "My Company",
  legalName: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  workStart: "09:30:00",
  workEnd: "18:30:00",
  weeklyOffs: "Sat,Sun",
};

export default function SettingsPage() {
  const { data, loading, error, update } = useCompanySettings();
  const [form, setForm] = useState<CompanySettings>(DEFAULT);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const weeklyOffSet = new Set(form.weeklyOffs.split(",").map((s) => s.trim()).filter(Boolean));

  function toggleOff(day: string) {
    const set = new Set(weeklyOffSet);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    const ordered = DAYS.filter((d) => set.has(d));
    setForm({ ...form, weeklyOffs: ordered.join(",") });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSaved(false);
    try {
      await update(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title="Settings"
        subtitle="Company profile, working hours, currency"
        actions={
          saved ? <span className="badge-green">Saved ✓</span> : null
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Company profile */}
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Company Profile</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="label">Company Name</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Legal Name</label>
                <input className="input" value={form.legalName || ""} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
              </div>
              <div>
                <label className="label">Website</label>
                <input className="input" placeholder="https://" value={form.website || ""} onChange={(e) => setForm({ ...form, website: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea className="input" rows={2} value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Logo URL</label>
                <input className="input" placeholder="https://" value={form.logoUrl || ""} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} />
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.logoUrl} alt="Logo preview" className="mt-2 h-12 rounded-lg border border-slate-200 bg-white object-contain p-1" />
                ) : null}
              </div>
            </div>
          </section>

          {/* Locale */}
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Locale & Currency</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Currency Code</label>
                <input className="input" placeholder="INR" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
              </div>
              <div>
                <label className="label">Timezone</label>
                <input className="input" placeholder="Asia/Kolkata" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Working hours */}
          <section className="card">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Working Hours</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Work Start</label>
                <input type="time" className="input" value={form.workStart} onChange={(e) => setForm({ ...form, workStart: e.target.value })} />
              </div>
              <div>
                <label className="label">Work End</label>
                <input type="time" className="input" value={form.workEnd} onChange={(e) => setForm({ ...form, workEnd: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label">Weekly Offs</label>
                <div className="flex flex-wrap gap-2">
                  {DAYS.map((d) => {
                    const active = weeklyOffSet.has(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleOff(d)}
                        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                          active
                            ? "border-brand-300 bg-brand-50 text-brand-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-slate-500">{weeklyOffSet.size} day{weeklyOffSet.size === 1 ? "" : "s"} off per week</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2">
            <button type="submit" className="btn-primary" disabled={submitting || loading}>
              {submitting ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
