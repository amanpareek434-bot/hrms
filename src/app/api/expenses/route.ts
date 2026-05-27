import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ExpenseRow {
  id: string;
  employee_id: string;
  expense_date: string;
  category: string;
  amount: string | number;
  currency: string;
  merchant: string | null;
  description: string | null;
  attachment_url: string | null;
  status: string;
  approver_id: string | null;
  approved_at: string | null;
  rejected_reason: string | null;
  paid_in_payroll_id: string | null;
  created_at: string;
}

function rowToApi(r: ExpenseRow) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    expenseDate: r.expense_date,
    category: r.category,
    amount: Number(r.amount),
    currency: r.currency,
    merchant: r.merchant ?? "",
    description: r.description ?? "",
    attachmentUrl: r.attachment_url ?? "",
    status: r.status,
    approverId: r.approver_id ?? "",
    approvedAt: r.approved_at ?? "",
    rejectedReason: r.rejected_reason ?? "",
    paidInPayrollId: r.paid_in_payroll_id ?? "",
    createdAt: r.created_at,
  };
}

export async function GET(req: NextRequest) {
  try {
    const u = new URL(req.url);
    const employeeId = u.searchParams.get("employeeId");
    const status = u.searchParams.get("status");

    const where: string[] = [];
    const params: (string | number)[] = [];
    if (employeeId) {
      where.push("employee_id = ?");
      params.push(employeeId);
    }
    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    const sql = `SELECT id, employee_id, expense_date, category, amount, currency, merchant, description, attachment_url, status, approver_id, approved_at, rejected_reason, paid_in_payroll_id, created_at FROM expenses ${
      where.length ? "WHERE " + where.join(" AND ") : ""
    } ORDER BY expense_date DESC, created_at DESC`;
    const rows = await query<ExpenseRow>(sql, params);
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.employeeId || !body.expenseDate || !body.amount) {
      return NextResponse.json(
        { error: "employeeId, expenseDate, amount are required" },
        { status: 400 },
      );
    }
    const id = body.id || uid("e-");
    await exec(
      `INSERT INTO expenses
       (id, employee_id, expense_date, category, amount, currency, merchant, description, attachment_url, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.employeeId,
        body.expenseDate,
        body.category || "Other",
        Number(body.amount),
        body.currency || "INR",
        body.merchant || null,
        body.description || null,
        body.attachmentUrl || null,
        body.status || "Pending",
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
