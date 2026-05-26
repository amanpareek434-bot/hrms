import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await exec(
      "UPDATE holidays SET `date`=?, name=?, type=?, description=? WHERE id=?",
      [body.date, body.name, body.type || "National", body.description || null, params.id],
    );
    return NextResponse.json({ id: params.id, ...body });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await exec("DELETE FROM holidays WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
