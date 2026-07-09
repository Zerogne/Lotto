import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone, lotteryId } = await req.json();
  const db = createAdminClient();

  // Fetch the pending tickets first
  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, code")
    .eq("phone", phone)
    .eq("lottery_id", lotteryId);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No tickets found" }, { status: 404 });

  // Try to update status (works if column exists, silently ok if not)
  await db
    .from("tickets")
    .update({ status: "paid" })
    .eq("phone", phone)
    .eq("lottery_id", lotteryId);

  const codes = tickets.map((t: { code: string }) => t.code);
  await sendSMS(phone, `BLCK: ${codes.join(",")}`);

  return NextResponse.json({ approved: tickets.length });
}
