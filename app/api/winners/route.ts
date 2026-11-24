import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { isAdminRequest } from "@/lib/adminAuth";

export async function GET() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("winners")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ error: "Нэвтрэх шаардлагатай" }, { status: 401 });
  }

  const { lotteryId, code } = await req.json();
  if (typeof lotteryId !== "string" || typeof code !== "string" || !/^\d{4,5}$/.test(code)) {
    return NextResponse.json({ error: "Сугалаа болон дугаар буруу байна" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: existingWinners, error: existingError } = await db
    .from("winners")
    .select("id")
    .eq("lottery_id", lotteryId)
    .limit(1);
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });
  if (existingWinners?.length) {
    return NextResponse.json({ error: "Энэ сугалааны ялагч аль хэдийн баталгаажсан байна" }, { status: 409 });
  }

  const [{ data: lottery, error: lotteryError }, { data: ticket, error: ticketError }] = await Promise.all([
    db
      .from("lotteries")
      .select("car_name, car_image, prize_value, draw_date")
      .eq("id", lotteryId)
      .single(),
    db
      .from("tickets")
      .select("code, phone")
      .eq("lottery_id", lotteryId)
      .eq("code", code)
      .eq("status", "paid")
      .single(),
  ]);

  if (lotteryError || !lottery) {
    return NextResponse.json({ error: "Сугалаа олдсонгүй" }, { status: 404 });
  }
  if (ticketError || !ticket) {
    return NextResponse.json({ error: "Төлөгдсөн сугалааны дугаар олдсонгүй" }, { status: 404 });
  }

  const { data: winner, error: winnerError } = await db
    .from("winners")
    .insert({
      lottery_id: lotteryId,
      car_name: lottery.car_name,
      car_image: lottery.car_image ?? "",
      winner_phone: ticket.phone,
      ticket_code: ticket.code,
      draw_date: lottery.draw_date ?? new Date().toISOString().split("T")[0],
      prize_value: lottery.prize_value ?? 0,
    })
    .select()
    .single();

  if (winnerError || !winner) {
    const duplicate = winnerError?.code === "23505";
    return NextResponse.json(
      {
        error: duplicate
          ? "Энэ сугалааны ялагч аль хэдийн баталгаажсан байна"
          : winnerError?.message ?? "Ялагч хадгалах үед алдаа гарлаа",
      },
      { status: duplicate ? 409 : 500 }
    );
  }

  const { error: lotteryUpdateError } = await db
    .from("lotteries")
    .update({ status: "ended" })
    .eq("id", lotteryId);

  if (lotteryUpdateError) {
    await db.from("winners").delete().eq("id", winner.id);
    return NextResponse.json({ error: lotteryUpdateError.message }, { status: 500 });
  }

  return NextResponse.json(winner, { status: 201 });
}
