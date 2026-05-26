import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query } from "@/lib/db";
import { RP_NAME, getRpInfo } from "@/lib/webauthn";

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

    // Existing credentials so we don't enroll the same device twice
    const existing = await query<CredRow>(
      "SELECT id, transports FROM webauthn_credentials WHERE employee_id=?",
      [me.employeeId],
    );

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID,
      userID: new TextEncoder().encode(me.employeeId),
      userName: me.email,
      userDisplayName: me.name,
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "required",
        // Prefer platform authenticator (phone fingerprint / Touch ID / Windows Hello)
        // — but allow cross-platform (USB keys) too.
      },
      excludeCredentials: existing.map((c) => ({
        id: c.id,
        transports: c.transports ? (c.transports.split(",") as ("internal" | "usb" | "ble" | "nfc" | "hybrid")[]) : undefined,
      })),
    });

    // Store challenge for the verify step
    await exec(
      `INSERT INTO webauthn_challenges (employee_id, challenge, kind)
       VALUES (?, ?, 'register')
       ON DUPLICATE KEY UPDATE challenge=VALUES(challenge), kind='register', created_at=CURRENT_TIMESTAMP`,
      [me.employeeId, options.challenge],
    );

    return NextResponse.json(options);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
