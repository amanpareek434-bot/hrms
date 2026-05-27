"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import Header from "@/components/Header";
import Modal from "@/components/Modal";
import { downloadCSV, parseCSV, toCSV } from "@/lib/csv";
import { formatCurrency, formatDate, initials, nextEmployeeCode, useDepartments, useEmployees } from "@/lib/hrms";
import type { Employee, EmployeeStatus } from "@/lib/types";

const STATUSES: EmployeeStatus[] = ["Active", "On Leave", "Resigned", "Terminated"];

const EMPTY: Omit<Employee, "id"> = {
  employeeCode: "",
  esslUserId: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  dateOfBirth: "",
  salary: 0,
  status: "Active",
  address: "",
};

export default function EmployeesPage() {
  const { data: employees, loading, error, create, update, remove, importMany } = useEmployees();
  const { data: departments } = useDepartments();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [deptFilter, setDeptFilter] = useState<string>("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Employee, "id">>(EMPTY);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Record<string, string>[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [loginModalEmp, setLoginModalEmp] = useState<Employee | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  function openCreateLogin(emp: Employee) {
    setLoginModalEmp(emp);
    setLoginEmail(emp.email);
    setLoginPassword("");
  }

  async function submitCreateLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginModalEmp) return;
    setLoginSubmitting(true);
    try {
      const res = await fetch("/api/users/create-employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: loginModalEmp.id, email: loginEmail, password: loginPassword }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      alert(`Login created for ${loginModalEmp.firstName}. They can sign in at /login with the email + password.`);
      setLoginModalEmp(null);
      setLoginEmail("");
      setLoginPassword("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoginSubmitting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (statusFilter !== "All" && e.status !== statusFilter) return false;
      if (deptFilter !== "All" && e.department !== deptFilter) return false;
      if (!q) return true;
      return (
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q)
      );
    });
  }, [employees, query, statusFilter, deptFilter]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY, employeeCode: nextEmployeeCode(employees) });
    setModalOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditingId(emp.id);
    const { id: _id, ...rest } = emp;
    setForm(rest);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.email) return;
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

  async function handleDelete(emp: Employee) {
    if (!confirm(`Delete ${emp.firstName} ${emp.lastName}?`)) return;
    try {
      await remove(emp.id);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  function handleExport() {
    const cols: (keyof Employee)[] = [
      "employeeCode",
      "firstName",
      "lastName",
      "email",
      "phone",
      "department",
      "designation",
      "joiningDate",
      "salary",
      "status",
      "address",
    ];
    downloadCSV(
      `employees-${new Date().toISOString().slice(0, 10)}.csv`,
      toCSV(employees as unknown as Record<string, unknown>[], cols as string[]),
    );
  }

  function handleDownloadTemplate() {
    const template = toCSV(
      [
        {
          employeeCode: "EMP1001",
          firstName: "Aarav",
          lastName: "Singh",
          email: "aarav@company.com",
          phone: "+91 98200 11111",
          department: "Engineering",
          designation: "Software Engineer",
          joiningDate: "2024-01-15",
          salary: 75000,
          status: "Active",
          address: "Bengaluru, KA",
        },
      ],
      [
        "employeeCode",
        "firstName",
        "lastName",
        "email",
        "phone",
        "department",
        "designation",
        "joiningDate",
        "salary",
        "status",
        "address",
      ],
    );
    downloadCSV("employees-template.csv", template);
  }

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const rows = parseCSV(text);
      if (rows.length === 0) {
        setImportError("CSV file is empty.");
        return;
      }
      const required = ["firstName", "lastName", "email"];
      const missing = required.filter((col) => !(col in rows[0]));
      if (missing.length) {
        setImportError(`Missing required columns: ${missing.join(", ")}`);
        return;
      }
      setImportPreview(rows);
      setImportModalOpen(true);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function confirmImport() {
    if (!importPreview) return;
    setSubmitting(true);
    try {
      const rows = importPreview.map((r) => ({
        employeeCode: r.employeeCode,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        phone: r.phone,
        department: r.department,
        designation: r.designation,
        joiningDate: r.joiningDate,
        salary: Number(r.salary) || 0,
        status: (STATUSES.includes(r.status as EmployeeStatus) ? r.status : "Active") as EmployeeStatus,
        address: r.address,
      }));
      const res = await importMany(rows);
      alert(`Imported ${res.inserted} rows`);
      setImportPreview(null);
      setImportModalOpen(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header
        title="Employees"
        subtitle={loading ? "Loading…" : `${employees.length} total · ${filtered.length} shown`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFileChosen} className="hidden" />
            <button className="btn-secondary" onClick={() => fileRef.current?.click()}>
              <Icon path="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
              Import CSV
            </button>
            <button className="btn-secondary" onClick={handleExport}>
              <Icon path="M12 4v12m0 0l4-4m-4 4l-4-4M4 20h16" />
              Export CSV
            </button>
            <button className="btn-secondary" onClick={handleDownloadTemplate}>
              <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" />
              Template
            </button>
            <button className="btn-primary" onClick={openCreate}>
              <Icon path="M12 4v16m8-8H4" />
              Add Employee
            </button>
          </>
        }
      />
      <div className="mx-auto max-w-screen-2xl space-y-4 p-4 sm:p-6 lg:px-8">
        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <strong>DB Error:</strong> {error} — please ensure MySQL is running and schema.sql has been executed.
          </div>
        ) : null}
        {importError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{importError}</div>
        ) : null}

        <div className="card">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="absolute left-3 top-2.5 h-4 w-4 text-slate-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
              <input placeholder="Search by name, email, code, designation..." className="input pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <select className="input sm:w-44" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <select className="input sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joined</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <Link href={`/employees/${e.id}`} className="flex items-center gap-3 group">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {initials(`${e.firstName} ${e.lastName}`)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-brand-700">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{e.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="font-mono text-xs text-slate-600">{e.employeeCode}</td>
                    <td className="text-slate-700">{e.department}</td>
                    <td className="text-slate-700">{e.designation}</td>
                    <td className="text-slate-700">{formatDate(e.joiningDate)}</td>
                    <td className="font-medium text-slate-900">{formatCurrency(e.salary)}</td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="btn-ghost px-2 py-1 text-xs text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"
                          onClick={() => openCreateLogin(e)}
                          title="Create login account for this employee"
                        >
                          Login
                        </button>
                        <button className="btn-ghost px-2 py-1 text-xs" onClick={() => openEdit(e)}>
                          Edit
                        </button>
                        <button className="btn-ghost px-2 py-1 text-xs text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(e)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                      No employees match the current filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Employee" : "Add Employee"} size="lg">
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <Field label="Employee Code">
            <div className="flex gap-2">
              <input
                className="input flex-1"
                value={form.employeeCode}
                onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                required
              />
              {!editingId ? (
                <button
                  type="button"
                  className="btn-secondary whitespace-nowrap text-xs"
                  onClick={() => setForm({ ...form, employeeCode: nextEmployeeCode(employees) })}
                  title="Auto-generate next code"
                >
                  Auto
                </button>
              ) : null}
            </div>
            {!editingId ? (
              <p className="mt-1 text-xs text-slate-500">
                Auto-suggested as next sequential code. Edit if you use a different scheme.
              </p>
            ) : null}
          </Field>
          <Field label="eSSL User ID">
            <input
              className="input"
              placeholder="Device User ID (e.g. 1, 2, 1001)"
              value={form.esslUserId || ""}
              onChange={(e) => setForm({ ...form, esslUserId: e.target.value })}
            />
          </Field>
          <Field label="Status">
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as EmployeeStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="First Name">
            <input className="input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </Field>
          <Field label="Last Name">
            <input className="input" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </Field>
          <Field label="Phone">
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Department">
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Designation">
            <input className="input" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
          </Field>
          <Field label="Joining Date">
            <input type="date" className="input" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          </Field>
          <Field label="Date of Birth">
            <input type="date" className="input" value={form.dateOfBirth || ""} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </Field>
          <Field label="Monthly Salary (₹)">
            <input type="number" min={0} className="input" value={form.salary} onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Address">
              <textarea className="input" rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Field>
          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Save Changes" : "Add Employee"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={!!loginModalEmp} onClose={() => setLoginModalEmp(null)} title="Create Employee Login">
        <form className="space-y-4" onSubmit={submitCreateLogin}>
          {loginModalEmp ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Create a self-service portal login for{" "}
              <strong>{loginModalEmp.firstName} {loginModalEmp.lastName}</strong>. They&apos;ll be able to sign in and see only their own data.
            </p>
          ) : null}
          <div>
            <label className="label">Email</label>
            <input type="email" className="input" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </div>
          <div>
            <label className="label">Initial Password</label>
            <input
              type="text"
              className="input"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              minLength={6}
              required
              placeholder="At least 6 characters"
            />
            <p className="mt-1 text-xs text-slate-500">Share this with the employee. They can change it later.</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setLoginModalEmp(null)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loginSubmitting}>
              {loginSubmitting ? "Creating…" : "Create Login"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={importModalOpen} onClose={() => setImportModalOpen(false)} title="Preview CSV Import" size="lg">
        <p className="mb-3 text-sm text-slate-600">
          {importPreview?.length ?? 0} rows will be imported. Please review and confirm.
        </p>
        <div className="max-h-80 overflow-auto rounded-lg border border-slate-200">
          <table className="table-base">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {importPreview?.slice(0, 50).map((r, i) => (
                <tr key={i}>
                  <td className="font-mono text-xs">{r.employeeCode || "—"}</td>
                  <td>
                    {r.firstName} {r.lastName}
                  </td>
                  <td className="text-xs">{r.email}</td>
                  <td>{r.department || "—"}</td>
                  <td>{r.salary ? formatCurrency(Number(r.salary)) : "—"}</td>
                  <td>{r.status || "Active"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn-secondary" onClick={() => setImportModalOpen(false)}>
            Cancel
          </button>
          <button className="btn-primary" onClick={confirmImport} disabled={submitting}>
            {submitting ? "Importing…" : `Import ${importPreview?.length ?? 0} Rows`}
          </button>
        </div>
      </Modal>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
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
