import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { phone, lotteryId } = await req.json();
  if (!phone || !lotteryId) {
    return NextResponse.json({ error: "phone and lotteryId required" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, status, purchase_group_id, code")
    .eq("lottery_id", lotteryId)
    .eq("phone", phone);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No tickets found" }, { status: 404 });

  const ids = tickets.map((t: { id: string }) => t.id);
  const { error: deleteErr } = await db.from("tickets").delete().in("id", ids);
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

  const paidUnits = new Set(
    tickets
      .filter((t: { status?: string }) => t.status === "paid")
      .map((t: { purchase_group_id: string | null; code: string }) => t.purchase_group_id ?? t.code)
  ).size;

  if (paidUnits > 0) {
    const { data: lottery } = await db
      .from("lotteries")
      .select("tickets_sold")
      .eq("id", lotteryId)
      .single();
    if (lottery) {
      await db
        .from("lotteries")
        .update({ tickets_sold: Math.max(0, lottery.tickets_sold - paidUnits) })
        .eq("id", lotteryId);
    }
  }

  return NextResponse.json({ refunded: ids.length });
}
