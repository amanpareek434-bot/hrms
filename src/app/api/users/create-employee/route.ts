import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { exec, query, uid } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const me = await getCurrentUser();
    if (!me || (me.role !== "admin" && me.role !== "manager")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { employeeId, email, password } = await req.json();
    if (!employeeId || !email || !password) {
      return NextResponse.json({ error: "employeeId, email, password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Verify employee exists
    const emps = await query<{ id: string; first_name: string; last_name: string | null }>(
      "SELECT id, first_name, last_name FROM employees WHERE id = ? LIMIT 1",
      [employeeId],
    );
    if (emps.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    const emp = emps[0];
    const name = `${emp.first_name} ${emp.last_name ?? ""}`.trim();

    // Already an account for this email?
    const dupe = await query<{ id: string }>("SELECT id FROM users WHERE email=? LIMIT 1", [email.toLowerCase()]);
    if (dupe.length > 0) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
    }

    const id = uid("u-");
    const hash = await bcrypt.hash(password, 10);
    await exec(
      "INSERT INTO users (id, email, password_hash, name, role, employee_id) VALUES (?, ?, ?, ?, 'user', ?)",
      [id, email.toLowerCase(), hash, name, employeeId],
    );

    return NextResponse.json({ id, email: email.toLowerCase(), name, employeeId }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
