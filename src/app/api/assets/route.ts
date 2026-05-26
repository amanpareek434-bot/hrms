import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  name: string;
  category: string;
  serial_no: string | null;
  assigned_to: string | null;
  assigned_on: string | null;
  returned_on: string | null;
  status: string;
  notes: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    serialNo: r.serial_no ?? "",
    assignedTo: r.assigned_to ?? "",
    assignedOn: r.assigned_on ?? "",
    returnedOn: r.returned_on ?? "",
    status: r.status,
    notes: r.notes ?? "",
  };
}

export async function GET() {
  try {
    const rows = await query<Row>(
      "SELECT id, name, category, serial_no, assigned_to, assigned_on, returned_on, status, notes FROM assets ORDER BY created_at DESC",
    );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("as-");
    await exec(
      `INSERT INTO assets (id, name, category, serial_no, assigned_to, assigned_on, returned_on, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name,
        body.category || "Other",
        body.serialNo || null,
        body.assignedTo || null,
        body.assignedOn || null,
        body.returnedOn || null,
        body.status || "Available",
        body.notes || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
