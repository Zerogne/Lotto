import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

const CODES_PER_SMS = 20; // split into multiple SMS messages beyond 2 units' worth of codes

export async function POST(req: NextRequest) {
  const { phone, lotteryId } = await req.json();
  if (!phone || !lotteryId) {
    return NextResponse.json({ error: "phone and lotteryId required" }, { status: 400 });
  }

  const db = createAdminClient();

  // Only fetch tickets that are pending (not yet approved)
  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, code, status, purchase_group_id")
    .eq("phone", phone)
    .eq("lottery_id", lotteryId)
    .or("status.eq.pending,status.is.null");

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No pending tickets found" }, { status: 404 });

  // Mark as paid
  const ids = tickets.map((t: { id: string }) => t.id);
  await db.from("tickets").update({ status: "paid" }).in("id", ids);

  // Now that they're paid, count the purchased units (not individual codes) toward the lottery's sold total.
  const unitsApproved = new Set(
    tickets.map((t: { purchase_group_id: string | null; code: string }) => t.purchase_group_id ?? t.code)
  ).size;

  const { data: lottery } = await db
    .from("lotteries")
    .select("tickets_sold")
    .eq("id", lotteryId)
    .single();
  if (lottery) {
    await db
      .from("lotteries")
      .update({ tickets_sold: lottery.tickets_sold + unitsApproved })
      .eq("id", lotteryId);
  }

  const codes = tickets.map((t: { code: string }) => t.code);
  console.log(`[Approve] phone=${phone} codes=${codes.join(",")}`);

  const chunks: string[][] = [];
  for (let i = 0; i < codes.length; i += CODES_PER_SMS) chunks.push(codes.slice(i, i + CODES_PER_SMS));

  let smsOk = true;
  const failures: string[] = [];
  for (const chunk of chunks) {
    const result = await sendSMS(phone, `BLCK: ${chunk.join(",")}`);
    if (!result.ok) {
      smsOk = false;
      if (result.detail) failures.push(result.detail);
    }
  }
  const sms = { ok: smsOk, detail: failures.length ? failures.join("; ") : undefined };
  console.log(`[Approve] SMS result:`, JSON.stringify(sms));

  return NextResponse.json({ approved: unitsApproved, codes, sms });
}
