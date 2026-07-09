import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("lotteries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const db = createAdminClient();
  const { data, error } = await db
    .from("lotteries")
    .insert({
      id: crypto.randomUUID(),
      car_name: body.carName,
      car_brand: body.carBrand ?? "",
      car_model: body.carModel ?? "",
      car_image: body.carImage ?? "/images/car-placeholder.svg",
      ticket_price: Number(body.ticketPrice),
      max_tickets: Number(body.maxTickets),
      tickets_sold: 0,
      end_date: body.endDate,
      draw_date: body.drawDate ?? body.endDate,
      status: "active",
      description: body.description ?? "",
      prize_value: Number(body.prizeValue ?? 0),
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
