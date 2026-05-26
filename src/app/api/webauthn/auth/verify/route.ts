import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query, uid } from "@/lib/db";
import { todayIST, nowTimeIST } from "@/lib/datetime";
import { getRpInfo } from "@/lib/webauthn";

export const dynamic = "force-dynamic";

interface ChallengeRow {
  challenge: string;
  kind: string;
}

interface CredRow {
  id: string;
  public_key: string;
  counter: number;
  transports: string | null;
}

interface AttendanceRow {
  id: string;
  check_in: string | null;
  check_out: string | null;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me?.employeeId) {
    return NextResponse.json({ error: "Employee account required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const action: "in" | "out" = body.action === "out" ? "out" : "in";

    const challRows = await query<ChallengeRow>(
      "SELECT challenge, kind FROM webauthn_challenges WHERE employee_id=? AND kind='auth'",
      [me.employeeId],
    );
    if (challRows.length === 0) {
      return NextResponse.json({ error: "No active authentication challenge" }, { status: 400 });
    }
    const expectedChallenge = challRows[0].challenge;

    const credentialId = body.authResp?.id;
    if (!credentialId) {
      return NextResponse.json({ error: "Missing credential id" }, { status: 400 });
    }

    const credRows = await query<CredRow>(
      "SELECT id, public_key, counter, transports FROM webauthn_credentials WHERE id=? AND employee_id=?",
      [credentialId, me.employeeId],
    );
    if (credRows.length === 0) {
      return NextResponse.json({ error: "Credential not recognised" }, { status: 400 });
    }
    const cred = credRows[0];

    const { rpID, origin } = getRpInfo(req);

    const verification = await verifyAuthenticationResponse({
      response: body.authResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: cred.id,
        publicKey: new Uint8Array(Buffer.from(cred.public_key, "base64")),
        counter: Number(cred.counter),
        transports: cred.transports ? (cred.transports.split(",") as ("internal" | "usb" | "ble" | "nfc" | "hybrid")[]) : undefined,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "Fingerprint verification failed" }, { status: 401 });
    }

    // Update counter to prevent replay
    await exec(
      "UPDATE webauthn_credentials SET counter=?, last_used_at=CURRENT_TIMESTAMP WHERE id=?",
      [verification.authenticationInfo.newCounter, credentialId],
    );

    // Clear challenge
    await exec("DELETE FROM webauthn_challenges WHERE employee_id=?", [me.employeeId]);

    // Mark attendance (always in IST)
    const today = todayIST();
    const now = nowTimeIST();

    const existing = await query<AttendanceRow>(
      "SELECT id, check_in, check_out FROM attendance WHERE employee_id=? AND `date`=?",
      [me.employeeId, today],
    );

    let inserted = false;
    if (existing.length === 0) {
      await exec(
        `INSERT INTO attendance (id, employee_id, \`date\`, check_in, check_out, status, notes)
         VALUES (?, ?, ?, ?, NULL, 'Present', 'Punched via phone fingerprint')`,
        [uid("a-"), me.employeeId, today, action === "in" ? now : null],
      );
      inserted = true;
    } else {
      const row = existing[0];
      if (action === "in") {
        // Update check_in if not set; otherwise no-op (already punched in today)
        if (!row.check_in) {
          await exec("UPDATE attendance SET check_in=?, status='Present' WHERE id=?", [now, row.id]);
        }
      } else {
        await exec("UPDATE attendance SET check_out=?, status='Present' WHERE id=?", [now, row.id]);
      }
    }

    return NextResponse.json({
      ok: true,
      action,
      date: today,
      time: now,
      created: inserted,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
