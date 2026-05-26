import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query, uid } from "@/lib/db";
import { getDeviceInfo } from "@/lib/essl";

export const dynamic = "force-dynamic";

interface SettingsRow {
  device_ip: string | null;
  device_port: number;
}

interface EmpRow {
  id: string;
  essl_user_id: string | null;
  email: string;
  employee_code: string;
}

// Splits "Aarav Singh" → ["Aarav", "Singh"]
// Handles empty/single-word/multi-word.
function splitName(raw: string, userId: string): { first: string; last: string } {
  const cleaned = (raw || "").trim().replace(/\s+/g, " ");
  if (!cleaned) return { first: `User ${userId}`, last: "" };
  const parts = cleaned.split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "admin" && me.role !== "manager")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const settings = await query<SettingsRow>("SELECT device_ip, device_port FROM essl_settings WHERE id=1");
    if (settings.length === 0 || !settings[0].device_ip) {
      return NextResponse.json({ error: "No device IP configured. Save settings first." }, { status: 400 });
    }
    const cfg = { ip: settings[0].device_ip!, port: settings[0].device_port };

    // 1) Fetch enrolled users from device
    const info = await getDeviceInfo(cfg);
    if (info.enrolledUsers.length === 0) {
      return NextResponse.json({ ok: true, created: 0, skipped: 0, message: "No users enrolled on device." });
    }

    // 2) Load all existing employees (essl_user_id + email + employee_code)
    const existing = await query<EmpRow>(
      "SELECT id, essl_user_id, email, employee_code FROM employees",
    );
    const byEssl = new Map<string, EmpRow>();
    const emails = new Set<string>();
    const codes = new Set<string>();
    for (const e of existing) {
      if (e.essl_user_id) byEssl.set(String(e.essl_user_id), e);
      emails.add(e.email.toLowerCase());
      codes.add(e.employee_code);
    }

    const created: Array<{ esslUserId: string; name: string; employeeCode: string }> = [];
    const skipped: Array<{ esslUserId: string; reason: string }> = [];

    for (const u of info.enrolledUsers) {
      const userId = String(u.userId);
      if (byEssl.has(userId)) {
        skipped.push({ esslUserId: userId, reason: "Already mapped" });
        continue;
      }
      const { first, last } = splitName(u.name, userId);

      // Generate unique employee_code
      let code = `ESSL-${userId}`;
      if (codes.has(code)) {
        let i = 2;
        while (codes.has(`${code}-${i}`)) i++;
        code = `${code}-${i}`;
      }

      // Generate unique placeholder email
      let email = `essl-${userId}@imported.local`;
      if (emails.has(email.toLowerCase())) {
        let i = 2;
        while (emails.has(`essl-${userId}-${i}@imported.local`.toLowerCase())) i++;
        email = `essl-${userId}-${i}@imported.local`;
      }

      const id = uid("e-");
      try {
        await exec(
          `INSERT INTO employees (id, employee_code, essl_user_id, first_name, last_name, email, status)
           VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
          [id, code, userId, first, last, email],
        );
        codes.add(code);
        emails.add(email.toLowerCase());
        byEssl.set(userId, { id, essl_user_id: userId, email, employee_code: code });
        created.push({ esslUserId: userId, name: `${first} ${last}`.trim(), employeeCode: code });
      } catch (err) {
        skipped.push({ esslUserId: userId, reason: (err as Error).message });
      }
    }

    return NextResponse.json({
      ok: true,
      totalOnDevice: info.enrolledUsers.length,
      created: created.length,
      skipped: skipped.length,
      createdList: created,
      skippedList: skipped,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
