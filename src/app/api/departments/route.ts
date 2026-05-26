import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface DeptRow {
  id: string;
  name: string;
  head: string | null;
  description: string | null;
}

export async function GET() {
  try {
    const rows = await query<DeptRow>("SELECT id, name, head, description FROM departments ORDER BY name");
    return NextResponse.json(
      rows.map((r) => ({ id: r.id, name: r.name, head: r.head ?? "", description: r.description ?? "" })),
    );
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || uid("d-");
    await exec("INSERT INTO departments (id, name, head, description) VALUES (?, ?, ?, ?)", [
      id,
      body.name,
      body.head || null,
      body.description || null,
    ]);
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
