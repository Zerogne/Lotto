import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();

  const { data: tickets, error: tErr } = await db
    .from("tickets")
    .select("code, phone")
    .eq("lottery_id", id);
  if (tErr || !tickets?.length) {
    return NextResponse.json({ error: "No tickets found" }, { status: 400 });
  }

  const winner = tickets[Math.floor(Math.random() * tickets.length)];

  const { data: lottery } = await db
    .from("lotteries")
    .select("car_name, car_image, prize_value, draw_date")
    .eq("id", id)
    .single();

  // Save winner record
  const { data: winnerRecord, error: wErr } = await db
    .from("winners")
    .insert({
      lottery_id: id,
      car_name: lottery?.car_name ?? "",
      car_image: lottery?.car_image ?? "",
      winner_phone: winner.phone,
      ticket_code: winner.code,
      draw_date: lottery?.draw_date ?? new Date().toISOString().split("T")[0],
      prize_value: lottery?.prize_value ?? 0,
    })
    .select()
    .single();
  if (wErr) return NextResponse.json({ error: wErr.message }, { status: 500 });

  // Mark lottery as ended
  await db.from("lotteries").update({ status: "ended" }).eq("id", id);

  // Notify winner via SMS
  await sendSMS(
    winner.phone,
    `Баяр хүргье! Та ${lottery?.car_name} сугалааны хожигч боллоо! Тасалбарын код: ${winner.code}. LottoMN`
  );

  return NextResponse.json(winnerRecord);
}
