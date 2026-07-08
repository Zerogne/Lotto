import Link from "next/link";
import { getLotteries, getActiveLotteries } from "@/lib/db";
import { formatMNT } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";
import HomeLotteryCard from "@/components/public/HomeLotteryCard";
import TicketCheckSection from "@/components/public/TicketCheckSection";
import DarkHeroShell from "@/components/public/DarkHeroShell";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const [activeLotteries, allLotteries] = await Promise.all([
    getActiveLotteries(),
    getLotteries(),
  ]);
  const featured = activeLotteries[0];
  const pastOrOther = allLotteries.filter((l) => l.status !== "active");

  return (
    <div className="min-h-screen bg-white">
      {featured && (
        <>
          <DarkHeroShell>
            <div className="relative z-10 text-center px-4 pt-10 pb-8">
              <span className="inline-block bg-amber-500 text-white text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                Идэвхтэй сугалаа
              </span>
              <p className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest leading-none mb-1 drop-shadow-lg">
                {featured.carBrand}
              </p>
              <h1 className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest leading-none mb-6 drop-shadow-lg">
                {featured.carModel} СУГАЛАА
              </h1>

              <div className="inline-block bg-white/10 backdrop-blur rounded-2xl px-6 py-3 mb-6 border border-white/20">
                <p className="text-amber-400 font-black text-2xl sm:text-3xl">
                  {formatMNT(featured.prizeValue)}
                </p>
                <p className="text-white/60 text-xs mt-0.5 uppercase tracking-wider">Нийт шагналын дүн</p>
              </div>

              <div className="mb-4">
                <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Дуусах хугацаа</p>
                <CountdownTimer endDate={featured.endDate} />
              </div>
            </div>
          </DarkHeroShell>

          <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Нийт авсан</p>
                <p className="font-bold text-gray-900 text-sm">
                  {featured.ticketsSold.toLocaleString()}{" "}
                  <span className="text-gray-400 font-normal">/ {featured.maxTickets.toLocaleString()}</span>
                </p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Тасалбарын үнэ</p>
                <p className="font-bold text-amber-600 text-sm">{formatMNT(featured.ticketPrice)}</p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Үлдсэн тасалбар</p>
                <p className="font-bold text-gray-900 text-sm">
                  {Math.max(0, featured.maxTickets - featured.ticketsSold).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="h-2 bg-gray-100">
            <div
              className="h-2 bg-amber-500 transition-all"
              style={{ width: `${Math.min((featured.ticketsSold / featured.maxTickets) * 100, 100)}%` }}
            />
          </div>

          <div className="border-t border-gray-100 bg-gray-50">
            <TicketCheckSection
              lotteries={activeLotteries}
              defaultLotteryId={featured.id}
              showHero={false}
            />
          </div>

          {activeLotteries.length > 1 && (
            <div className="border-t border-gray-200">
              <div className="max-w-lg mx-auto px-4 py-6 pb-32 lg:pb-8">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Бусад сугалаанууд
                </p>
                <div className="space-y-3">
                  {activeLotteries.slice(1).map((lottery) => (
                    <HomeLotteryCard key={lottery.id} lottery={lottery} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeLotteries.length <= 1 && (
            <div className="hidden lg:block max-w-lg mx-auto px-4 py-6 pb-10">
              <Link
                href={`/lottery/${featured.id}/purchase`}
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-black text-base uppercase tracking-widest px-10 py-4 rounded-xl transition-colors shadow-lg"
              >
                Сугалаа авах
              </Link>
            </div>
          )}
        </>
      )}

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

      {!featured && (
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <p className="text-amber-600 font-black text-sm uppercase tracking-widest mb-2">
            Идэвхтэй сугалаа байхгүй
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Тун удахгүй шинэ сугалаа нэмэгдэнэ</h1>
          <p className="text-sm text-gray-600 mb-8">
            Одоогоор идэвхтэй автомашины сугалаа алга. Дууссан сугалаанууд болон хожигчдыг доороос үзнэ үү.
          </p>
          {pastOrOther.length > 0 && (
            <div className="text-left space-y-3 mb-8">
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 text-center mb-4">
                Сүүлийн сугалаанууд
              </h2>
              {pastOrOther.map((lottery) => (
                <HomeLotteryCard key={lottery.id} lottery={lottery} />
              ))}
            </div>
          )}
          <Link
            href="/winners"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm px-8 py-3 rounded-xl transition-colors"
          >
            Хожигчдын жагсаалт
          </Link>
        </div>
      )}
    </div>
  );
}
