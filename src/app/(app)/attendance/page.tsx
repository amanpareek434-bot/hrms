"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { downloadCSV, toCSV } from "@/lib/csv";
import { formatDate, initials, useAttendance, useEmployees } from "@/lib/hrms";
import type { AttendanceStatus } from "@/lib/types";

const STATUSES: AttendanceStatus[] = ["Present", "Absent", "Half Day", "Leave", "Holiday"];

export default function AttendancePage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const { data: employees } = useEmployees();
  const { data: attendance, upsert, refresh } = useAttendance(date);
  const [query, setQuery] = useState("");

  const dayMap = useMemo(() => {
    const map = new Map<string, (typeof attendance)[number]>();
    attendance.forEach((a) => map.set(a.employeeId, a));
    return map;
  }, [attendance]);

  const filteredEmployees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (!q) return true;
      return (
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q)
      );
    });
  }, [employees, query]);

  async function updateRecord(employeeId: string, patch: Record<string, string>) {
    const existing = dayMap.get(employeeId);
    const merged = {
      employeeId,
      date,
      status: existing?.status || "Present",
      checkIn: existing?.checkIn || "",
      checkOut: existing?.checkOut || "",
      notes: existing?.notes || "",
      ...patch,
    };
    try {
      await upsert(merged);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function markAllPresent() {
    try {
      for (const emp of employees) {
        const existing = dayMap.get(emp.id);
        await upsert({
          employeeId: emp.id,
          date,
          status: "Present",
          checkIn: existing?.checkIn || "09:30",
          checkOut: existing?.checkOut || "18:30",
          notes: existing?.notes || "",
        });
      }
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    const rows = attendance.map((a) => {
      const emp = employees.find((e) => e.id === a.employeeId);
      return {
        date: a.date,
        employeeCode: emp?.employeeCode ?? "",
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        status: a.status,
        checkIn: a.checkIn ?? "",
        checkOut: a.checkOut ?? "",
        notes: a.notes ?? "",
      };
    });
    downloadCSV(`attendance-${date}.csv`, toCSV(rows));
  }

  const counts: Record<string, number> = {};
  attendance.forEach((r) => (counts[r.status] = (counts[r.status] || 0) + 1));

  return (
    <>
      <Header
        title="Attendance"
        subtitle={`Mark attendance for ${formatDate(date)}`}
        actions={
          <>
            <input type="date" className="input w-44" value={date} onChange={(e) => setDate(e.target.value)} />
            <button className="btn-secondary" onClick={handleExport}>
              Export Day CSV
            </button>
            <button className="btn-primary" onClick={markAllPresent}>
              Mark All Present
            </button>
          </>
        }
      />
      <div className="space-y-4 p-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUSES.map((s) => (
            <div key={s} className="card flex items-center justify-between py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">{s}</span>
              <span className="text-lg font-semibold text-slate-900">{counts[s] || 0}</span>
            </div>
          ))}
        </section>

        <div className="card">
          <div className="mb-4">
            <input placeholder="Search employees..." className="input" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => {
                  const rec = dayMap.get(emp.id);
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                            {initials(`${emp.firstName} ${emp.lastName}`)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {emp.firstName} {emp.lastName}
                            </p>
                            <p className="text-xs text-slate-500">{emp.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700">{emp.department}</td>
                      <td>
                        <input
                          type="time"
                          className="input w-28"
                          defaultValue={rec?.checkIn ?? ""}
                          onBlur={(e) => updateRecord(emp.id, { checkIn: e.target.value })}
                        />
                      </td>
                      <td>
                        <input
                          type="time"
                          className="input w-28"
                          defaultValue={rec?.checkOut ?? ""}
                          onBlur={(e) => updateRecord(emp.id, { checkOut: e.target.value })}
                        />
                      </td>
                      <td>
                        <select
                          className="input w-32"
                          value={rec?.status ?? "Present"}
                          onChange={(e) => updateRecord(emp.id, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="input"
                          placeholder="Optional notes"
                          defaultValue={rec?.notes ?? ""}
                          onBlur={(e) => updateRecord(emp.id, { notes: e.target.value })}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No employees found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
