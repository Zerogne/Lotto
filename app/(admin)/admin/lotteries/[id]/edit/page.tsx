import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import EditLotteryForm from "./EditLotteryForm";

async function getLottery(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/lotteries/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function EditLotteryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lottery = await getLottery(id);
  if (!lottery) notFound();

  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-5">
        <Link
          href="/admin/lotteries"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Буцах
        </Link>
      </div>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Сугалаа засах</h1>
        <p className="text-sm text-gray-500">{lottery.car_name}</p>
      </div>
      <EditLotteryForm lottery={lottery} />
    </div>
  );
}
