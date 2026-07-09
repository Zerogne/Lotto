import { createAdminClient } from "@/lib/supabase";
import PendingClient from "./PendingClient";

export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const db = createAdminClient();

  const [ticketsRes, lotteriesRes] = await Promise.all([
    db.from("tickets").select("*").order("created_at", { ascending: false }),
    db.from("lotteries").select("id, car_name, car_brand, car_model, ticket_price"),
  ]);

  const allTickets = ticketsRes.data ?? [];

  // Show tickets that are pending OR have no status set (before migration)
  const pendingTickets = allTickets.filter(
    (t) => !t.status || t.status === "pending"
  );

  // Group by phone + lottery
  const groupMap = new Map<string, {
    phone: string;
    lottery_id: string;
    lottery_name: string;
    codes: string[];
    count: number;
  }>();

  for (const t of pendingTickets) {
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Төлбөр баталгаажуулах</h1>
      <PendingClient
        initialGroups={Array.from(groupMap.values())}
        lotteries={lotteriesRes.data ?? []}
      />
    </div>
  );
}
