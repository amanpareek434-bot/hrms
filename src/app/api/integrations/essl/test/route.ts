import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getDeviceInfo } from "@/lib/essl";

export const dynamic = "force-dynamic";

interface Row {
  device_ip: string | null;
  device_port: number;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "admin" && me.role !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json().catch(() => ({}));
    let ip = body.deviceIp as string | undefined;
    let port = body.devicePort as number | undefined;
    if (!ip) {
      const rows = await query<Row>("SELECT device_ip, device_port FROM essl_settings WHERE id=1");
      if (rows.length === 0 || !rows[0].device_ip) {
        return NextResponse.json({ error: "No device IP configured" }, { status: 400 });
      }
      ip = rows[0].device_ip!;
      port = rows[0].device_port;
    }
    const info = await getDeviceInfo({ ip: ip!, port: port ?? 4370 });
    return NextResponse.json({ ok: true, ...info });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
