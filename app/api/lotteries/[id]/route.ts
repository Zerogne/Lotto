import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { DEFAULT_CODE_DIGITS, isLotteryCodeDigits, lotteryCodesPerTicket, maxTicketsForCodeDigits } from "@/lib/lotteryCodes";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from("lotteries").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const db = createAdminClient();
  const update: Record<string, unknown> = {};
  if (body.maxTickets !== undefined) {
    const maxTickets = Number(body.maxTickets);
    if (!Number.isInteger(maxTickets) || maxTickets < 1) {
      return NextResponse.json({ error: "Зөв тасалбарын тоо оруулна уу" }, { status: 400 });
    }
    const { data: lottery, error: lotteryError } = await db
      .from("lotteries")
      .select("code_digits, codes_per_ticket")
      .eq("id", id)
      .single();
    if (lotteryError || !lottery) {
      return NextResponse.json({ error: "Lottery not found" }, { status: 404 });
    }
    const codeDigits = isLotteryCodeDigits(lottery.code_digits) ? lottery.code_digits : DEFAULT_CODE_DIGITS;
    const maxCodeTickets = maxTicketsForCodeDigits(codeDigits, lotteryCodesPerTicket(lottery.codes_per_ticket));
    if (maxTickets > maxCodeTickets) {
      return NextResponse.json(
        { error: `Энэ кодын уртад хамгийн ихдээ ${maxCodeTickets} тасалбар үүсгэнэ` },
        { status: 400 }
      );
    }
    update.max_tickets = maxTickets;
  }
  if (body.carName !== undefined) update.car_name = body.carName;
  if (body.carBrand !== undefined) update.car_brand = body.carBrand;
  if (body.carModel !== undefined) update.car_model = body.carModel;
  if (body.carImage !== undefined) update.car_image = body.carImage;
  if (body.carImages !== undefined) {
    update.car_images = body.carImages;
    if (body.carImages.length) update.car_image = body.carImages[0];
  }
  if (body.carVideo !== undefined) update.car_video = body.carVideo;
  if (body.ticketPrice !== undefined) update.ticket_price = Number(body.ticketPrice);
  if (body.endDate !== undefined) update.end_date = body.endDate;
  if (body.drawDate !== undefined) update.draw_date = body.drawDate;
  if (body.status !== undefined) update.status = body.status;
  if (body.description !== undefined) update.description = body.description;
  if (body.prizeValue !== undefined) update.prize_value = Number(body.prizeValue);
  const { data, error } = await db
    .from("lotteries")
    .update(update)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  await db.from("payments").delete().eq("lottery_id", id);
  await db.from("tickets").delete().eq("lottery_id", id);
  await db.from("winners").delete().eq("lottery_id", id);
  const { error } = await db.from("lotteries").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
