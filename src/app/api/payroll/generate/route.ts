import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EmpRow {
  id: string;
  salary: string | number;
}

interface ExpenseSum {
  total: string | number;
}

export async function POST(req: NextRequest) {
  try {
    const { month, includeExpenses = true } = await req.json();
    if (!month) return NextResponse.json({ error: "month is required" }, { status: 400 });

    const employees = await query<EmpRow>(
      "SELECT id, salary FROM employees WHERE status='Active' OR status='On Leave'",
    );
    let generated = 0;
    let reimbursedCount = 0;
    let reimbursedAmt = 0;

    for (const emp of employees) {
      const salary = Number(emp.salary);
      const basic = Math.round(salary * 0.6);
      const hra = Math.round(salary * 0.2);
      let allowances = Math.round(salary * 0.2);
      const deductions = Math.round(salary * 0.08);

      // Pull approved-but-unpaid expense claims for this employee
      let reimbForEmp = 0;
      if (includeExpenses) {
        const [sum] = await query<ExpenseSum>(
          "SELECT COALESCE(SUM(amount),0) AS total FROM expenses WHERE employee_id=? AND status='Approved'",
          [emp.id],
        );
        reimbForEmp = Number(sum?.total || 0);
        allowances += Math.round(reimbForEmp);
      }

      const net = basic + hra + allowances - deductions;
      const id = uid("p-");
      const res = await exec(
        `INSERT IGNORE INTO payroll (id, employee_id, month, basic, hra, allowances, deductions, net, paid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [id, emp.id, month, basic, hra, allowances, deductions, net],
      );
      if (res.affectedRows > 0) {
        generated++;
        if (includeExpenses && reimbForEmp > 0) {
          // Mark all approved expenses as reimbursed in this payroll
          const upd = await exec(
            "UPDATE expenses SET status='Reimbursed', paid_in_payroll_id=? WHERE employee_id=? AND status='Approved'",
            [id, emp.id],
          );
          reimbursedCount += upd.affectedRows;
          reimbursedAmt += reimbForEmp;
        }
      }
    }
    return NextResponse.json({ generated, reimbursedCount, reimbursedAmt });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
