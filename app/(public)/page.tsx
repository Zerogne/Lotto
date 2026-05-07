import Link from "next/link";
import { LOTTERIES, formatMNT } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";

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
            {/* Car silhouette placeholder */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
              <span className="text-[160px] leading-none">🚗</span>
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

              {/* Prize value */}
              <div className="inline-block bg-white/10 backdrop-blur rounded-2xl px-6 py-3 mb-6 border border-white/20">
                <p className="text-amber-400 font-black text-2xl sm:text-3xl">
                  {formatMNT(featured.prizeValue)}
                </p>
                <p className="text-white/60 text-xs mt-0.5 uppercase tracking-wider">Нийт шагналын дүн</p>
              </div>

              {/* Countdown */}
              <div className="mb-4">
                <p className="text-white/50 text-xs uppercase tracking-widest mb-2">Дуусах хугацаа</p>
                <CountdownTimer endDate={featured.endDate} />
              </div>
            </div>
          </div>

          {/* ── Info strip ── */}
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-3">
            <div className="max-w-lg mx-auto flex items-center justify-between gap-4">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Нийт авсан сугалаа</p>
                <p className="font-black text-gray-900 text-sm">
                  {featured.ticketsSold.toLocaleString()}{" "}
                  <span className="text-gray-400 font-normal">/ {featured.maxTickets.toLocaleString()}</span>
                </p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Тасалбарын үнэ</p>
                <p className="font-black text-amber-600 text-sm">{formatMNT(featured.ticketPrice)}</p>
              </div>
              <div className="h-8 w-px bg-amber-200" />
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-wider text-gray-500">Сугалааны дугаар</p>
                <p className="font-black text-gray-900 text-sm">{featured.id}</p>
              </div>
            </div>
          </div>

          {/* ── Progress bar ── */}
          <div className="h-2 bg-gray-100">
            <div
              className="h-2 bg-amber-500 transition-all"
              style={{ width: `${(featured.ticketsSold / featured.maxTickets) * 100}%` }}
            />
          </div>

          {/* ── Description ── */}
          <div className="max-w-lg mx-auto px-4 py-5 pb-32 lg:pb-10">
            <p className="text-sm text-gray-600 leading-relaxed mb-6">{featured.description}</p>

            {/* Desktop CTA (inline) */}
            <div className="hidden lg:block">
              <Link
                href={`/lottery/${featured.id}`}
                className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-black text-base uppercase tracking-widest px-10 py-4 rounded-xl transition-colors shadow-lg"
              >
                Сугалаа авах
              </Link>
            </div>

            {/* Other active lotteries */}
            {activeLotteries.length > 1 && (
              <div className="mt-8">
                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-4">
                  Бусад сугалаанууд
                </h2>
                <div className="space-y-3">
                  {activeLotteries.slice(1).map((lottery) => (
                    <Link
                      key={lottery.id}
                      href={`/lottery/${lottery.id}`}
                      className="flex items-center gap-4 bg-gray-50 hover:bg-amber-50 border border-gray-100 hover:border-amber-200 rounded-xl p-3 transition-colors"
                    >
                      <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl shrink-0">
                        🚗
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm uppercase tracking-wide truncate">
                          {lottery.carBrand} {lottery.carModel}
                        </p>
                        <p className="text-amber-500 font-bold text-sm">{formatMNT(lottery.prizeValue)}</p>
                        <p className="text-xs text-gray-500">
                          {lottery.ticketsSold}/{lottery.maxTickets} тасалбар ·{" "}
                          {formatMNT(lottery.ticketPrice)}/ш
                        </p>
                      </div>
                      <div className="text-amber-500 shrink-0">→</div>
                    </Link>
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
          <Link
            href={`/lottery/${featured.id}`}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl text-center transition-colors shadow-lg"
          >
            Сугалаа авах
          </Link>
        </div>
      )}
    </div>
  );
}
