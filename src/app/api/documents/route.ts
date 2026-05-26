import { NextRequest, NextResponse } from "next/server";
import { exec, query, uid } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: string;
  employee_id: string;
  title: string;
  category: string;
  file_url: string | null;
  notes: string | null;
  uploaded_on: string | null;
}

function rowToApi(r: Row) {
  return {
    id: r.id,
    employeeId: r.employee_id,
    title: r.title,
    category: r.category,
    fileUrl: r.file_url ?? "",
    notes: r.notes ?? "",
    uploadedOn: r.uploaded_on ?? "",
  };
}

export async function GET(req: NextRequest) {
  try {
    const employeeId = req.nextUrl.searchParams.get("employeeId");
    const rows = employeeId
      ? await query<Row>(
          "SELECT id, employee_id, title, category, file_url, notes, uploaded_on FROM documents WHERE employee_id=? ORDER BY uploaded_on DESC, created_at DESC",
          [employeeId],
        )
      : await query<Row>(
          "SELECT id, employee_id, title, category, file_url, notes, uploaded_on FROM documents ORDER BY uploaded_on DESC, created_at DESC",
        );
    return NextResponse.json(rows.map(rowToApi));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const id = uid("do-");
    await exec(
      `INSERT INTO documents (id, employee_id, title, category, file_url, notes, uploaded_on)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.employeeId,
        body.title,
        body.category || "Other",
        body.fileUrl || null,
        body.notes || null,
        body.uploadedOn || null,
      ],
    );
    return NextResponse.json({ id, ...body }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
