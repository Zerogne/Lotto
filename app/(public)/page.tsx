import Link from "next/link";
import { LOTTERIES, formatMNT } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";
import { Info, Ticket } from "lucide-react";

export default function LandingPage() {
  const activeLotteries = LOTTERIES.filter((l) => l.status === "active");
  const featured = activeLotteries[0];

  return (
    <div className="min-h-screen bg-white">
      {featured && (
        <>
          {/* ── Hero: dark bg + bold car name ── */}
          <div className="relative overflow-hidden bg-gray-900">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(135deg,#1a1a2e 0%,#16213e 40%,#0f3460 100%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.05) 20px,rgba(255,255,255,0.05) 40px)",
              }}
            />
            {/* Car silhouette */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
              <span className="text-[180px] leading-none">🚗</span>
            </div>

            <div className="relative z-10 text-center px-4 pt-10 pb-8">
              <span className="inline-block bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full mb-3">
                Идэвхтэй сугалаа
              </span>
              <p className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest leading-none mb-1 drop-shadow-lg">
                {featured.carBrand}
              </p>
              <h1 className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest leading-none mb-6 drop-shadow-lg">
                {featured.carModel} СУГАЛАА
              </h1>

              {/* Prize */}
              <div className="inline-block bg-white/10 backdrop-blur rounded-2xl px-6 py-3 mb-6 border border-white/20">
                <p className="text-amber-400 font-black text-2xl sm:text-3xl">
                  {formatMNT(featured.prizeValue)}
                </p>
                <p className="text-white/60 text-xs mt-0.5 uppercase tracking-wider">
                  Нийт шагналын дүн
                </p>
              </div>

              {/* Countdown */}
              <div className="mb-6">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">
                  Дуусах хугацаа
                </p>
                <CountdownTimer endDate={featured.endDate} />
              </div>

              {/* Hero CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/lottery/${featured.id}`}
                  className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl transition-colors shadow-lg"
                >
                  <Ticket className="h-4 w-4" />
                  Сугалаа авах
                </Link>
                <Link
                  href={`/lottery/${featured.id}/info`}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-sm uppercase tracking-widest px-6 py-3.5 rounded-xl transition-colors"
                >
                  <Info className="h-4 w-4" />
                  Дэлгэрэнгүй
                </Link>
              </div>
            </div>
          </div>

          {/* ── Info strip ── */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-4 flex-wrap">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Нийт авсан сугалаа
                </p>
                <p className="font-black text-gray-900 text-sm">
                  {featured.ticketsSold.toLocaleString()}{" "}
                  <span className="text-gray-400 font-normal">
                    / {featured.maxTickets.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Тасалбарын үнэ
                </p>
                <p className="font-black text-amber-600 text-sm">
                  {formatMNT(featured.ticketPrice)}
                </p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">
                  Сугалааны дугаар
                </p>
                <p className="font-black text-gray-900 text-sm">{featured.id}</p>
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="h-2 bg-gray-100">
            <div
              className="h-2 bg-amber-500 transition-all"
              style={{
                width: `${(featured.ticketsSold / featured.maxTickets) * 100}%`,
              }}
            />
          </div>

          {/* ── Body ── */}
          <div className="max-w-lg mx-auto px-4 py-5 pb-32 lg:pb-10">
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {featured.description}
            </p>

            {/* Desktop inline CTA */}
            <div className="hidden lg:flex gap-3 mb-8">
              <Link
                href={`/lottery/${featured.id}`}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-colors shadow-lg"
              >
                <Ticket className="h-4 w-4" />
                Сугалаа авах
              </Link>
              <Link
                href={`/lottery/${featured.id}/info`}
                className="flex items-center gap-2 border-2 border-gray-200 hover:border-amber-400 text-gray-700 hover:text-amber-600 font-bold text-sm uppercase tracking-widest px-8 py-4 rounded-xl transition-colors"
              >
                <Info className="h-4 w-4" />
                Дэлгэрэнгүй
              </Link>
            </div>

            {/* Other lotteries */}
            {activeLotteries.length > 1 && (
              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
                  Бусад сугалаанууд
                </h2>
                <div className="space-y-3">
                  {activeLotteries.slice(1).map((lottery) => (
                    <div
                      key={lottery.id}
                      className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3"
                    >
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl shrink-0">
                        🚗
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm uppercase tracking-wide truncate">
                          {lottery.carBrand} {lottery.carModel}
                        </p>
                        <p className="text-amber-500 font-bold text-sm">
                          {formatMNT(lottery.prizeValue)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {lottery.ticketsSold}/{lottery.maxTickets} тасалбар ·{" "}
                          {formatMNT(lottery.ticketPrice)}/ш
                        </p>
                      </div>
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Link
                          href={`/lottery/${lottery.id}`}
                          className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wide px-3 py-1.5 rounded-lg text-center transition-colors"
                        >
                          Авах
                        </Link>
                        <Link
                          href={`/lottery/${lottery.id}/info`}
                          className="border border-gray-200 hover:border-amber-300 text-gray-600 hover:text-amber-600 text-[10px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-lg text-center transition-colors"
                        >
                          Дэлгэрэнгүй
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Sticky bottom CTA (mobile only) ── */}
      {featured && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:hidden">
          <div className="flex gap-2">
            <Link
              href={`/lottery/${featured.id}/info`}
              className="flex items-center justify-center gap-1.5 border-2 border-amber-400 text-amber-600 font-black text-sm uppercase tracking-wider px-4 py-3.5 rounded-xl transition-colors shrink-0"
            >
              <Info className="h-4 w-4" />
            </Link>
            <Link
              href={`/lottery/${featured.id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-sm uppercase tracking-widest py-3.5 rounded-xl text-center transition-colors shadow-lg"
            >
              <Ticket className="h-4 w-4" />
              Сугалаа авах
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
