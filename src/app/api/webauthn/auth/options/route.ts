import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query } from "@/lib/db";
import { getRpInfo } from "@/lib/webauthn";

export const dynamic = "force-dynamic";

interface CredRow {
  id: string;
  transports: string | null;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me?.employeeId) {
    return NextResponse.json({ error: "Employee account required" }, { status: 403 });
  }

  try {
    const { rpID } = getRpInfo(req);

    const creds = await query<CredRow>(
      "SELECT id, transports FROM webauthn_credentials WHERE employee_id=?",
      [me.employeeId],
    );
    if (creds.length === 0) {
      return NextResponse.json({ error: "No device enrolled. Please enroll first." }, { status: 400 });
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: creds.map((c) => ({
        id: c.id,
        transports: c.transports ? (c.transports.split(",") as ("internal" | "usb" | "ble" | "nfc" | "hybrid")[]) : undefined,
      })),
    });

    await exec(
      `INSERT INTO webauthn_challenges (employee_id, challenge, kind)
       VALUES (?, ?, 'auth')
       ON DUPLICATE KEY UPDATE challenge=VALUES(challenge), kind='auth', created_at=CURRENT_TIMESTAMP`,
      [me.employeeId, options.challenge],
    );

    return NextResponse.json(options);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
