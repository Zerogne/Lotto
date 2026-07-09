import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { phone, lotteryId } = await req.json();
  if (!phone || !lotteryId) {
    return NextResponse.json({ error: "phone and lotteryId required" }, { status: 400 });
  }

  const db = createAdminClient();

  // Only fetch tickets that are pending (not yet approved)
  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, code, status")
    .eq("phone", phone)
    .eq("lottery_id", lotteryId)
    .or("status.eq.pending,status.is.null");

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No pending tickets found" }, { status: 404 });

  // Mark as paid
  const ids = tickets.map((t: { id: string }) => t.id);
  await db.from("tickets").update({ status: "paid" }).in("id", ids);

  const codes = tickets.map((t: { code: string }) => t.code);
  const message = `BLCK: ${codes.join(",")}`;
  console.log(`[Approve] phone=${phone} codes=${codes.join(",")} message="${message}"`);

  const sms = await sendSMS(phone, message);
  console.log(`[Approve] SMS result:`, JSON.stringify(sms));

  return NextResponse.json({ approved: tickets.length, codes, sms });
}
