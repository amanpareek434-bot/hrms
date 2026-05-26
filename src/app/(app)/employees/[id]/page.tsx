"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Header from "@/components/Header";
import {
  computeLeaveBalances,
  formatCurrency,
  formatDate,
  initials,
  useAssets,
  useAttendance,
  useDocuments,
  useEmployees,
  useLeaves,
  usePayroll,
  useReviews,
} from "@/lib/hrms";

const TABS = ["Overview", "Attendance", "Leaves", "Payroll", "Assets", "Documents", "Reviews"] as const;
type Tab = (typeof TABS)[number];

export default function EmployeeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const employeeId = params.id;

  const { data: employees, loading } = useEmployees();
  const { data: attendance } = useAttendance();
  const { data: leaves } = useLeaves();
  const { data: payroll } = usePayroll();
  const { data: assets } = useAssets();
  const { data: documents } = useDocuments(employeeId);
  const { data: reviews } = useReviews();

  const [tab, setTab] = useState<Tab>("Overview");

  const employee = employees.find((e) => e.id === employeeId);

  const empAttendance = useMemo(
    () => attendance.filter((a) => a.employeeId === employeeId).sort((a, b) => b.date.localeCompare(a.date)),
    [attendance, employeeId],
  );
  const empLeaves = useMemo(() => leaves.filter((l) => l.employeeId === employeeId), [leaves, employeeId]);
  const empPayroll = useMemo(
    () => payroll.filter((p) => p.employeeId === employeeId).sort((a, b) => b.month.localeCompare(a.month)),
    [payroll, employeeId],
  );
  const empAssets = useMemo(() => assets.filter((a) => a.assignedTo === employeeId), [assets, employeeId]);
  const empReviews = useMemo(
    () => reviews.filter((r) => r.employeeId === employeeId).sort((a, b) => b.period.localeCompare(a.period)),
    [reviews, employeeId],
  );

  const tenureYears = useMemo(() => {
    if (!employee?.joiningDate) return 0;
    const diff = Date.now() - new Date(employee.joiningDate).getTime();
    return Math.max(0, Math.floor(diff / (365 * 86400000)));
  }, [employee]);

  const ytdNet = empPayroll.reduce((s, p) => s + (p.paid ? p.net : 0), 0);
  const attendanceLast30 = empAttendance.filter((a) => {
    const d30 = Date.now() - 30 * 86400000;
    return new Date(a.date).getTime() >= d30;
  });
  const presentDays = attendanceLast30.filter((a) => a.status === "Present").length;
  const leaveDaysApproved = empLeaves
    .filter((l) => l.status === "Approved")
    .reduce((sum, l) => sum + Math.max(1, Math.round((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / 86400000) + 1), 0);

  if (loading && !employee) {
    return (
      <>
        <Header title="Loading…" />
        <div className="p-6 text-sm text-slate-500">Fetching employee…</div>
      </>
    );
  }

  if (!employee) {
    return (
      <>
        <Header title="Employee not found" />
        <div className="p-6">
          <Link className="btn-secondary" href="/employees">
            ← Back to Employees
          </Link>
        </div>
      </>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <>
      <Header
        title={fullName}
        subtitle={`${employee.designation} · ${employee.department} · ${employee.employeeCode}`}
        actions={
          <>
            <Link href="/employees" className="btn-ghost text-sm">
              ← All employees
            </Link>
            <button className="btn-secondary" onClick={() => router.push("/employees")}>
              Edit in list
            </button>
          </>
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 p-4 sm:p-6 lg:px-8">
        {/* Profile card */}
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white shadow-glow">
                {initials(fullName)}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{fullName}</h1>
                <p className="text-sm text-slate-600">{employee.designation}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {employee.email} {employee.phone ? `· ${employee.phone}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge status={employee.status} />
                  <span className="badge-slate">{employee.department}</span>
                  <span className="badge-blue">{employee.employeeCode}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Tenure" value={`${tenureYears} yr${tenureYears === 1 ? "" : "s"}`} />
              <Stat label="Salary" value={formatCurrency(employee.salary)} />
              <Stat label="Joined" value={formatDate(employee.joiningDate)} />
              <Stat label="DOB" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : "—"} />
            </div>
          </div>
        </section>

        {/* KPI strip */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KPI label="Present (last 30d)" value={presentDays} tone="emerald" />
          <KPI label="Leaves taken" value={leaveDaysApproved} tone="amber" />
          <KPI label="Paid YTD" value={formatCurrency(ytdNet)} tone="brand" />
          <KPI label="Assets" value={empAssets.length} tone="rose" />
        </section>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-slate-200">
            <div className="flex flex-wrap gap-1">
              {TABS.map((t) => {
                const active = t === tab;
                return (
                  <button
                    key={t}
                    className={`relative -mb-px px-4 py-2 text-sm font-medium transition ${
                      active ? "border-b-2 border-brand-600 text-brand-700" : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => setTab(t)}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-2 sm:p-4">
            {tab === "Overview" && <OverviewTab employee={employee} />}
            {tab === "Attendance" && <AttendanceTab list={empAttendance} />}
            {tab === "Leaves" && <LeavesTab list={empLeaves} employeeId={employeeId} />}
            {tab === "Payroll" && <PayrollTab list={empPayroll} />}
            {tab === "Assets" && <AssetsTab list={empAssets} />}
            {tab === "Documents" && <DocumentsTab employeeId={employeeId} />}
            {tab === "Reviews" && <ReviewsTab list={empReviews} />}
          </div>
        </div>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function KPI({ label, value, tone }: { label: string; value: string | number; tone: "emerald" | "amber" | "brand" | "rose" }) {
  const map = {
    emerald: "from-emerald-50 to-white border-emerald-200 text-emerald-700",
    amber: "from-amber-50 to-white border-amber-200 text-amber-700",
    brand: "from-brand-50 to-white border-brand-200 text-brand-700",
    rose: "from-rose-50 to-white border-rose-200 text-rose-700",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${map[tone]}`}>
      <p className="text-[10px] uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "badge-green",
    "On Leave": "badge-amber",
    Resigned: "badge-slate",
    Terminated: "badge-rose",
  };
  return <span className={map[status] || "badge-slate"}>{status}</span>;
}

function OverviewTab({ employee }: { employee: ReturnType<typeof useEmployees>["data"][number] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Detail label="Full name" value={`${employee.firstName} ${employee.lastName}`} />
      <Detail label="Email" value={employee.email} />
      <Detail label="Phone" value={employee.phone || "—"} />
      <Detail label="Employee Code" value={employee.employeeCode} />
      <Detail label="Department" value={employee.department || "—"} />
      <Detail label="Designation" value={employee.designation || "—"} />
      <Detail label="Joining Date" value={formatDate(employee.joiningDate)} />
      <Detail label="Date of Birth" value={employee.dateOfBirth ? formatDate(employee.dateOfBirth) : "—"} />
      <Detail label="Salary" value={formatCurrency(employee.salary)} />
      <Detail label="Status" value={employee.status} />
      <div className="md:col-span-2">
        <Detail label="Address" value={employee.address || "—"} />
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value}</p>
    </div>
  );
}

function AttendanceTab({ list }: { list: ReturnType<typeof useAttendance>["data"] }) {
  if (list.length === 0) return <Empty msg="No attendance records." />;
  return (
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
        {list.slice(0, 30).map((a) => (
          <tr key={a.id}>
            <td>{formatDate(a.date)}</td>
            <td className="font-mono text-xs">{a.checkIn || "—"}</td>
            <td className="font-mono text-xs">{a.checkOut || "—"}</td>
            <td>{a.status}</td>
            <td className="text-xs text-slate-500">{a.notes || "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LeavesTab({ list, employeeId }: { list: ReturnType<typeof useLeaves>["data"]; employeeId: string }) {
  const balances = computeLeaveBalances(employeeId, list);
  return (
    <div className="space-y-6">
      {/* Balances */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Leave Balances ({new Date().getFullYear()})</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {balances.map((b) => (
            <div key={b.type} className="rounded-lg border border-slate-200 p-3 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{b.type}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
                {b.allocated === Infinity ? "∞" : b.remaining}
                {b.allocated !== Infinity ? <span className="text-xs font-normal text-slate-400"> / {b.allocated}</span> : null}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {b.used} used{b.pending > 0 ? ` · ${b.pending} pending` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <Empty msg="No leave requests." />
      ) : (
        <table className="table-base">
          <thead>
            <tr>
              <th>Type</th>
              <th>From</th>
              <th>To</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((l) => {
              const days = Math.max(1, Math.round((new Date(l.toDate).getTime() - new Date(l.fromDate).getTime()) / 86400000) + 1);
              return (
                <tr key={l.id}>
                  <td>{l.type}</td>
                  <td>{formatDate(l.fromDate)}</td>
                  <td>{formatDate(l.toDate)}</td>
                  <td>{days}</td>
                  <td className="max-w-md truncate text-slate-600" title={l.reason}>
                    {l.reason || "—"}
                  </td>
                  <td>{l.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

function PayrollTab({ list }: { list: ReturnType<typeof usePayroll>["data"] }) {
  if (list.length === 0) return <Empty msg="No payroll yet." />;
  return (
    <table className="table-base">
      <thead>
        <tr>
          <th>Month</th>
          <th>Basic</th>
          <th>HRA</th>
          <th>Allowances</th>
          <th>Deductions</th>
          <th>Net</th>
          <th>Paid</th>
        </tr>
      </thead>
      <tbody>
        {list.map((p) => (
          <tr key={p.id}>
            <td className="font-medium">{p.month}</td>
            <td>{formatCurrency(p.basic)}</td>
            <td>{formatCurrency(p.hra)}</td>
            <td>{formatCurrency(p.allowances)}</td>
            <td>{formatCurrency(p.deductions)}</td>
            <td className="font-semibold">{formatCurrency(p.net)}</td>
            <td>{p.paid ? <span className="badge-green">Paid</span> : <span className="badge-amber">Pending</span>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AssetsTab({ list }: { list: ReturnType<typeof useAssets>["data"] }) {
  if (list.length === 0) return <Empty msg="No assets assigned." />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {list.map((a) => (
        <div key={a.id} className="rounded-lg border border-slate-200 p-4">
          <p className="font-semibold text-slate-900">{a.name}</p>
          <p className="text-xs text-slate-500">
            {a.category} · {a.serialNo || "—"}
          </p>
          <p className="mt-2 text-xs text-slate-600">Assigned on {formatDate(a.assignedOn)}</p>
          {a.notes ? <p className="mt-1 text-xs text-slate-500">{a.notes}</p> : null}
        </div>
      ))}
    </div>
  );
}

function DocumentsTab({ employeeId }: { employeeId: string }) {
  const { data } = useDocuments(employeeId);
  if (data.length === 0) return <Empty msg="No documents." />;
  return (
    <ul className="divide-y divide-slate-100">
      {data.map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">{d.title}</p>
              <p className="text-xs text-slate-500">
                {d.category} · {formatDate(d.uploadedOn)}
              </p>
            </div>
          </div>
          {d.fileUrl ? (
            <a className="text-xs font-medium text-brand-600 hover:underline" href={d.fileUrl} target="_blank" rel="noopener noreferrer">
              Open →
            </a>
          ) : (
            <span className="text-xs text-slate-400">No link</span>
          )}
        </li>
      ))}
    </ul>
  );
}

function ReviewsTab({ list }: { list: ReturnType<typeof useReviews>["data"] }) {
  if (list.length === 0) return <Empty msg="No reviews yet." />;
  return (
    <div className="space-y-3">
      {list.map((r) => (
        <div key={r.id} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{r.period}</p>
              <p className="text-xs text-slate-500">
                Reviewer: {r.reviewer || "—"} {r.reviewedOn ? `· ${formatDate(r.reviewedOn)}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">{(r.rating || 0).toFixed(1)}<span className="text-sm font-normal text-slate-500"> / 5</span></p>
              <p className="text-xs text-slate-500">{r.status}</p>
            </div>
          </div>
          {r.strengths ? (
            <p className="mt-3 text-xs">
              <span className="font-semibold text-emerald-700">Strengths:</span>{" "}
              <span className="text-slate-700">{r.strengths}</span>
            </p>
          ) : null}
          {r.improvements ? (
            <p className="mt-1 text-xs">
              <span className="font-semibold text-amber-700">Improve:</span>{" "}
              <span className="text-slate-700">{r.improvements}</span>
            </p>
          ) : null}
          {r.goals ? (
            <p className="mt-1 text-xs">
              <span className="font-semibold text-brand-700">Goals:</span>{" "}
              <span className="text-slate-700">{r.goals}</span>
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return <p className="py-10 text-center text-sm text-slate-500">{msg}</p>;
}
