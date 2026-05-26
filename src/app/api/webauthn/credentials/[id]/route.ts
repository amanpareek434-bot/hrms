import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exec } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const me = await getCurrentUser();
  if (!me?.employeeId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await exec("DELETE FROM webauthn_credentials WHERE id=? AND employee_id=?", [params.id, me.employeeId]);
  return NextResponse.json({ ok: true });
}
