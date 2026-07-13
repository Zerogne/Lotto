import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";
import { sendSMS } from "@/lib/sms";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lotteryId = searchParams.get("lotteryId");
  const status = searchParams.get("status");
  const db = createAdminClient();
  let query = db.from("tickets").select("*");
  if (lotteryId) query = query.eq("lottery_id", lotteryId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

const CODES_PER_TICKET = 10; // 1 purchased unit = 10 lottery codes
const CODES_PER_SMS = 20; // split into multiple SMS messages beyond 2 units' worth of codes

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isPaid = body.paid === true; // admin manual add = paid immediately
  if (isPaid && !isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quantity = Number(body.quantity ?? 1);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return NextResponse.json({ error: "Тоо ширхэг буруу байна" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: lottery } = await db
    .from("lotteries")
    .select("car_name, tickets_sold, max_tickets")
    .eq("id", body.lotteryId)
    .single();

  if (!lottery) return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
  if (lottery.tickets_sold >= lottery.max_tickets)
    return NextResponse.json({ error: "Sold out" }, { status: 400 });

  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const purchaseGroupId = crypto.randomUUID();
    for (let j = 0; j < CODES_PER_TICKET; j++) {
      tickets.push({
        code: String(Math.floor(10000 + Math.random() * 90000)),
        phone: body.phone,
        lottery_id: body.lotteryId,
        lottery_name: lottery.car_name,
        purchase_date: new Date().toISOString().split("T")[0],
        purchase_group_id: purchaseGroupId,
        status: isPaid ? "paid" : "pending",
      });
    }
  }

  const { data, error } = await db.from("tickets").insert(tickets).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Only count toward tickets_sold once actually paid (pending tickets don't reserve a slot).
  // tickets_sold tracks purchased units, not individual codes.
  let sms: { ok: boolean; detail?: string } | undefined;
  if (isPaid) {
    await db
      .from("lotteries")
      .update({ tickets_sold: lottery.tickets_sold + quantity })
      .eq("id", body.lotteryId);

    const codes = tickets.map((t) => t.code);
    sms = await sendChunkedSMS(body.phone, codes);
  }

  return NextResponse.json({ tickets: data, sms }, { status: 201 });
}

async function sendChunkedSMS(phone: string, codes: string[]): Promise<{ ok: boolean; detail?: string }> {
  const chunks: string[][] = [];
  for (let i = 0; i < codes.length; i += CODES_PER_SMS) {
    chunks.push(codes.slice(i, i + CODES_PER_SMS));
  }

  let ok = true;
  const failures: string[] = [];
  for (const chunk of chunks) {
    const message = `BLCK: ${chunk.join(",")}`;
    const result = await sendSMS(phone, message);
    if (!result.ok) {
      ok = false;
      if (result.detail) failures.push(result.detail);
    }
  }
  return { ok, detail: failures.length ? failures.join("; ") : undefined };
}
