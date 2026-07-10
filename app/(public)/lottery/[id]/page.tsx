import { notFound } from "next/navigation";
import Link from "next/link";
import { getLotteryById } from "@/lib/db";
import { formatMNT } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";
import LotteryImageGallery from "@/components/public/LotteryImageGallery";
import { ChevronLeft, Ticket, Trophy, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LotteryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lottery = await getLotteryById(id);
  if (!lottery) notFound();

  const pct = Math.min(
    100,
    lottery.maxTickets > 0 ? (lottery.ticketsSold / lottery.maxTickets) * 100 : 0
  );
  const active = lottery.status === "active";

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Back nav */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Буцах
        </Link>
      </div>

      {/* Car image */}
      <div className="relative mt-2">
        <LotteryImageGallery
          images={lottery.carImages.filter((src) => src !== "/images/car-placeholder.svg")}
          video={lottery.carVideo}
          alt={`${lottery.carBrand} ${lottery.carModel}`}
        />
        {active && (
          <div className="absolute top-4 left-4 z-10">
            <span className="inline-block bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
              Идэвхтэй сугалаа
            </span>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">

        {/* Title + price */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide text-[#162032] leading-tight">
            <span className="text-amber-500">{lottery.carName}</span> {lottery.carModel}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
            <Ticket className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500 font-medium">Тасалбарын үнэ</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{formatMNT(lottery.ticketPrice)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
            <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500 font-medium">Нийт тасалбар</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{lottery.maxTickets.toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3 text-center">
            <CalendarDays className="h-4 w-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xs text-slate-500 font-medium">Дуусах огноо</p>
            <p className="text-sm font-black text-slate-800 mt-0.5">{lottery.endDate}</p>
          </div>
        </div>

        {/* Progress */}
        {active && (
          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
              <span className="text-amber-600">{Math.round(pct)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Countdown */}
        {active && (
          <div className="rounded-2xl bg-[#0c1222] p-5 flex flex-col items-center gap-3">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Дуусах хугацаа</p>
            <CountdownTimer endDate={lottery.endDate} />
          </div>
        )}

        {/* Description */}
        {lottery.description && (
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">Дэлгэрэнгүй мэдээлэл</h2>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{lottery.description}</p>
          </div>
        )}
      </div>

      {/* Sticky buy button */}
      {active && (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3">
          <Link
            href={`/lottery/${lottery.id}/purchase`}
            className="block w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl text-center transition-colors shadow-lg"
          >
            Сугалаа авах — {formatMNT(lottery.ticketPrice)}
          </Link>
        </div>
      )}
    </div>
  );
}
