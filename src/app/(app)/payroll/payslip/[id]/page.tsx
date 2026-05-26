"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatCurrency, formatDate, useCompanySettings, useEmployees, usePayroll } from "@/lib/hrms";

export default function PayslipPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const { data: payroll } = usePayroll();
  const { data: employees } = useEmployees();
  const { data: company } = useCompanySettings();

  const payslip = payroll.find((p) => p.id === params.id);
  const employee = payslip ? employees.find((e) => e.id === payslip.employeeId) : undefined;

  useEffect(() => {
    document.title = payslip ? `Payslip — ${payslip.month}` : "Payslip";
  }, [payslip]);

  if (!payslip) {
    return (
      <div className="p-10">
        <p className="text-sm text-slate-500">Payslip not found.</p>
        <Link className="btn-secondary mt-3 inline-flex" href="/payroll">← Back to payroll</Link>
      </div>
    );
  }

  const gross = payslip.basic + payslip.hra + payslip.allowances;

  return (
    <div className="min-h-screen bg-slate-100 py-10 dark:bg-ink-950">
      {/* Toolbar — hidden on print */}
      <div className="no-print mx-auto mb-4 flex max-w-3xl items-center justify-between px-4">
        <Link className="btn-secondary text-sm" href="/payroll">
          ← Back to Payroll
        </Link>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={() => router.back()}>
            Cancel
          </button>
          <button className="btn-primary text-sm" onClick={() => window.print()}>
            🖨  Download / Print PDF
          </button>
        </div>
      </div>

      {/* Payslip card */}
      <div className="print-card mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-xl dark:bg-ink-900 dark:ring-1 dark:ring-white/5 print:rounded-none print:shadow-none">
        <div className="flex items-start justify-between border-b border-slate-200 pb-6 dark:border-white/10">
          <div className="flex items-center gap-4">
            {company?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.logoUrl} alt="logo" className="h-12 w-12 rounded-lg border border-slate-200 object-contain p-1" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{company?.name || "PeopleHub Inc."}</p>
              {company?.legalName ? <p className="text-xs text-slate-500 dark:text-slate-400">{company.legalName}</p> : null}
              {company?.address ? <p className="text-xs text-slate-500 dark:text-slate-400">{company.address}</p> : null}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Payslip</p>
            <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">{payslip.month}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Status:{" "}
              {payslip.paid ? (
                <span className="font-semibold text-emerald-600">Paid</span>
              ) : (
                <span className="font-semibold text-amber-600">Pending</span>
              )}
            </p>
          </div>
        </div>

        {/* Employee block */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Block label="Employee Name" value={employee ? `${employee.firstName} ${employee.lastName}` : "—"} />
          <Block label="Employee Code" value={employee?.employeeCode || "—"} />
          <Block label="Designation" value={employee?.designation || "—"} />
          <Block label="Department" value={employee?.department || "—"} />
          <Block label="Joining Date" value={employee?.joiningDate ? formatDate(employee.joiningDate) : "—"} />
          <Block label="Email" value={employee?.email || "—"} />
        </div>

        {/* Earnings/Deductions */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Earnings</p>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Basic" value={formatCurrency(payslip.basic)} />
                <Row label="HRA" value={formatCurrency(payslip.hra)} />
                <Row label="Allowances" value={formatCurrency(payslip.allowances)} />
                <tr className="border-t-2 border-slate-300 dark:border-white/20">
                  <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">Gross Earnings</td>
                  <td className="py-2 text-right font-bold text-slate-900 dark:text-slate-100">{formatCurrency(gross)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Deductions</p>
            <table className="w-full text-sm">
              <tbody>
                <Row label="Total Deductions" value={formatCurrency(payslip.deductions)} />
                <tr className="border-t-2 border-slate-300 dark:border-white/20">
                  <td className="py-2 font-semibold text-slate-900 dark:text-slate-100">Total Deductions</td>
                  <td className="py-2 text-right font-bold text-rose-600">- {formatCurrency(payslip.deductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Net pay */}
        <div className="mt-8 rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-fuchsia-50 p-5 dark:border-brand-500/30 dark:from-brand-500/10 dark:to-fuchsia-500/10">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">Net Pay</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(payslip.net)}</p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          This is a computer-generated payslip and does not require a signature. Generated on {formatDate(new Date().toISOString())}.
        </p>
      </div>
    </div>
  );
}

function Block({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5">
      <td className="py-2 text-slate-700 dark:text-slate-300">{label}</td>
      <td className="py-2 text-right text-slate-900 dark:text-slate-100">{value}</td>
    </tr>
  );
}
