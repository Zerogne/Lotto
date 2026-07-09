import { getLotteries, getWinners } from "@/lib/db";
import { formatMNT, formatDate } from "@/lib/mock-data";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WinnersPage() {
  const [winners, lotteries] = await Promise.all([getWinners(), getLotteries()]);
  const endedLotteries = lotteries.filter((l) => l.status === "ended");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-12">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="h-7 w-7 text-amber-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хожигчид</h1>
          <p className="text-sm text-gray-500">Өнгөрсөн сугалаануудын хожигчид</p>
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Одоогоор хожигч байхгүй байна</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((winner) => (
            <div
              key={winner.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-3">
                <div>
                  <span className="inline-block bg-amber-100 text-amber-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full mb-2">
                    Хожигч
                  </span>
                  <h2 className="text-base font-bold text-gray-900 leading-tight">{winner.carName}</h2>
                  <p className="text-amber-600 font-semibold text-sm mt-0.5">{formatMNT(winner.prizeValue)}</p>
                </div>
                <Trophy className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              </div>
              <div className="px-4 pb-4">
                <div className="h-px bg-gray-100 mb-3" />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Утас</span>
                    <span className="font-mono font-medium text-gray-900">{winner.winnerPhone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Тасалбарын код</span>
                    <span className="font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      {winner.ticketCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Зарлагдсан огноо</span>
                    <span className="text-gray-900">{formatDate(winner.drawDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {endedLotteries.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Дууссан сугалаанууд</h2>
          <div className="space-y-3">
            {endedLotteries.map((lottery) => {
              const winner = winners.find((w) => w.lotteryId === lottery.id);
              return (
                <div
                  key={lottery.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{lottery.carName}</p>
                    <p className="text-sm text-gray-500">{formatDate(lottery.drawDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatMNT(lottery.prizeValue)}
                    </p>
                    {winner ? (
                      <span className="text-xs text-green-600 font-medium">Хожигч зарлагдсан</span>
                    ) : (
                      <span className="text-xs text-gray-400">Тодорхойгүй</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
