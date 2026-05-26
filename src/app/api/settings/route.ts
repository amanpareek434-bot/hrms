import { NextRequest, NextResponse } from "next/server";
import { exec, query } from "@/lib/db";

export const dynamic = "force-dynamic";

interface Row {
  id: number;
  name: string;
  legal_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logo_url: string | null;
  currency: string;
  timezone: string;
  work_start: string;
  work_end: string;
  weekly_offs: string;
}

const DEFAULT_SETTINGS = {
  name: "My Company",
  legalName: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  currency: "INR",
  timezone: "Asia/Kolkata",
  workStart: "09:30:00",
  workEnd: "18:30:00",
  weeklyOffs: "Sat,Sun",
};

export async function GET() {
  try {
    const rows = await query<Row>("SELECT * FROM company_settings WHERE id=1");
    if (rows.length === 0) return NextResponse.json(DEFAULT_SETTINGS);
    const r = rows[0];
    return NextResponse.json({
      name: r.name,
      legalName: r.legal_name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      website: r.website ?? "",
      address: r.address ?? "",
      logoUrl: r.logo_url ?? "",
      currency: r.currency,
      timezone: r.timezone,
      workStart: r.work_start,
      workEnd: r.work_end,
      weeklyOffs: r.weekly_offs,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    await exec(
      `INSERT INTO company_settings (id, name, legal_name, email, phone, website, address, logo_url, currency, timezone, work_start, work_end, weekly_offs)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name=VALUES(name), legal_name=VALUES(legal_name), email=VALUES(email), phone=VALUES(phone),
         website=VALUES(website), address=VALUES(address), logo_url=VALUES(logo_url),
         currency=VALUES(currency), timezone=VALUES(timezone), work_start=VALUES(work_start),
         work_end=VALUES(work_end), weekly_offs=VALUES(weekly_offs)`,
      [
        body.name || "My Company",
        body.legalName || null,
        body.email || null,
        body.phone || null,
        body.website || null,
        body.address || null,
        body.logoUrl || null,
        body.currency || "INR",
        body.timezone || "Asia/Kolkata",
        body.workStart || "09:30:00",
        body.workEnd || "18:30:00",
        body.weeklyOffs || "Sat,Sun",
      ],
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
