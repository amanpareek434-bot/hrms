import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EmpRow {
  id: string;
  salary: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const { month } = await req.json();
    if (!month) return NextResponse.json({ error: "month is required" }, { status: 400 });

    const employees = await query<EmpRow>("SELECT id, salary FROM employees WHERE status='Active' OR status='On Leave'");
    let generated = 0;
    for (const emp of employees) {
      const salary = Number(emp.salary);
      const basic = Math.round(salary * 0.6);
      const hra = Math.round(salary * 0.2);
      const allowances = Math.round(salary * 0.2);
      const deductions = Math.round(salary * 0.08);
      const net = basic + hra + allowances - deductions;
      const id = uid("p-");
      const res = await exec(
        `INSERT IGNORE INTO payroll (id, employee_id, month, basic, hra, allowances, deductions, net, paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, emp.id, month, basic, hra, allowances, deductions, net],
      );
      if (res.affectedRows > 0) generated++;
    }
    return NextResponse.json({ generated });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
