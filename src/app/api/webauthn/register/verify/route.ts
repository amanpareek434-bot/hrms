import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { getCurrentUser } from "@/lib/auth";
import { exec, query } from "@/lib/db";
import { getRpInfo } from "@/lib/webauthn";

export const dynamic = "force-dynamic";

interface ChallengeRow {
  challenge: string;
  kind: string;
}

export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me?.employeeId) {
    return NextResponse.json({ error: "Employee account required" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const deviceName: string = body.deviceName || "Unnamed device";

    const rows = await query<ChallengeRow>(
      "SELECT challenge, kind FROM webauthn_challenges WHERE employee_id=? AND kind='register'",
      [me.employeeId],
    );
    if (rows.length === 0) {
      return NextResponse.json({ error: "No active registration challenge. Start over." }, { status: 400 });
    }
    const expectedChallenge = rows[0].challenge;

    const { rpID, origin } = getRpInfo(req);

    const verification = await verifyRegistrationResponse({
      response: body.attResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "Verification failed" }, { status: 400 });
    }

    const info = verification.registrationInfo;
    // SimpleWebAuthn v13 nests credential info under `credential`
    const cred = info.credential;
    const credentialID = cred.id;
    const publicKey = Buffer.from(cred.publicKey).toString("base64");
    const counter = cred.counter ?? 0;
    const transports = (cred.transports || []).join(",");

    await exec(
      `INSERT INTO webauthn_credentials (id, employee_id, public_key, counter, device_name, transports)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [credentialID, me.employeeId, publicKey, counter, deviceName, transports || null],
    );

    // Clear the challenge
    await exec("DELETE FROM webauthn_challenges WHERE employee_id=?", [me.employeeId]);

    return NextResponse.json({ ok: true, credentialId: credentialID, deviceName });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
