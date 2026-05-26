"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { downloadCSV, toCSV } from "@/lib/csv";
import { formatCurrency, initials, useEmployees, usePayroll } from "@/lib/hrms";

export default function PayrollPage() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const { data: employees } = useEmployees();
  const { data: payroll, upsert, generate, refresh } = usePayroll(month);

  const recMap = useMemo(() => {
    const map = new Map<string, (typeof payroll)[number]>();
    payroll.forEach((p) => map.set(p.employeeId, p));
    return map;
  }, [payroll]);

  async function updateField(employeeId: string, field: "basic" | "hra" | "allowances" | "deductions" | "paid", value: number | boolean) {
    const existing = recMap.get(employeeId);
    if (!existing) {
      const emp = employees.find((e) => e.id === employeeId);
      const salary = emp?.salary || 0;
      const base = {
        basic: Math.round(salary * 0.6),
        hra: Math.round(salary * 0.2),
        allowances: Math.round(salary * 0.2),
        deductions: Math.round(salary * 0.08),
      };
      try {
        await upsert({ employeeId, month, ...base, [field]: value, paid: field === "paid" ? (value as boolean) : false });
      } catch (err) {
        alert((err as Error).message);
      }
      return;
    }
    try {
      await upsert({
        ...existing,
        [field]: value,
      });
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function markAllPaid() {
    try {
      for (const p of payroll) {
        if (!p.paid) await upsert({ ...p, paid: true });
      }
      await refresh();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function generateForMonth() {
    try {
      const res = await generate(month);
      if (res.generated === 0) alert("All payroll records already exist for this month.");
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    const rows = payroll.map((p) => {
      const emp = employees.find((e) => e.id === p.employeeId);
      return {
        month: p.month,
        employeeCode: emp?.employeeCode ?? "",
        employeeName: emp ? `${emp.firstName} ${emp.lastName}` : "",
        department: emp?.department ?? "",
        basic: p.basic,
        hra: p.hra,
        allowances: p.allowances,
        deductions: p.deductions,
        net: p.net,
        paid: p.paid ? "Yes" : "No",
      };
    });
    downloadCSV(`payroll-${month}.csv`, toCSV(rows));
  }

  const totals = payroll.reduce(
    (acc, p) => {
      acc.basic += p.basic;
      acc.hra += p.hra;
      acc.allow += p.allowances;
      acc.ded += p.deductions;
      acc.net += p.net;
      return acc;
    },
    { basic: 0, hra: 0, allow: 0, ded: 0, net: 0 },
  );

  return (
    <>
      <Header
        title="Payroll"
        subtitle={`Month ${month} · ${payroll.length} records`}
        actions={
          <>
            <input type="month" className="input w-44" value={month} onChange={(e) => setMonth(e.target.value)} />
            <button className="btn-secondary" onClick={generateForMonth}>
              Generate Missing
            </button>
            <button className="btn-secondary" onClick={handleExport}>
              Export CSV
            </button>
            <button className="btn-primary" onClick={markAllPaid}>
              Mark All Paid
            </button>
          </>
        }
      />
      <div className="mx-auto max-w-screen-2xl space-y-4 p-4 sm:p-6 lg:px-8">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <SummaryCard label="Basic" value={formatCurrency(totals.basic)} />
          <SummaryCard label="HRA" value={formatCurrency(totals.hra)} />
          <SummaryCard label="Allowances" value={formatCurrency(totals.allow)} />
          <SummaryCard label="Deductions" value={formatCurrency(totals.ded)} tone="rose" />
          <SummaryCard label="Net Payable" value={formatCurrency(totals.net)} tone="brand" />
        </section>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const rec = recMap.get(emp.id);
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
                      {rec ? (
                        <>
                          <td>
                            <input
                              type="number"
                              className="input w-28"
                              defaultValue={rec.basic}
                              onBlur={(e) => updateField(emp.id, "basic", Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input w-28"
                              defaultValue={rec.hra}
                              onBlur={(e) => updateField(emp.id, "hra", Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input w-28"
                              defaultValue={rec.allowances}
                              onBlur={(e) => updateField(emp.id, "allowances", Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              className="input w-28"
                              defaultValue={rec.deductions}
                              onBlur={(e) => updateField(emp.id, "deductions", Number(e.target.value))}
                            />
                          </td>
                          <td className="font-semibold text-slate-900">{formatCurrency(rec.net)}</td>
                          <td>
                            <span className={rec.paid ? "badge-green" : "badge-amber"}>{rec.paid ? "Paid" : "Unpaid"}</span>
                          </td>
                          <td className="text-right">
                            <div className="flex justify-end gap-1">
                              <Link
                                href={`/payroll/payslip/${rec.id}`}
                                className="btn-ghost px-2 py-1 text-xs text-brand-600 hover:bg-brand-50"
                              >
                                Payslip
                              </Link>
                              <button className="btn-ghost px-2 py-1 text-xs" onClick={() => updateField(emp.id, "paid", !rec.paid)}>
                                {rec.paid ? "Mark Unpaid" : "Mark Paid"}
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td colSpan={6} className="text-sm text-slate-500">
                            No payroll for this month
                          </td>
                          <td className="text-right">
                            <button className="btn-ghost px-2 py-1 text-xs" onClick={() => updateField(emp.id, "basic", Math.round(emp.salary * 0.6))}>
                              Generate
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No employees yet.
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

function SummaryCard({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "rose" | "brand" }) {
  const tones: Record<string, string> = {
    slate: "text-slate-900",
    rose: "text-rose-600",
    brand: "text-brand-700",
  };
  return (
    <div className="card py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tones[tone]}`}>{value}</p>
    </div>
  );
}
