import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lotteryId = searchParams.get("lotteryId");
  const status = searchParams.get("status");
  const db = createAdminClient();
  let query = db.from("tickets").select("*").order("created_at", { ascending: false });
  if (lotteryId) query = query.eq("lottery_id", lotteryId);
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = createAdminClient();

  const { data: lottery } = await db
    .from("lotteries")
    .select("car_name, tickets_sold, max_tickets")
    .eq("id", body.lotteryId)
    .single();

  if (!lottery) return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
  if (lottery.tickets_sold >= lottery.max_tickets)
    return NextResponse.json({ error: "Sold out" }, { status: 400 });

  const quantity = Number(body.quantity ?? 1);
  const isPaid = body.paid === true; // admin manual add = paid immediately

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

  await db
    .from("lotteries")
    .update({ tickets_sold: lottery.tickets_sold + quantity })
    .eq("id", body.lotteryId);

  return NextResponse.json({ tickets: data }, { status: 201 });
}
