import Link from "next/link";
import { getActiveLotteries } from "@/lib/db";
import HomeLotteryCard from "@/components/public/HomeLotteryCard";
import TicketCheckSection from "@/components/public/TicketCheckSection";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const activeLotteries = await getActiveLotteries();
  const featured = activeLotteries[0];
  const rest = activeLotteries.slice(1);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-32 lg:pb-10 space-y-3">

        {/* Active lotteries only */}
        {featured && (
          <HomeLotteryCard lottery={featured} featured />
        )}

        {rest.map((lottery) => (
          <HomeLotteryCard key={lottery.id} lottery={lottery} />
        ))}

        {/* Ticket check */}
        {featured && (
          <div className="pt-1">
            <TicketCheckSection
              lotteries={activeLotteries}
              defaultLotteryId={featured.id}
              showHero={false}
            />
          </div>
        )}

        {/* Empty state */}
        {!featured && (
          <div className="py-20 text-center">
            <p className="text-amber-600 font-black text-sm uppercase tracking-widest mb-2">
              Идэвхтэй сугалаа байхгүй
            </p>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Тун удахгүй шинэ сугалаа нэмэгдэнэ
            </h1>
            <Link
              href="/winners"
              className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors"
            >
              Хожигчдын жагсаалт
            </Link>
          </div>
        )}

      </div>

    </div>
  );
}
