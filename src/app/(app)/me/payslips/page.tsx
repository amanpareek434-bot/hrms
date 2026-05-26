"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header";
import { formatCurrency, usePayroll } from "@/lib/hrms";

interface Me {
  uid: string;
  role: string;
  employeeId?: string;
}

export default function MyPayslipsPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: payroll } = usePayroll();

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

  const myPayroll = useMemo(
    () => payroll.filter((p) => p.employeeId === employeeId).sort((a, b) => b.month.localeCompare(a.month)),
    [payroll, employeeId],
  );

  const totals = useMemo(() => {
    return myPayroll.reduce(
      (acc, p) => {
        acc.gross += p.basic + p.hra + p.allowances;
        acc.deductions += p.deductions;
        acc.net += p.net;
        if (p.paid) acc.paid += p.net;
        else acc.pending += p.net;
        return acc;
      },
      { gross: 0, deductions: 0, net: 0, paid: 0, pending: 0 },
    );
  }, [myPayroll]);

  if (loading) return <PageMsg msg="Loading…" />;
  if (!me?.employeeId) return <PageMsg msg="Your account is not linked to an employee." back />;

  return (
    <>
      <Header
        title="My Payslips"
        subtitle={`${myPayroll.length} record${myPayroll.length === 1 ? "" : "s"}`}
      />

      <div className="space-y-6 p-6">
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KPI label="Total Gross" value={formatCurrency(totals.gross)} tone="brand" />
          <KPI label="Total Deductions" value={formatCurrency(totals.deductions)} tone="rose" />
          <KPI label="Total Net" value={formatCurrency(totals.net)} tone="emerald" />
          <KPI label="Paid" value={formatCurrency(totals.paid)} tone="amber" />
        </section>

        <section className="card">
          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Basic</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {myPayroll.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">{p.month}</td>
                    <td>{formatCurrency(p.basic)}</td>
                    <td>{formatCurrency(p.hra)}</td>
                    <td>{formatCurrency(p.allowances)}</td>
                    <td className="text-rose-600">- {formatCurrency(p.deductions)}</td>
                    <td className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(p.net)}</td>
                    <td>
                      {p.paid ? <span className="badge-green">Paid</span> : <span className="badge-amber">Pending</span>}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/payroll/payslip/${p.id}`}
                        className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20"
                      >
                        Download PDF →
                      </Link>
                    </td>
                  </tr>
                ))}
                {myPayroll.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No payslips yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
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

function KPI({ label, value, tone }: { label: string; value: string; tone: "emerald" | "rose" | "amber" | "brand" }) {
  const map = {
    emerald: "from-emerald-50 to-white border-emerald-200 dark:border-emerald-500/20 dark:from-emerald-500/10 dark:to-transparent",
    rose: "from-rose-50 to-white border-rose-200 dark:border-rose-500/20 dark:from-rose-500/10 dark:to-transparent",
    amber: "from-amber-50 to-white border-amber-200 dark:border-amber-500/20 dark:from-amber-500/10 dark:to-transparent",
    brand: "from-brand-50 to-white border-brand-200 dark:border-brand-500/20 dark:from-brand-500/10 dark:to-transparent",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-5 ${map[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function PageMsg({ msg, back }: { msg: string; back?: boolean }) {
  return (
    <>
      <Header title="My Payslips" />
      <div className="p-6 text-sm text-slate-500">
        <p>{msg}</p>
        {back ? <Link href="/me" className="mt-2 inline-block text-brand-600 hover:underline">← Back</Link> : null}
      </div>
    </>
  );
}
