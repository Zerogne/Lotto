import Link from "next/link";
import { getActiveLotteries, getLotteries } from "@/lib/db";
import HomeLotteryCard from "@/components/public/HomeLotteryCard";
import TicketCheckSection from "@/components/public/TicketCheckSection";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [activeLotteries, allLotteries] = await Promise.all([
    getActiveLotteries(),
    getLotteries(),
  ]);
  const featured = activeLotteries[0];
  const rest = activeLotteries.slice(1);
  const pastOrOther = allLotteries.filter((l) => l.status !== "active");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-4 pt-5 pb-32 lg:pb-10 space-y-3">

        {/* Active lotteries */}
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

        {/* Past lotteries */}
        {pastOrOther.length > 0 && (
          <div className="pt-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2 px-0.5">
              Өнгөрсөн сугалаанууд
            </p>
            <div className="space-y-2">
              {pastOrOther.map((lottery) => (
                <HomeLotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!featured && pastOrOther.length === 0 && (
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

      {/* Sticky buy button */}
      {featured && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:hidden">
          <Link
            href={`/lottery/${featured.id}/purchase`}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl text-center transition-colors shadow-lg"
          >
            Сугалаа авах
          </Link>
        </div>
      )}
    </div>
  );
}
