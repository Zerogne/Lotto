import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const ids: string[] = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];
  if (ids.length === 0) {
    return NextResponse.json({ error: "id or ids required" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: logs, error } = await db
    .from("sms_logs")
    .select("id, phone, message, lottery_id, purchase_group_id")
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!logs?.length) return NextResponse.json({ error: "No matching sms_logs entries" }, { status: 404 });

  const results = await Promise.all(
    logs.map(async (log) => {
      const result = await sendSMS(log.phone, log.message, {
        lotteryId: log.lottery_id ?? undefined,
        purchaseGroupId: log.purchase_group_id ?? undefined,
      });
      return { id: log.id, phone: log.phone, ...result };
    })
  );

  return NextResponse.json({ results });
}
