import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  device_name: string | null;
  transports: string | null;
  created_at: string;
  last_used_at: string | null;
}

export async function GET() {
  const me = await getCurrentUser();
  if (!me?.employeeId) {
    return NextResponse.json([], { status: 200 });
  }
  const rows = await query<Row>(
    "SELECT id, device_name, transports, created_at, last_used_at FROM webauthn_credentials WHERE employee_id=? ORDER BY created_at DESC",
    [me.employeeId],
  );
  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      deviceName: r.device_name ?? "Unnamed device",
      transports: r.transports ?? "",
      createdAt: r.created_at,
      lastUsedAt: r.last_used_at,
    })),
  );
}
