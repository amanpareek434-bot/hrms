"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { formatDate, useAttendance } from "@/lib/hrms";

interface Me {
  uid: string;
  role: string;
  employeeId?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MyAttendancePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: attendance } = useAttendance();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setMe(d.user);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const employeeId = me?.employeeId;

  const myAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === employeeId),
    [attendance, employeeId],
  );

  const monthAttendance = useMemo(() => {
    const map: Record<string, string> = {};
    myAttendance.forEach((a) => {
      const d = new Date(a.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        map[String(d.getDate())] = a.status;
      }
    });
    return map;
  }, [myAttendance, year, month]);

  const stats = useMemo(() => {
    const cutoff = Date.now() - 30 * 86400000;
    const last30 = myAttendance.filter((a) => new Date(a.date).getTime() >= cutoff);
    return {
      present: last30.filter((a) => a.status === "Present").length,
      absent: last30.filter((a) => a.status === "Absent").length,
      leave: last30.filter((a) => a.status === "Leave").length,
      halfDay: last30.filter((a) => a.status === "Half Day").length,
      total: last30.length,
    };
  }, [myAttendance]);

  if (loading) return <PageMsg msg="Loading…" />;
  if (!me?.employeeId) return <PageMsg msg="Your account is not linked to an employee." back />;

  function prev() {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  }
  function next() {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const cells: Array<{ day: number | null; isToday?: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
    cells.push({ day: d, isToday });
  }

  return (
    <>
      <Header
        title="My Attendance"
        subtitle={`${stats.present}/${stats.total} present in last 30 days`}
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-ghost px-2 py-1 text-sm" onClick={prev}>‹</button>
            <p className="min-w-[140px] text-center text-sm font-semibold text-slate-900 dark:text-slate-100">
              {MONTHS[month]} {year}
            </p>
            <button className="btn-ghost px-2 py-1 text-sm" onClick={next}>›</button>
          </div>
        }
      />

      <div className="space-y-6 p-6">
        {/* KPI strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPI label="Present" value={stats.present} tone="emerald" />
          <KPI label="Absent" value={stats.absent} tone="rose" />
          <KPI label="Leave" value={stats.leave} tone="amber" />
          <KPI label="Half Day" value={stats.halfDay} tone="brand" />
        </section>

        {/* Calendar grid */}
        <section className="card">
          <div className="grid grid-cols-7 gap-1 border-b border-slate-200 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-white/5">
            {WEEKDAYS.map((w) => <div key={w}>{w}</div>)}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((c, idx) => {
              const status = c.day ? monthAttendance[String(c.day)] : null;
              const bg = !c.day
                ? "border-slate-100 bg-slate-50/30 dark:border-white/5 dark:bg-white/[0.02]"
                : status === "Present"
                ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                : status === "Absent"
                ? "border-rose-200 bg-rose-50/50 dark:border-rose-500/20 dark:bg-rose-500/10"
                : status === "Leave"
                ? "border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/10"
                : status === "Half Day"
                ? "border-brand-200 bg-brand-50/50 dark:border-brand-500/20 dark:bg-brand-500/10"
                : status === "Holiday"
                ? "border-pink-200 bg-pink-50/50 dark:border-pink-500/20 dark:bg-pink-500/10"
                : "border-slate-100 bg-white dark:border-white/5 dark:bg-ink-900";
              return (
                <div
                  key={idx}
                  className={`min-h-[70px] rounded-lg border p-2 ${bg} ${c.isToday ? "ring-2 ring-brand-300" : ""}`}
                >
                  {c.day !== null ? (
                    <>
                      <p className={`text-xs font-semibold ${c.isToday ? "text-brand-700 dark:text-brand-300" : "text-slate-700 dark:text-slate-300"}`}>
                        {c.day}
                      </p>
                      {status ? (
                        <p className="mt-1 truncate text-[10px] font-medium text-slate-700 dark:text-slate-300">
                          {status}
                        </p>
                      ) : null}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-rose-500" /> Absent</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Leave</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" /> Half Day</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-pink-500" /> Holiday</span>
          </div>
        </section>

        {/* Recent records */}
        <section className="card">
          <h2 className="mb-3 text-base font-semibold text-slate-900 dark:text-slate-100">Recent Records</h2>
          <table className="table-base">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {myAttendance.slice(0, 15).map((a) => (
                <tr key={a.id}>
                  <td>{formatDate(a.date)}</td>
                  <td className="font-mono text-xs">{a.checkIn || "—"}</td>
                  <td className="font-mono text-xs">{a.checkOut || "—"}</td>
                  <td>{a.status}</td>
                  <td className="text-xs text-slate-500">{a.notes || "—"}</td>
                </tr>
              ))}
              {myAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-slate-500">
                    No attendance records yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <div>
          <Link href="/me" className="text-sm text-brand-600 hover:underline dark:text-brand-300">
            ← Back to profile
          </Link>
        </div>
      </div>
    </>
  );
}

function KPI({ label, value, tone }: { label: string; value: number; tone: "emerald" | "rose" | "amber" | "brand" }) {
  const map = {
    emerald: "from-emerald-50 to-white border-emerald-200 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-transparent",
    rose: "from-rose-50 to-white border-rose-200 dark:border-rose-500/20 dark:from-rose-500/10 dark:to-transparent",
    amber: "from-amber-50 to-white border-amber-200 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-transparent",
    brand: "from-brand-50 to-white border-brand-200 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-transparent",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${map[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function PageMsg({ msg, back }: { msg: string; back?: boolean }) {
  return (
    <>
      <Header title="My Attendance" />
      <div className="p-6 text-sm text-slate-500">
        <p>{msg}</p>
        {back ? <Link href="/me" className="mt-2 inline-block text-brand-600 hover:underline">← Back</Link> : null}
      </div>
    </>
  );
}
