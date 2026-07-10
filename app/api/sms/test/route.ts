import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const db = createAdminClient();
  const { data: tickets, error } = await db.from("tickets").select("code").eq("phone", phone);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No tickets found for this phone" }, { status: 404 });

  const codes = tickets.map((t: { code: string }) => t.code);
  const message = `BLCK: ${codes.join(",")}`;
  const result = await sendSMS(phone, message);
  return NextResponse.json({ codes, ...result });
}
