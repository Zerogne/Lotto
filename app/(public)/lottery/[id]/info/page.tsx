import { notFound } from "next/navigation";
import Link from "next/link";
import { getLotteryById, formatMNT, formatDate } from "@/lib/mock-data";
import CountdownTimer from "@/components/public/CountdownTimer";
import {
  Zap,
  Gauge,
  RotateCcw,
  Car,
  Calendar,
  Users,
  Palette,
  Wind,
  CheckCircle2,
  ArrowLeft,
  Ticket,
} from "lucide-react";

export default function CarInfoPage({ params }: { params: { id: string } }) {
  const lottery = getLotteryById(params.id);
  if (!lottery) notFound();

  const { specs, highlights } = lottery;
  const pct = Math.round((lottery.ticketsSold / lottery.maxTickets) * 100);

  const specItems = [
    { icon: Calendar, label: "Он", value: specs.year },
    { icon: Zap, label: "Хөдөлгүүр", value: specs.engine },
    { icon: Gauge, label: "Хүч", value: specs.power },
    { icon: Wind, label: "Татах хүч", value: specs.torque },
    { icon: RotateCcw, label: "Хурдны хайрцаг", value: specs.transmission },
    { icon: Car, label: "Хөтөлгөөн", value: specs.drivetrain },
    { icon: Gauge, label: "Хурдатгал", value: specs.acceleration },
    { icon: Gauge, label: "Дээд хурд", value: specs.topSpeed },
    { icon: Users, label: "Суудал", value: specs.seats },
    { icon: Palette, label: "Өнгө", value: specs.color },
  ];

  return (
    <div className="min-h-screen bg-white pb-32 lg:pb-10">
      {/* ── Dark hero ── */}
      <div className="relative bg-gray-900 overflow-hidden">
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

        {/* Back button */}
        <div className="relative z-10 px-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Буцах
          </Link>
        </div>

        <div className="relative z-10 text-center px-4 pt-4 pb-8">
          <p className="text-amber-400 font-black text-2xl sm:text-3xl uppercase tracking-widest leading-none mb-1 drop-shadow-lg">
            {lottery.carBrand}
          </p>
          <h1 className="text-white font-black text-3xl sm:text-4xl uppercase tracking-widest leading-none drop-shadow-lg">
            {lottery.carModel}
          </h1>
          <p className="text-amber-400 font-black text-xl mt-2">
            {formatMNT(lottery.prizeValue)}
          </p>
        </div>
      </div>

      {/* ── Car image placeholder ── */}
      <div className="relative w-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center overflow-hidden" style={{ height: 240 }}>
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.3) 0%, transparent 70%)",
          }}
        />
        <span className="text-[120px] leading-none select-none" style={{ filter: "drop-shadow(0 0 40px rgba(245,158,11,0.3))" }}>
          🚗
        </span>
        {lottery.status === "active" && (
          <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
            Идэвхтэй
          </span>
        )}
        {lottery.status === "ended" && (
          <span className="absolute top-3 left-3 bg-gray-500 text-white text-[10px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full">
            Дууссан
          </span>
        )}
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* ── Lottery summary card ── */}
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-700 mb-3">
            Сугалааны мэдээлэл
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                Тасалбарын үнэ
              </p>
              <p className="font-black text-amber-600 text-base">
                {formatMNT(lottery.ticketPrice)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                Нийт шагнал
              </p>
              <p className="font-black text-gray-900 text-base">
                {formatMNT(lottery.prizeValue)}
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                Тасалбар зарагдсан
              </p>
              <p className="font-black text-gray-900 text-base">
                {lottery.ticketsSold.toLocaleString()}{" "}
                <span className="text-gray-400 font-normal text-sm">
                  / {lottery.maxTickets.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-amber-100">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">
                Сугалааны дугаар
              </p>
              <p className="font-black text-gray-900 text-base">{lottery.id}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span>Зарагдсан</span>
              <span className="font-bold text-amber-600">{pct}%</span>
            </div>
            <div className="h-2.5 bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Countdown */}
          {lottery.status === "active" && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 text-center mb-2">
                Дуусах хугацаа
              </p>
              <CountdownTimer endDate={lottery.endDate} />
            </div>
          )}
          {lottery.status === "ended" && (
            <p className="text-center text-sm text-gray-500">
              Сугалаа {formatDate(lottery.drawDate)}-д зарлагдсан
            </p>
          )}
        </div>

        {/* ── Description ── */}
        <div className="mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">
            Тайлбар
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{lottery.description}</p>
        </div>

        {/* ── Highlights ── */}
        <div className="mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
            Онцлог тоноглол
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {highlights.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100"
              >
                <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech specs ── */}
        <div className="mb-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-3">
            Техникийн үзүүлэлт
          </h2>
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {specItems.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <Icon className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Fixed bottom CTA ── */}
      {lottery.status === "active" ? (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-200 px-4 py-3 lg:static lg:bg-transparent lg:border-0 lg:max-w-lg lg:mx-auto lg:w-full lg:px-4">
          <Link
            href={`/lottery/${lottery.id}`}
            className="flex items-center justify-center gap-2 w-full bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-black text-base uppercase tracking-widest py-4 rounded-xl transition-colors shadow-lg"
          >
            <Ticket className="h-5 w-5" />
            Сугалаа авах — {formatMNT(lottery.ticketPrice)}
          </Link>
        </div>
      ) : (
        <div className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 px-4 py-3 lg:static lg:max-w-lg lg:mx-auto lg:w-full lg:px-4">
          <div className="w-full bg-gray-100 text-gray-500 font-black text-base uppercase tracking-widest py-4 rounded-xl text-center">
            Сугалаа дууссан
          </div>
        </div>
      )}
    </div>
  );
}
