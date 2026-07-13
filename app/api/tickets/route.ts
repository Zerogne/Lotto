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

export async function POST(req: NextRequest) {
  const body = await req.json();
  const isPaid = body.paid === true; // admin manual add = paid immediately
  if (isPaid && !isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quantity = Number(body.quantity ?? 1);
  const MAX_QUANTITY_PER_PURCHASE = 20; // keeps a single SMS (one message's worth of codes) under the character limit for public self-service purchases
  if (isPaid) {
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Тоо ширхэг буруу байна" }, { status: 400 });
    }
  } else if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_PURCHASE) {
    return NextResponse.json({ error: `Нэг удаад 1-${MAX_QUANTITY_PER_PURCHASE} тасалбар авах боломжтой` }, { status: 400 });
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
    tickets.push({
      code: String(Math.floor(10000 + Math.random() * 90000)),
      phone: body.phone,
      lottery_id: body.lotteryId,
      lottery_name: lottery.car_name,
      purchase_date: new Date().toISOString().split("T")[0],
      status: isPaid ? "paid" : "pending",
    });
  }

  const { data, error } = await db.from("tickets").insert(tickets).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Only count toward tickets_sold once actually paid (pending tickets don't reserve a slot).
  let sms: { ok: boolean; detail?: string } | undefined;
  if (isPaid) {
    await db
      .from("lotteries")
      .update({ tickets_sold: lottery.tickets_sold + quantity })
      .eq("id", body.lotteryId);

    const codes = tickets.map((t) => t.code);
    const message = `BLCK: ${codes.join(",")}`;
    sms = await sendSMS(body.phone, message);
  }

  return NextResponse.json({ tickets: data, sms }, { status: 201 });
}
