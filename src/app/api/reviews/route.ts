import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  employee_id: string;
  period: string;
  reviewer: string | null;
  rating: string | number | null;
  strengths: string | null;
  improvements: string | null;
  goals: string | null;
  status: string;
  reviewed_on: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    period: r.period,
    reviewer: r.reviewer ?? "",
    rating: r.rating == null ? 0 : Number(r.rating),
    strengths: r.strengths ?? "",
    improvements: r.improvements ?? "",
    goals: r.goals ?? "",
    status: r.status,
    reviewedOn: r.reviewed_on ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<Row>(
      "SELECT id, employee_id, period, reviewer, rating, strengths, improvements, goals, status, reviewed_on FROM reviews ORDER BY period DESC, created_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("r-");
    await exec(
      `INSERT INTO reviews (id, employee_id, period, reviewer, rating, strengths, improvements, goals, status, reviewed_on)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.employeeId,
        body.period,
        body.reviewer || null,
        body.rating || null,
        body.strengths || null,
        body.improvements || null,
        body.goals || null,
        body.status || "Draft",
        body.reviewedOn || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
