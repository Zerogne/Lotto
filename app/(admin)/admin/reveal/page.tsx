import { createAdminClient } from "@/lib/supabase";
import RevealClient from "./RevealClient";

export const dynamic = "force-dynamic";

export default async function RevealPage() {
  const db = createAdminClient();

  const { data: lotteries } = await db
    .from("lotteries")
    .select("id, car_name, car_brand, car_model, code_digits")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ялагч тодруулах</h1>
      <RevealClient lotteries={lotteries ?? []} />
    </div>
  );
}
