import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { purchaseGroupId, lotteryId } = await req.json();
  if (!purchaseGroupId || !lotteryId) {
    return NextResponse.json({ error: "purchaseGroupId and lotteryId required" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, status")
    .eq("lottery_id", lotteryId)
    .or(`purchase_group_id.eq.${purchaseGroupId},code.eq.${purchaseGroupId}`);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "Unit not found" }, { status: 404 });

  const ids = tickets.map((t: { id: string }) => t.id);
  const { error: deleteErr } = await db.from("tickets").delete().in("id", ids);
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

  const wasPaid = tickets.some((t: { status?: string }) => t.status === "paid" || !t.status);
  if (wasPaid) {
    const { data: lottery } = await db
      .from("lotteries")
      .select("tickets_sold")
      .eq("id", lotteryId)
      .single();
    if (lottery) {
      await db
        .from("lotteries")
        .update({ tickets_sold: Math.max(0, lottery.tickets_sold - 1) })
        .eq("id", lotteryId);
    }
  }

  return NextResponse.json({ refunded: ids.length });
}
