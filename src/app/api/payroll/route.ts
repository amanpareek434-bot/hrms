import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface PayrollRow {
  id: string;
  employee_id: string;
  month: string;
  basic: string | number;
  hra: string | number;
  allowances: string | number;
  deductions: string | number;
  net: string | number;
  paid: number;
}

function rowToApi(r: PayrollRow) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    month: r.month,
    basic: Number(r.basic),
    hra: Number(r.hra),
    allowances: Number(r.allowances),
    deductions: Number(r.deductions),
    net: Number(r.net),
    paid: !!r.paid,
  };
}

export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get("month");
    const sql = month
      ? "SELECT id, employee_id, month, basic, hra, allowances, deductions, net, paid FROM payroll WHERE month=? ORDER BY created_at DESC"
      : "SELECT id, employee_id, month, basic, hra, allowances, deductions, net, paid FROM payroll ORDER BY month DESC, created_at DESC LIMIT 500";
    const rows = await query<PayrollRow>(sql, month ? [month] : []);
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || uid("p-");
    const net =
      Number(body.basic || 0) + Number(body.hra || 0) + Number(body.allowances || 0) - Number(body.deductions || 0);
    await exec(
      `INSERT INTO payroll (id, employee_id, month, basic, hra, allowances, deductions, net, paid)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         basic=VALUES(basic), hra=VALUES(hra), allowances=VALUES(allowances),
         deductions=VALUES(deductions), net=VALUES(net), paid=VALUES(paid)`,
      [
        id,
        body.employeeId,
        body.month,
        body.basic || 0,
        body.hra || 0,
        body.allowances || 0,
        body.deductions || 0,
        net,
        body.paid ? 1 : 0,
      ],
    );
    return NextResponse.json({ id, ...body, net, paid: !!body.paid });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
