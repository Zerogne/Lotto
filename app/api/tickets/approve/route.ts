import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

// Approve all pending tickets for a given phone + lottery, then send SMS
export async function POST(req: NextRequest) {
  const { phone, lotteryId } = await req.json();
  const db = createAdminClient();

  const { data: tickets, error } = await db
    .from("tickets")
    .update({ status: "paid" })
    .eq("phone", phone)
    .eq("lottery_id", lotteryId)
    .eq("status", "pending")
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No pending tickets found" }, { status: 404 });

  const codes = tickets.map((t: { code: string }) => t.code);
  await sendSMS(phone, `BLCK: ${codes.join(",")}`);

  return NextResponse.json({ approved: tickets.length });
}
