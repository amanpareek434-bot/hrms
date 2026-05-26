import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  title: string;
  body: string;
  posted_by: string | null;
  target: string;
  target_dept: string | null;
  priority: string;
  posted_at: string;
  expires_at: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    title: r.title,
    body: r.body,
    postedBy: r.posted_by ?? "",
    target: r.target,
    targetDept: r.target_dept ?? "",
    priority: r.priority,
    postedAt: r.posted_at,
    expiresAt: r.expires_at ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<Row>(
      "SELECT id, title, body, posted_by, target, target_dept, priority, posted_at, expires_at FROM announcements ORDER BY posted_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("an-");
    await exec(
      `INSERT INTO announcements (id, title, body, posted_by, target, target_dept, priority, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.title,
        body.body,
        body.postedBy || null,
        body.target || "All",
        body.targetDept || null,
        body.priority || "Normal",
        body.expiresAt || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
