import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";
import { lotteryCodesPerTicket, unitsForCodeCount } from "@/lib/lotteryCodes";

const CODES_PER_SMS = 20; // split long code lists into multiple SMS messages

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

  const { data: lottery, error: lotteryErr } = await db
    .from("lotteries")
    .select("tickets_sold, max_tickets, codes_per_ticket")
    .eq("id", lotteryId)
    .single();
  if (lotteryErr || !lottery) {
    return NextResponse.json({ error: lotteryErr?.message ?? "Lottery not found" }, { status: 500 });
  }
  const unitsApproved = unitsForCodeCount(tickets.length, lotteryCodesPerTicket(lottery.codes_per_ticket));
  if (lottery.tickets_sold + unitsApproved > lottery.max_tickets) {
    return NextResponse.json({ error: "Sold out" }, { status: 400 });
  }

  const ids = tickets.map((t: { id: string }) => t.id);
  const { error: approveErr } = await db.from("tickets").update({ status: "paid" }).in("id", ids);
  if (approveErr) return NextResponse.json({ error: approveErr.message }, { status: 500 });
  const { error: soldErr } = await db
    .from("lotteries")
    .update({ tickets_sold: lottery.tickets_sold + unitsApproved })
    .eq("id", lotteryId);
  if (soldErr) return NextResponse.json({ error: soldErr.message }, { status: 500 });

  const codes = tickets.map((t: { code: string }) => t.code);
  console.log(`[Approve] phone=${phone} codes=${codes.join(",")}`);

  const chunks: string[][] = [];
  for (let i = 0; i < codes.length; i += CODES_PER_SMS) chunks.push(codes.slice(i, i + CODES_PER_SMS));

  let smsOk = true;
  const failures: string[] = [];
  for (const chunk of chunks) {
    const result = await sendSMS(phone, `BLCK: ${chunk.join(",")}`, { lotteryId });
    if (!result.ok) {
      smsOk = false;
      if (result.detail) failures.push(result.detail);
    }
  }
  const sms = { ok: smsOk, detail: failures.length ? failures.join("; ") : undefined };
  console.log(`[Approve] SMS result:`, JSON.stringify(sms));

  return NextResponse.json({ approved: unitsApproved, codes, sms });
}
