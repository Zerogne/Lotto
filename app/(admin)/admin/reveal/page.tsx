import { createAdminClient } from "@/lib/supabase";
import { getTickets } from "@/lib/db";
import RevealClient from "./RevealClient";

export const dynamic = "force-dynamic";

export default async function RevealPage() {
  const db = createAdminClient();

  const [tickets, { data: lotteries }] = await Promise.all([
    getTickets(),
    db.from("lotteries").select("id, car_name, car_brand, car_model, code_digits, codes_per_ticket").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Хожигч тодруулах</h1>
      <p className="text-sm text-gray-500 mb-6">Сугалаа сонгоод хожсон дугаарыг оруулна уу</p>
      <RevealClient
        tickets={tickets.map((ticket) => ({
          code: ticket.code,
          phone: ticket.phone,
          lottery_name: ticket.lotteryName,
          lottery_id: ticket.lotteryId,
        }))}
        lotteries={lotteries ?? []}
      />
    </div>
  );
}
