import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    await exec(
      `UPDATE announcements SET title=?, body=?, posted_by=?, target=?, target_dept=?, priority=?, expires_at=? WHERE id=?`,
      [
        body.title,
        body.body,
        body.postedBy || null,
        body.target || "All",
        body.targetDept || null,
        body.priority || "Normal",
        body.expiresAt || null,
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
    await exec("DELETE FROM announcements WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
