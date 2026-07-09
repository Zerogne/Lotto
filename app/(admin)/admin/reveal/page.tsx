import { createAdminClient } from "@/lib/supabase";
import RevealClient from "./RevealClient";

export const dynamic = "force-dynamic";

export default async function RevealPage() {
  const db = createAdminClient();
  const { data: tickets } = await db
    .from("tickets")
    .select("code, phone, lottery_name")
    .eq("status", "paid")
    .order("created_at", { ascending: true });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Хожигч тодруулах</h1>
      <p className="text-sm text-gray-500 mb-6">Хожсон тасалбарын дугаарыг оруулна уу</p>
      <RevealClient tickets={tickets ?? []} />
    </div>
  );
}
