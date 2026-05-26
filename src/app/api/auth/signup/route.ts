import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { exec, query, uid } from "@/lib/db";
import { setSessionCookie, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface UserRow {
  id: string;
  email: string;
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const existing = await query<UserRow>("SELECT id, email FROM users WHERE email = ? LIMIT 1", [email.toLowerCase()]);
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const id = uid("u-");
    const hash = await bcrypt.hash(password, 10);

    // First user becomes admin, rest default to admin too (single-tenant demo)
    await exec("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)", [
      id,
      email.toLowerCase(),
      hash,
      name,
      "admin",
    ]);

    const token = await signSession({ uid: id, email: email.toLowerCase(), name, role: "admin" });
    await setSessionCookie(token);

    return NextResponse.json({ user: { id, email: email.toLowerCase(), name, role: "admin" } }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
