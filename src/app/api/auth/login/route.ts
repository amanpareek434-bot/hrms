import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  employee_id: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const rows = await query<UserRow>(
      "SELECT id, email, name, password_hash, role, employee_id FROM users WHERE email = ? LIMIT 1",
      [email.toLowerCase()],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signSession({
      uid: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id || undefined,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, employeeId: user.employee_id || null },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
