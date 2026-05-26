"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  Announcement,
  Asset,
  AttendanceRecord,
  Candidate,
  CompanySettings,
  Department,
  Employee,
  EmployeeDocument,
  Holiday,
  LeaveRequest,
  PayrollRecord,
  PerformanceReview,
} from "./types";

async function http<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

function useApiList<T>(url: string): {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const json = await http<T[]>(url);
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// Employees
export function useEmployees() {
  const state = useApiList<Employee>("/api/employees");
  return {
    ...state,
    create: async (emp: Omit<Employee, "id">) => {
      await http("/api/employees", { method: "POST", body: JSON.stringify(emp) });
      await state.refresh();
    },
    update: async (id: string, emp: Omit<Employee, "id">) => {
      await http(`/api/employees/${id}`, { method: "PUT", body: JSON.stringify(emp) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/employees/${id}`, { method: "DELETE" });
      await state.refresh();
    },
    importMany: async (rows: Partial<Employee>[]) => {
      const r = await http<{ inserted: number }>("/api/employees/import", {
        method: "POST",
        body: JSON.stringify(rows),
      });
      await state.refresh();
      return r;
    },
  };
}

// Departments
export function useDepartments() {
  const state = useApiList<Department>("/api/departments");
  return {
    ...state,
    create: async (d: Omit<Department, "id">) => {
      await http("/api/departments", { method: "POST", body: JSON.stringify(d) });
      await state.refresh();
    },
    update: async (id: string, d: Omit<Department, "id">) => {
      await http(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(d) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/departments/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Attendance
export function useAttendance(date?: string) {
  const url = date ? `/api/attendance?date=${date}` : "/api/attendance";
  const state = useApiList<AttendanceRecord>(url);
  return {
    ...state,
    upsert: async (rec: Partial<AttendanceRecord> & { employeeId: string; date: string }) => {
      await http("/api/attendance", { method: "POST", body: JSON.stringify(rec) });
      await state.refresh();
    },
  };
}

// Leaves
export function useLeaves() {
  const state = useApiList<LeaveRequest>("/api/leaves");
  return {
    ...state,
    create: async (l: Omit<LeaveRequest, "id" | "appliedOn">) => {
      await http("/api/leaves", { method: "POST", body: JSON.stringify(l) });
      await state.refresh();
    },
    setStatus: async (id: string, status: string) => {
      await http(`/api/leaves/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/leaves/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Payroll
export function usePayroll(month?: string) {
  const url = month ? `/api/payroll?month=${month}` : "/api/payroll";
  const state = useApiList<PayrollRecord>(url);
  return {
    ...state,
    upsert: async (rec: Partial<PayrollRecord> & { employeeId: string; month: string }) => {
      await http("/api/payroll", { method: "POST", body: JSON.stringify(rec) });
      await state.refresh();
    },
    generate: async (month: string) => {
      const r = await http<{ generated: number }>("/api/payroll/generate", {
        method: "POST",
        body: JSON.stringify({ month }),
      });
      await state.refresh();
      return r;
    },
  };
}

// Announcements
export function useAnnouncements() {
  const state = useApiList<Announcement>("/api/announcements");
  return {
    ...state,
    create: async (a: Omit<Announcement, "id" | "postedAt">) => {
      await http("/api/announcements", { method: "POST", body: JSON.stringify(a) });
      await state.refresh();
    },
    update: async (id: string, a: Omit<Announcement, "id" | "postedAt">) => {
      await http(`/api/announcements/${id}`, { method: "PUT", body: JSON.stringify(a) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/announcements/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Holidays
export function useHolidays() {
  const state = useApiList<Holiday>("/api/holidays");
  return {
    ...state,
    create: async (h: Omit<Holiday, "id">) => {
      await http("/api/holidays", { method: "POST", body: JSON.stringify(h) });
      await state.refresh();
    },
    update: async (id: string, h: Omit<Holiday, "id">) => {
      await http(`/api/holidays/${id}`, { method: "PUT", body: JSON.stringify(h) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/holidays/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Assets
export function useAssets() {
  const state = useApiList<Asset>("/api/assets");
  return {
    ...state,
    create: async (a: Omit<Asset, "id">) => {
      await http("/api/assets", { method: "POST", body: JSON.stringify(a) });
      await state.refresh();
    },
    update: async (id: string, a: Omit<Asset, "id">) => {
      await http(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(a) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/assets/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Candidates
export function useCandidates() {
  const state = useApiList<Candidate>("/api/candidates");
  return {
    ...state,
    create: async (c: Omit<Candidate, "id">) => {
      await http("/api/candidates", { method: "POST", body: JSON.stringify(c) });
      await state.refresh();
    },
    update: async (id: string, c: Omit<Candidate, "id">) => {
      await http(`/api/candidates/${id}`, { method: "PUT", body: JSON.stringify(c) });
      await state.refresh();
    },
    setStage: async (id: string, stage: string) => {
      await http(`/api/candidates/${id}`, { method: "PATCH", body: JSON.stringify({ stage }) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/candidates/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Performance reviews
export function useReviews() {
  const state = useApiList<PerformanceReview>("/api/reviews");
  return {
    ...state,
    create: async (r: Omit<PerformanceReview, "id">) => {
      await http("/api/reviews", { method: "POST", body: JSON.stringify(r) });
      await state.refresh();
    },
    update: async (id: string, r: Omit<PerformanceReview, "id">) => {
      await http(`/api/reviews/${id}`, { method: "PUT", body: JSON.stringify(r) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/reviews/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Documents
export function useDocuments(employeeId?: string) {
  const url = employeeId ? `/api/documents?employeeId=${employeeId}` : "/api/documents";
  const state = useApiList<EmployeeDocument>(url);
  return {
    ...state,
    create: async (d: Omit<EmployeeDocument, "id">) => {
      await http("/api/documents", { method: "POST", body: JSON.stringify(d) });
      await state.refresh();
    },
    update: async (id: string, d: Omit<EmployeeDocument, "id">) => {
      await http(`/api/documents/${id}`, { method: "PUT", body: JSON.stringify(d) });
      await state.refresh();
    },
    remove: async (id: string) => {
      await http(`/api/documents/${id}`, { method: "DELETE" });
      await state.refresh();
    },
  };
}

// Company settings (single row)
export function useCompanySettings() {
  const [data, setData] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const json = await http<CompanySettings>("/api/settings");
      setData(json);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    update: async (s: CompanySettings) => {
      await http("/api/settings", { method: "PUT", body: JSON.stringify(s) });
      await refresh();
    },
  };
}

// Leave policy defaults (annual allocation per type)
export const LEAVE_ALLOCATIONS: Record<string, number> = {
  Casual: 12,
  Sick: 8,
  Earned: 15,
  Maternity: 180,
  Paternity: 15,
  // Unpaid is unlimited — represented as Infinity below
};

export function leaveDayCount(from: string, to: string): number {
  if (!from || !to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(1, Math.round(ms / 86400000) + 1);
}

export interface LeaveBalance {
  type: string;
  allocated: number; // Infinity for Unpaid
  used: number;
  pending: number;
  remaining: number; // Infinity for Unpaid
}

export function computeLeaveBalances(
  employeeId: string,
  leaves: { employeeId: string; type: string; fromDate: string; toDate: string; status: string }[],
  year: number = new Date().getFullYear(),
): LeaveBalance[] {
  const types = ["Casual", "Sick", "Earned", "Maternity", "Paternity", "Unpaid"];
  return types.map((t) => {
    const matched = leaves.filter(
      (l) => l.employeeId === employeeId && l.type === t && l.fromDate.startsWith(String(year)),
    );
    const used = matched
      .filter((l) => l.status === "Approved")
      .reduce((s, l) => s + leaveDayCount(l.fromDate, l.toDate), 0);
    const pending = matched
      .filter((l) => l.status === "Pending")
      .reduce((s, l) => s + leaveDayCount(l.fromDate, l.toDate), 0);
    const allocated = t === "Unpaid" ? Infinity : LEAVE_ALLOCATIONS[t] ?? 0;
    const remaining = t === "Unpaid" ? Infinity : Math.max(0, allocated - used);
    return { type: t, allocated, used, pending, remaining };
  });
}

// Formatters
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}
