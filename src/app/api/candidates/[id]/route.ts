import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await exec(
      `UPDATE candidates SET name=?, email=?, phone=?, position=?, department=?, stage=?, source=?, applied_on=?, expected_salary=?, notes=? WHERE id=?`,
      [
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
        params.id,
      ],
    );
    return NextResponse.json({ id: params.id, ...body });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (!body.stage) {
      return NextResponse.json({ error: "stage required" }, { status: 400 });
    }
    await exec("UPDATE candidates SET stage=? WHERE id=?", [body.stage, params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await exec("DELETE FROM candidates WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
