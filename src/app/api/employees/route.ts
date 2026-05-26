import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface EmployeeRow {
  id: string;
  employee_code: string;
  essl_user_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  department: string | null;
  designation: string | null;
  joining_date: string | null;
  date_of_birth: string | null;
  salary: string | number;
  status: string;
  address: string | null;
}

function rowToApi(r: EmployeeRow) {
  return {
    id: r.id,
    employeeCode: r.employee_code,
    esslUserId: r.essl_user_id ?? "",
    firstName: r.first_name,
    lastName: r.last_name ?? "",
    email: r.email,
    phone: r.phone ?? "",
    department: r.department ?? "",
    designation: r.designation ?? "",
    joiningDate: r.joining_date ?? "",
    dateOfBirth: r.date_of_birth ?? "",
    salary: Number(r.salary),
    status: r.status,
    address: r.address ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<EmployeeRow>(
      "SELECT id, employee_code, essl_user_id, first_name, last_name, email, phone, department, designation, joining_date, date_of_birth, salary, status, address FROM employees ORDER BY created_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || uid("e-");
    await exec(
      `INSERT INTO employees (id, employee_code, essl_user_id, first_name, last_name, email, phone, department, designation, joining_date, date_of_birth, salary, status, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.employeeCode,
        body.esslUserId || null,
        body.firstName,
        body.lastName || null,
        body.email,
        body.phone || null,
        body.department || null,
        body.designation || null,
        body.joiningDate || null,
        body.dateOfBirth || null,
        body.salary || 0,
        body.status || "Active",
        body.address || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
