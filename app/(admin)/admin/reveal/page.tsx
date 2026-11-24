import { createAdminClient } from "@/lib/supabase";
import RevealClient from "./RevealClient";

export const dynamic = "force-dynamic";

export default async function RevealPage() {
  const db = createAdminClient();

  const { data: lotteries } = await db
    .from("lotteries")
    .select("id, car_name, car_brand, car_model, code_digits, tickets_sold")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Хожигч тодруулах</h1>
      <p className="text-sm text-gray-500 mb-6">Сугалаа сонгоод санамсаргүй дугаарыг бүтнээр нь шалгана уу</p>
      <RevealClient lotteries={lotteries ?? []} />
    </div>
  );
}
