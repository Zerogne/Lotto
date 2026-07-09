import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export async function GET() {
  const db = createAdminClient();

  const [{ data: tickets, error }, { data: lotteries }] = await Promise.all([
    db.from("tickets").select("*").order("created_at", { ascending: false }),
    db.from("lotteries").select("id, car_name, car_brand, car_model, ticket_price"),
  ]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter pending: no status OR status = 'pending'
  const pending = (tickets ?? []).filter(
    (t: { status?: string }) => !t.status || t.status === "pending"
  );

  // Group by phone + lottery
  const groupMap = new Map<string, {
    phone: string;
    lottery_id: string;
    lottery_name: string;
    codes: string[];
    count: number;
  }>();

  for (const t of pending) {
    const key = `${t.phone}-${t.lottery_id}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        phone: t.phone,
        lottery_id: t.lottery_id,
        lottery_name: t.lottery_name ?? "",
        codes: [],
        count: 0,
      });
    }
    const g = groupMap.get(key)!;
    g.codes.push(t.code);
    g.count++;
  }

  return NextResponse.json({
    groups: Array.from(groupMap.values()),
    lotteries: lotteries ?? [],
  });
}
