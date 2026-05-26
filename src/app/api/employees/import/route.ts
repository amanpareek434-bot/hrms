import { NextRequest, NextResponse } from "next/server";
import { exec, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ImportRow {
  employeeCode?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  joiningDate?: string;
  dateOfBirth?: string;
  salary?: string | number;
  status?: string;
  address?: string;
}

export async function POST(req: NextRequest) {
  try {
    const rows = (await req.json()) as ImportRow[];
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows provided" }, { status: 400 });
    }
    let inserted = 0;
    for (const r of rows) {
      if (!r.firstName || !r.email) continue;
      const id = uid("e-");
      await exec(
        `INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, department, designation, joining_date, date_of_birth, salary, status, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           first_name=VALUES(first_name), last_name=VALUES(last_name), phone=VALUES(phone),
           department=VALUES(department), designation=VALUES(designation), joining_date=VALUES(joining_date),
           date_of_birth=VALUES(date_of_birth),
           salary=VALUES(salary), status=VALUES(status), address=VALUES(address)`,
        [
          id,
          r.employeeCode || `EMP${Date.now().toString().slice(-6)}`,
          r.firstName,
          r.lastName || null,
          r.email,
          r.phone || null,
          r.department || null,
          r.designation || null,
          r.joiningDate || null,
          r.dateOfBirth || null,
          Number(r.salary) || 0,
          r.status || "Active",
          r.address || null,
        ],
      );
      inserted++;
    }
    return NextResponse.json({ inserted });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
