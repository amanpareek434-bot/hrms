import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await exec(
      `UPDATE assets SET name=?, category=?, serial_no=?, assigned_to=?, assigned_on=?, returned_on=?, status=?, notes=? WHERE id=?`,
      [
        body.name,
        body.category || "Other",
        body.serialNo || null,
        body.assignedTo || null,
        body.assignedOn || null,
        body.returnedOn || null,
        body.status || "Available",
        body.notes || null,
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
    await exec("DELETE FROM assets WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
