import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";
import { todayIST } from "@/lib/datetime";

export const dynamic = "force-dynamic";

interface LeaveRow {
  id: string;
  employee_id: string;
  type: string;
  from_date: string;
  to_date: string;
  reason: string | null;
  status: string;
  applied_on: string;
}

function rowToApi(r: LeaveRow) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    type: r.type,
    fromDate: r.from_date,
    toDate: r.to_date,
    reason: r.reason ?? "",
    status: r.status,
    appliedOn: r.applied_on,
  };
}

export async function GET() {
  try {
    const rows = await query<LeaveRow>(
      "SELECT id, employee_id, type, from_date, to_date, reason, status, applied_on FROM leaves ORDER BY applied_on DESC, created_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body.id || uid("l-");
    const appliedOn = body.appliedOn || todayIST();
    await exec(
      "INSERT INTO leaves (id, employee_id, type, from_date, to_date, reason, status, applied_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        body.employeeId,
        body.type || "Casual",
        body.fromDate,
        body.toDate,
        body.reason || null,
        body.status || "Pending",
        appliedOn,
      ],
    );
    return NextResponse.json({ id, ...body, appliedOn }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
