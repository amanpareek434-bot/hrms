import { NextRequest, NextResponse } from "next/server";
import { exec } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const user = await getCurrentUser();

    if (body.status === "Approved") {
      await exec(
        "UPDATE expenses SET status='Approved', approver_id=?, approved_at=NOW(), rejected_reason=NULL WHERE id=?",
        [user?.employeeId || user?.uid || null, params.id],
      );
    } else if (body.status === "Rejected") {
      await exec(
        "UPDATE expenses SET status='Rejected', approver_id=?, approved_at=NOW(), rejected_reason=? WHERE id=?",
        [user?.employeeId || user?.uid || null, body.rejectedReason || "Rejected", params.id],
      );
    } else if (body.status === "Pending") {
      await exec(
        "UPDATE expenses SET status='Pending', approver_id=NULL, approved_at=NULL, rejected_reason=NULL WHERE id=?",
        [params.id],
      );
    } else {
      // generic field updates (used by edit form)
      const updates: string[] = [];
      const values: (string | number | null)[] = [];
      const map: Record<string, string> = {
        expenseDate: "expense_date",
        category: "category",
        amount: "amount",
        currency: "currency",
        merchant: "merchant",
        description: "description",
        attachmentUrl: "attachment_url",
      };
      for (const [k, col] of Object.entries(map)) {
        if (k in body) {
          updates.push(`${col} = ?`);
          values.push(body[k] ?? null);
        }
      }
      if (updates.length) {
        values.push(params.id);
        await exec(`UPDATE expenses SET ${updates.join(", ")} WHERE id = ?`, values);
      }
    }
    return NextResponse.json({ id: params.id, ...body });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await exec("DELETE FROM expenses WHERE id=?", [params.id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
