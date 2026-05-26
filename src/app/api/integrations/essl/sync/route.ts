import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query, uid } from "@/lib/db";
import { todayIST, nowTimeIST } from "@/lib/datetime";
import { aggregateByDay, fetchAttendance, getDeviceInfo } from "@/lib/essl";

export const dynamic = "force-dynamic";

interface SettingsRow {
  device_ip: string | null;
  device_port: number;
  last_sync_at: string | null;
  auto_create_employees: number;
}

interface EmpRow {
  id: string;
  essl_user_id: string | null;
  email: string;
  employee_code: string;
}

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
    const body = await req.json().catch(() => ({}));
    const fullResync: boolean = !!body.full;

    const settings = await query<SettingsRow>(
      "SELECT device_ip, device_port, last_sync_at, auto_create_employees FROM essl_settings WHERE id=1",
    );
    if (settings.length === 0 || !settings[0].device_ip) {
      return NextResponse.json({ error: "No device IP configured. Save settings first." }, { status: 400 });
    }
    const cfg = { ip: settings[0].device_ip!, port: settings[0].device_port };
    const sinceIso = fullResync ? undefined : settings[0].last_sync_at || undefined;
    const autoCreate = !!settings[0].auto_create_employees;

    // 1) Build employee mapping: essl_user_id -> employee.id
    const emps = await query<EmpRow>(
      "SELECT id, essl_user_id, email, employee_code FROM employees",
    );
    const mapping = new Map<string, string>();
    const emails = new Set<string>();
    const codes = new Set<string>();
    for (const e of emps) {
      if (e.essl_user_id) mapping.set(String(e.essl_user_id), e.id);
      emails.add(e.email.toLowerCase());
      codes.add(e.employee_code);
    }

    // 2) Auto-create unmapped users from device if enabled
    const autoCreatedList: Array<{ esslUserId: string; name: string; employeeCode: string }> = [];
    if (autoCreate) {
      const info = await getDeviceInfo(cfg);
      for (const u of info.enrolledUsers) {
        const userId = String(u.userId);
        if (mapping.has(userId)) continue;
        const { first, last } = splitName(u.name, userId);

        let code = `ESSL-${userId}`;
        if (codes.has(code)) {
          let i = 2;
          while (codes.has(`${code}-${i}`)) i++;
          code = `${code}-${i}`;
        }
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
          mapping.set(userId, id);
          codes.add(code);
          emails.add(email.toLowerCase());
          autoCreatedList.push({ esslUserId: userId, name: `${first} ${last}`.trim(), employeeCode: code });
        } catch {
          // ignore creation failure; user will be reported as unmapped below
        }
      }
    }

    // 3) Fetch raw punches
    const punches = await fetchAttendance(cfg, sinceIso);

    // 4) Aggregate per user per day
    const days = aggregateByDay(punches);

    let inserted = 0;
    let updated = 0;
    const unmapped = new Set<string>();

    for (const d of days) {
      const employeeId = mapping.get(d.userId);
      if (!employeeId) {
        unmapped.add(d.userId);
        continue;
      }
      const attendanceId = uid("a-");
      const result = await exec(
        `INSERT INTO attendance (id, employee_id, \`date\`, check_in, check_out, status, notes)
         VALUES (?, ?, ?, ?, ?, 'Present', CONCAT('eSSL: ', ?, ' punches'))
         ON DUPLICATE KEY UPDATE
           check_in  = LEAST(IFNULL(check_in, VALUES(check_in)),   VALUES(check_in)),
           check_out = GREATEST(IFNULL(check_out, VALUES(check_out)), VALUES(check_out)),
           status    = IF(status='Leave', status, 'Present'),
           notes     = CONCAT('eSSL: ', ?, ' punches')`,
        [attendanceId, employeeId, d.date, d.checkIn, d.checkOut, d.punches, d.punches],
      );
      // mysql2 returns affectedRows=1 for INSERT and 2 for UPDATE-on-duplicate
      if (result.affectedRows === 1) inserted++;
      else updated++;
    }

    const now = `${todayIST()} ${nowTimeIST()}`;
    await exec(
      "UPDATE essl_settings SET last_sync_at=?, last_sync_count=?, last_error=NULL WHERE id=1",
      [now, inserted + updated],
    );

    return NextResponse.json({
      ok: true,
      inserted,
      updated,
      totalPunches: punches.length,
      totalDays: days.length,
      unmappedUserIds: Array.from(unmapped),
      autoCreatedCount: autoCreatedList.length,
      autoCreatedList,
      lastSyncAt: now,
    });
  } catch (e) {
    const msg = (e as Error).message;
    try {
      await exec("UPDATE essl_settings SET last_error=? WHERE id=1", [msg]);
    } catch {
      // ignore
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
