import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { getDeviceInfo } from "@/lib/essl";

export const dynamic = "force-dynamic";

interface Row {
  device_ip: string | null;
  device_port: number;
}

// Map a raw connection error to an actionable hint for the user.
function hintFor(msg: string): string | undefined {
  const m = msg.toLowerCase();
  if (m.includes("timed out") || m.includes("etimedout") || m.includes("could not reach")) {
    return "Device did not respond on TCP or UDP 4370. On the machine: Menu → Comm → ensure TCP/IP is ON and the mode is 'TCP / Pull SDK' (NOT Cloud/ADMS). Then power-cycle the device.";
  }
  if (m.includes("econnrefused")) {
    return "Port 4370 actively refused the connection — the comm service may be off or running on a different port. Check Menu → Comm → PC Connection → Port.";
  }
  if (m.includes("ehostunreach") || m.includes("enetunreach")) {
    return "Host unreachable — the server running this app is not on the same LAN as the device. A cloud deploy (e.g. Vercel) cannot reach a 192.168.x.x device. Run the sync from a machine on the same WiFi/LAN.";
  }
  if (m.includes("unauthorized") || m.includes("auth")) {
    return "The device may have a Comm Key (password) set. Set it to 0 on the device (Menu → Comm → PC Connection → Comm Key), or note it — this library does not support keyed auth.";
  }
  return undefined;
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
    const transport = (body.transport as "tcp" | "udp" | "auto" | undefined) ?? "auto";
    if (!ip) {
      const rows = await query<Row>("SELECT device_ip, device_port FROM essl_settings WHERE id=1");
      if (rows.length === 0 || !rows[0].device_ip) {
        return NextResponse.json({ error: "No device IP configured" }, { status: 400 });
      }
      ip = rows[0].device_ip!;
      port = rows[0].device_port;
    }
    const info = await getDeviceInfo({ ip: ip!, port: port ?? 4370, transport });
    return NextResponse.json({ ok: true, ...info });
  } catch (e) {
    const msg = (e as Error).message;
    return NextResponse.json({ error: msg, hint: hintFor(msg) }, { status: 500 });
  }
}
