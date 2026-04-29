import Link from "next/link";
import { LOTTERIES, formatMNT } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";

export default function LandingPage() {
  const activeLotteries = LOTTERIES.filter((l) => l.status === "active");
  const featured = activeLotteries[0];

  return (
    <div>
      {/* Hero section */}
      {featured && (
        <section className="relative">
          {/* Mobile: stacked layout */}
          <div className="lg:hidden">
            <div className="relative w-full aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/30 text-6xl font-bold">🚗</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-2">
                  ИДЭВХТЭЙ
                </span>
              </div>
            </div>

            <div className="px-4 pt-4 pb-24">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{featured.carName}</h1>
              <p className="text-amber-500 font-bold text-xl mb-4">
                {formatMNT(featured.prizeValue)}
              </p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 text-center mb-2">Дуусах хугацаа</p>
                <CountdownTimer endDate={featured.endDate} />
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-gray-500">Нийт авсан сугалаа</p>
                  <p className="font-bold text-gray-900">
                    {featured.ticketsSold.toLocaleString()} /{" "}
                    {featured.maxTickets.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Сугалааны үнэ</p>
                  <p className="font-bold text-amber-600">{formatMNT(featured.ticketPrice)}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${(featured.ticketsSold / featured.maxTickets) * 100}%`,
                  }}
                />
              </div>

              <p className="text-sm text-gray-600 mb-4">{featured.description}</p>
            </div>

            {/* Sticky bottom CTA */}
            <div className="fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 p-4">
              <Link
                href={`/lottery/${featured.id}`}
                className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg py-4 rounded-xl text-center transition-colors"
              >
                Сугалаа авах
              </Link>
            </div>
          </div>

          {/* Desktop: split layout */}
          <div className="hidden lg:block max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 gap-12 items-center">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
                <div className="absolute inset-0 flex items-center justify-center text-white/20 text-8xl font-bold">
                  🚗
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>

              <div>
                <span className="inline-block bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                  ИДЭВХТЭЙ
                </span>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{featured.carName}</h1>
                <p className="text-amber-500 font-bold text-3xl mb-6">
                  {formatMNT(featured.prizeValue)}
                </p>

                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Дуусах хугацаа</p>
                  <CountdownTimer endDate={featured.endDate} />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Нийт авсан сугалаа</p>
                    <p className="font-bold text-gray-900 text-lg">
                      {featured.ticketsSold.toLocaleString()} /{" "}
                      {featured.maxTickets.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Сугалааны үнэ</p>
                    <p className="font-bold text-amber-600 text-lg">
                      {formatMNT(featured.ticketPrice)}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-amber-500 h-2 rounded-full"
                    style={{
                      width: `${(featured.ticketsSold / featured.maxTickets) * 100}%`,
                    }}
                  />
                </div>

                <p className="text-gray-600 mb-6">{featured.description}</p>

                <Link
                  href={`/lottery/${featured.id}`}
                  className="inline-block bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg px-10 py-4 rounded-xl transition-colors"
                >
                  Сугалаа авах
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other active lotteries */}
      {activeLotteries.length > 1 && (
        <section className="max-w-6xl mx-auto px-4 pb-32 lg:pb-12 lg:px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Бусад сугалаанууд</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeLotteries.slice(1).map((lottery) => (
              <Link
                key={lottery.id}
                href={`/lottery/${lottery.id}`}
                className="block rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="aspect-video bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-5xl text-white/20">
                  🚗
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{lottery.carName}</h3>
                  <p className="text-amber-500 font-semibold text-sm mb-2">
                    {formatMNT(lottery.prizeValue)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {lottery.ticketsSold}/{lottery.maxTickets} тасалбар
                    </span>
                    <span>{formatMNT(lottery.ticketPrice)}/тасалбар</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
