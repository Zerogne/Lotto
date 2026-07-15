import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

const SUPABASE_PAGE_SIZE = 1000;

// One-time repair for tickets inserted before purchase_group_id was shared
// per admin "add" action instead of per unit. Postgres evaluates `default
// now()` once per INSERT statement, so every row from one action shares an
// identical created_at — grouping on (phone, lottery_id, created_at) exactly
// reconstructs the original action boundaries. Safe to call more than once:
// once every group already shares one id, there's nothing left to merge.
export async function POST() {
  const db = createAdminClient();

  const tickets: { id: string; phone: string; lottery_id: string; created_at: string; purchase_group_id: string }[] = [];
  let from = 0;
  for (;;) {
    const { data, error } = await db
      .from("tickets")
      .select("id, phone, lottery_id, created_at, purchase_group_id")
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    tickets.push(...(data ?? []));
    if (!data || data.length < SUPABASE_PAGE_SIZE) break;
    from += SUPABASE_PAGE_SIZE;
  }

  const groups = new Map<string, typeof tickets>();
  for (const t of tickets) {
    const key = `${t.phone}|${t.lottery_id}|${t.created_at}`;
    const existing = groups.get(key);
    if (existing) existing.push(t);
    else groups.set(key, [t]);
  }

  let actionsMerged = 0;
  let rowsUpdated = 0;
  for (const rows of groups.values()) {
    const distinctGroupIds = new Set(rows.map((r) => r.purchase_group_id));
    if (distinctGroupIds.size <= 1) continue;
    const newId = crypto.randomUUID();
    const ids = rows.map((r) => r.id);
    const { error } = await db.from("tickets").update({ purchase_group_id: newId }).in("id", ids);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    actionsMerged++;
    rowsUpdated += ids.length;
  }

  return NextResponse.json({ actionsMerged, rowsUpdated, totalTickets: tickets.length });
}
