import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  date: string;
  name: string;
  type: string;
  description: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    date: r.date,
    name: r.name,
    type: r.type,
    description: r.description ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<Row>(
      "SELECT id, `date`, name, type, description FROM holidays ORDER BY `date` ASC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("h-");
    await exec(
      `INSERT INTO holidays (id, \`date\`, name, type, description) VALUES (?, ?, ?, ?, ?)`,
      [id, body.date, body.name, body.type || "National", body.description || null],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
