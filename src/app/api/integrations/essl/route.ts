import { NextRequest, NextResponse } from "next/server";
import { exec, query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  device_ip: string | null;
  device_port: number;
  comm_password: string | null;
  enabled: number;
  auto_create_employees: number;
  last_sync_at: string | null;
  last_sync_count: number;
  last_error: string | null;
}

async function requireAdmin() {
  const me = await getCurrentUser();
  if (!me || (me.role !== "admin" && me.role !== "manager")) {
    return null;
  }
  return me;
}

export async function GET() {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const rows = await query<Row>("SELECT * FROM essl_settings WHERE id = 1");
    if (rows.length === 0) {
      return NextResponse.json({
        deviceIp: "",
        devicePort: 4370,
        commPassword: "",
        enabled: false,
        autoCreateEmployees: false,
        lastSyncAt: "",
        lastSyncCount: 0,
        lastError: "",
      });
    }
    const r = rows[0];
    return NextResponse.json({
      deviceIp: r.device_ip ?? "",
      devicePort: r.device_port,
      commPassword: r.comm_password ?? "",
      enabled: !!r.enabled,
      autoCreateEmployees: !!r.auto_create_employees,
      lastSyncAt: r.last_sync_at ?? "",
      lastSyncCount: r.last_sync_count,
      lastError: r.last_error ?? "",
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    const b = await req.json();
    await exec(
      `INSERT INTO essl_settings (id, device_ip, device_port, comm_password, enabled, auto_create_employees)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         device_ip=VALUES(device_ip), device_port=VALUES(device_port),
         comm_password=VALUES(comm_password), enabled=VALUES(enabled),
         auto_create_employees=VALUES(auto_create_employees)`,
      [
        b.deviceIp || null,
        b.devicePort || 4370,
        b.commPassword || null,
        b.enabled ? 1 : 0,
        b.autoCreateEmployees ? 1 : 0,
      ],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
