"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { formatDate, useEmployees, useHolidays, useLeaves } from "@/lib/hrms";

interface DayEvent {
  type: "holiday" | "leave" | "birthday" | "anniversary";
  label: string;
  detail?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { data: holidays } = useHolidays();
  const { data: leaves } = useLeaves();
  const { data: employees } = useEmployees();

  const monthStart = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = monthStart.getDay();

  const events = useMemo(() => {
    const map: Record<number, DayEvent[]> = {};
    function push(day: number, ev: DayEvent) {
      (map[day] = map[day] || []).push(ev);
    }

    // Holidays
    holidays.forEach((h) => {
      const d = new Date(h.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        push(d.getDate(), { type: "holiday", label: h.name, detail: h.type });
      }
    });

    // Approved leaves spanning this month
    leaves
      .filter((l) => l.status === "Approved")
      .forEach((l) => {
        const from = new Date(l.fromDate);
        const to = new Date(l.toDate);
        const emp = employees.find((e) => e.id === l.employeeId);
        const empName = emp ? `${emp.firstName} ${emp.lastName}` : "Someone";
        for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
          if (d.getFullYear() === year && d.getMonth() === month) {
            push(d.getDate(), { type: "leave", label: empName, detail: l.type });
          }
        }
      });

    // Birthdays this month
    employees.forEach((e) => {
      if (!e.dateOfBirth) return;
      const d = new Date(e.dateOfBirth);
      if (d.getMonth() === month) {
        push(d.getDate(), { type: "birthday", label: `${e.firstName} ${e.lastName}`, detail: "Birthday" });
      }
    });

    // Work anniversaries
    employees.forEach((e) => {
      if (!e.joiningDate) return;
      const d = new Date(e.joiningDate);
      if (d.getMonth() === month && d.getFullYear() < year) {
        const years = year - d.getFullYear();
        push(d.getDate(), { type: "anniversary", label: `${e.firstName} ${e.lastName}`, detail: `${years} yr${years === 1 ? "" : "s"}` });
      }
    });

    return map;
  }, [holidays, leaves, employees, year, month]);

  function prev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function next() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToday() {
    const t = new Date();
    setMonth(t.getMonth());
    setYear(t.getFullYear());
  }

  // Build grid: 6 rows × 7 cols
  const cells: Array<{ day: number | null; isToday?: boolean }> = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
    cells.push({ day: d, isToday });
  }
  while (cells.length % 7 !== 0) cells.push({ day: null });

  return (
    <>
      <Header
        title="Calendar"
        subtitle="Holidays, leaves, birthdays and anniversaries in one view"
        actions={
          <div className="flex items-center gap-2">
            <button className="btn-ghost px-2 py-1 text-sm" onClick={prev}>
              ‹
            </button>
            <button className="btn-secondary text-sm" onClick={goToday}>
              Today
            </button>
            <button className="btn-ghost px-2 py-1 text-sm" onClick={next}>
              ›
            </button>
            <p className="ml-2 text-sm font-semibold text-slate-900">
              {MONTHS[month]} {year}
            </p>
          </div>
        }
      />

      <div className="p-6">
        <div className="card">
          {/* Legend */}
          <div className="mb-3 flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Holiday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Leave
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-pink-500" /> Birthday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Anniversary
            </span>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-1 border-b border-slate-200 pb-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            {WEEKDAYS.map((w) => (
              <div key={w}>{w}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="mt-2 grid grid-cols-7 gap-1">
            {cells.map((c, idx) => {
              const dayEvents = c.day ? events[c.day] || [] : [];
              return (
                <div
                  key={idx}
                  className={`min-h-[110px] rounded-lg border p-2 text-left transition ${
                    c.day === null
                      ? "border-slate-100 bg-slate-50/30"
                      : c.isToday
                      ? "border-brand-300 bg-brand-50/50 ring-2 ring-brand-300/50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  {c.day !== null ? (
                    <>
                      <p className={`text-xs font-semibold ${c.isToday ? "text-brand-700" : "text-slate-700"}`}>{c.day}</p>
                      <div className="mt-1 space-y-0.5">
                        {dayEvents.slice(0, 4).map((e, i) => (
                          <EventChip key={i} ev={e} />
                        ))}
                        {dayEvents.length > 4 ? (
                          <p className="text-[10px] text-slate-500">+{dayEvents.length - 4} more</p>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* This month summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Summary title="Holidays" tone="rose" items={holidays.filter((h) => new Date(h.date).getMonth() === month && new Date(h.date).getFullYear() === year).map((h) => `${h.name} · ${formatDate(h.date)}`)} />
          <Summary
            title="Approved Leaves"
            tone="amber"
            items={leaves
              .filter((l) => l.status === "Approved")
              .map((l) => {
                const emp = employees.find((e) => e.id === l.employeeId);
                return emp ? `${emp.firstName} ${emp.lastName} (${l.type})` : "";
              })
              .filter(Boolean)
              .slice(0, 8)}
          />
          <Summary
            title="Birthdays"
            tone="pink"
            items={employees
              .filter((e) => e.dateOfBirth && new Date(e.dateOfBirth).getMonth() === month)
              .map((e) => `${e.firstName} ${e.lastName} · ${new Date(e.dateOfBirth!).getDate()} ${MONTHS[month].slice(0, 3)}`)}
          />
          <Summary
            title="Anniversaries"
            tone="emerald"
            items={employees
              .filter((e) => e.joiningDate && new Date(e.joiningDate).getMonth() === month && new Date(e.joiningDate).getFullYear() < year)
              .map((e) => `${e.firstName} ${e.lastName} · ${year - new Date(e.joiningDate).getFullYear()} yrs`)}
          />
        </div>
      </div>
    </>
  );
}

function EventChip({ ev }: { ev: DayEvent }) {
  const map = {
    holiday: "bg-rose-100 text-rose-700",
    leave: "bg-amber-100 text-amber-700",
    birthday: "bg-pink-100 text-pink-700",
    anniversary: "bg-emerald-100 text-emerald-700",
  };
  return (
    <p className={`truncate rounded px-1.5 py-0.5 text-[10px] font-medium ${map[ev.type]}`} title={`${ev.label}${ev.detail ? ` — ${ev.detail}` : ""}`}>
      {ev.label}
    </p>
  );
}

function Summary({ title, tone, items }: { title: string; tone: "rose" | "amber" | "pink" | "emerald"; items: string[] }) {
  const map = {
    rose: "border-rose-200 bg-rose-50/40 text-rose-700",
    amber: "border-amber-200 bg-amber-50/40 text-amber-700",
    pink: "border-pink-200 bg-pink-50/40 text-pink-700",
    emerald: "border-emerald-200 bg-emerald-50/40 text-emerald-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${map[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{items.length}</p>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-0.5 text-xs text-slate-700">
          {items.slice(0, 5).map((it, i) => (
            <li key={i} className="truncate">
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs italic text-slate-400">Nothing scheduled</p>
      )}
    </div>
  );
}
