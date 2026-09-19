import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { lotteryCodesPerTicket, unitsForCodeCount } from "@/lib/lotteryCodes";

export async function POST(req: NextRequest) {
  const { phone, lotteryId, purchaseGroupId } = await req.json();
  if (!phone || !lotteryId || !purchaseGroupId) {
    return NextResponse.json({ error: "phone, lotteryId and purchaseGroupId required" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: tickets, error: fetchErr } = await db
    .from("tickets")
    .select("id, status, purchase_group_id, code")
    .eq("lottery_id", lotteryId)
    .eq("phone", phone)
    .eq("purchase_group_id", purchaseGroupId);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!tickets?.length) return NextResponse.json({ error: "No tickets found" }, { status: 404 });

  const ids = tickets.map((t: { id: string }) => t.id);
  const { error: deleteErr } = await db.from("tickets").delete().in("id", ids);
  if (deleteErr) return NextResponse.json({ error: deleteErr.message }, { status: 500 });

  const paidCodeCount = tickets.filter((t: { status?: string }) => t.status === "paid").length;

  if (paidCodeCount > 0) {
    const { data: lottery } = await db
      .from("lotteries")
      .select("tickets_sold, codes_per_ticket")
      .eq("id", lotteryId)
      .single();
    if (lottery) {
      const paidUnits = unitsForCodeCount(paidCodeCount, lotteryCodesPerTicket(lottery.codes_per_ticket));
      await db
        .from("lotteries")
        .update({ tickets_sold: Math.max(0, lottery.tickets_sold - paidUnits) })
        .eq("id", lotteryId);
    }
  }

  return NextResponse.json({ refunded: ids.length });
}
