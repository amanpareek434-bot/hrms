import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await exec(
      `UPDATE employees
       SET employee_code=?, essl_user_id=?, first_name=?, last_name=?, email=?, phone=?, department=?, designation=?, joining_date=?, date_of_birth=?, salary=?, status=?, address=?
       WHERE id=?`,
      [
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
        params.id,
      ],
    );
    return NextResponse.json({ id: params.id, ...body });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await exec("DELETE FROM employees WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
