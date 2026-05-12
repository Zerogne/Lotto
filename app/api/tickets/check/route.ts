import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone");
  const lotteryId = searchParams.get("lotteryId");

  if (!phone || !/^\d{8}$/.test(phone)) {
    return NextResponse.json({ error: "8 оронтой утасны дугаар шаардлагатай" }, { status: 400 });
  }

  const db = createAdminClient();
  let q = db.from("tickets").select("code, phone, lottery_id, lottery_name, purchase_date").eq("phone", phone);
  if (lotteryId) q = q.eq("lottery_id", lotteryId);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const tickets = (data ?? []).map((r) => ({
    code: r.code,
    phone: r.phone,
    lotteryId: r.lottery_id,
    lotteryName: r.lottery_name,
    purchaseDate: r.purchase_date,
  }));
  return NextResponse.json({ tickets });
}
