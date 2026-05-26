import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface AttRow {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  notes: string | null;
}

function rowToApi(r: AttRow) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    date: r.date,
    checkIn: r.check_in ?? "",
    checkOut: r.check_out ?? "",
    status: r.status,
    notes: r.notes ?? "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get("date");
    const sql = date
      ? "SELECT id, employee_id, `date`, check_in, check_out, status, notes FROM attendance WHERE `date`=? ORDER BY created_at DESC"
      : "SELECT id, employee_id, `date`, check_in, check_out, status, notes FROM attendance ORDER BY `date` DESC LIMIT 500";
    const rows = await query<AttRow>(sql, date ? [date] : []);
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.employeeId || !body.date) {
      return NextResponse.json({ error: "employeeId and date are required" }, { status: 400 });
    }
    const id = body.id || uid("a-");
    await exec(
      `INSERT INTO attendance (id, employee_id, \`date\`, check_in, check_out, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         check_in=VALUES(check_in), check_out=VALUES(check_out),
         status=VALUES(status), notes=VALUES(notes)`,
      [
        id,
        body.employeeId,
        body.date,
        body.checkIn || null,
        body.checkOut || null,
        body.status || "Present",
        body.notes || null,
      ],
    );
    return NextResponse.json({ id, ...body });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
