import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lotteryId = searchParams.get("lotteryId");
  const db = createAdminClient();
  let query = db.from("tickets").select("*").order("created_at", { ascending: false });
  if (lotteryId) query = query.eq("lottery_id", lotteryId);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = createAdminClient();

  // Generate unique 6-digit code
  let code = String(Math.floor(100000 + Math.random() * 900000));
  const { data: existing } = await db
    .from("tickets")
    .select("code")
    .eq("lottery_id", body.lotteryId)
    .eq("code", code)
    .maybeSingle();
  if (existing) {
    code = String(Math.floor(100000 + Math.random() * 900000));
  }

  // Get lottery info
  const { data: lottery } = await db
    .from("lotteries")
    .select("car_name, tickets_sold, max_tickets")
    .eq("id", body.lotteryId)
    .single();

  if (!lottery) return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
  if (lottery.tickets_sold >= lottery.max_tickets) {
    return NextResponse.json({ error: "Sold out" }, { status: 400 });
  }

  const quantity = Number(body.quantity ?? 1);
  const tickets = [];
  for (let i = 0; i < quantity; i++) {
    const ticketCode = String(Math.floor(100000 + Math.random() * 900000));
    tickets.push({
      code: ticketCode,
      phone: body.phone,
      lottery_id: body.lotteryId,
      lottery_name: lottery.car_name,
      purchase_date: new Date().toISOString().split("T")[0],
    });
  }

  const { data, error } = await db.from("tickets").insert(tickets).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Increment tickets_sold
  await db
    .from("lotteries")
    .update({ tickets_sold: lottery.tickets_sold + quantity })
    .eq("id", body.lotteryId);

  const codes = (data ?? []).map((t: { code: string }) => t.code);
  const smsBody = `LottoMN: ${codes.join(",")}`;
  await sendSMS(body.phone, smsBody);

  return NextResponse.json({ tickets: data }, { status: 201 });
}
