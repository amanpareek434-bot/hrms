import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  department: string | null;
  stage: string;
  source: string | null;
  applied_on: string | null;
  expected_salary: string | number | null;
  notes: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    name: r.name,
    email: r.email ?? "",
    phone: r.phone ?? "",
    position: r.position ?? "",
    department: r.department ?? "",
    stage: r.stage,
    source: r.source ?? "",
    appliedOn: r.applied_on ?? "",
    expectedSalary: r.expected_salary == null ? 0 : Number(r.expected_salary),
    notes: r.notes ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<Row>(
      "SELECT id, name, email, phone, position, department, stage, source, applied_on, expected_salary, notes FROM candidates ORDER BY created_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("c-");
    await exec(
      `INSERT INTO candidates (id, name, email, phone, position, department, stage, source, applied_on, expected_salary, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.email || null,
        body.phone || null,
        body.position || null,
        body.department || null,
        body.stage || "Applied",
        body.source || null,
        body.appliedOn || null,
        body.expectedSalary || 0,
        body.notes || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
