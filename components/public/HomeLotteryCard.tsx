"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronRight, Ticket, Trophy, CalendarDays } from "lucide-react";
import type { Lottery } from "@/lib/mock-data";
import { formatMNT } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CountdownTimer from "./CountdownTimer";
import LotteryImageGallery from "./LotteryImageGallery";

interface Props {
  lottery: Lottery;
  featured?: boolean;
}

export default function HomeLotteryCard({ lottery, featured = false }: Props) {
  const [imageOk, setImageOk] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const active = lottery.status === "active";
  const pct = Math.min(
    100,
    lottery.maxTickets > 0 ? (lottery.ticketsSold / lottery.maxTickets) * 100 : 0
  );

  const detailsModal = (
    <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wide text-[#162032]">
            {lottery.carName}
          </DialogTitle>
          <DialogDescription className="sr-only">Сугалааны дэлгэрэнгүй мэдээлэл</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <LotteryImageGallery
            images={lottery.carImages.filter((src) => src !== "/images/car-placeholder.svg")}
            video={lottery.carVideo}
            alt={`${lottery.carBrand} ${lottery.carModel}`}
          />

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

          {active && (
            <div className="rounded-2xl bg-[#0c1222] p-5 flex flex-col items-center gap-3">
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Дуусах хугацаа</p>
              <CountdownTimer endDate={lottery.endDate} />
            </div>
          )}

          {lottery.description && (
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 mb-2">
                Дэлгэрэнгүй мэдээлэл
              </h2>
              <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{lottery.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  if (featured) {
    return (
      <div className="group relative block rounded-3xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white shadow-md shadow-slate-200/50 overflow-hidden">
        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="inline-block bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
            Идэвхтэй сугалаа
          </span>
        </div>

        {/* Car image */}
        <div className="relative w-full h-52 sm:h-64 bg-gradient-to-br from-slate-800 to-[#0c1222] overflow-hidden">
          {imageOk && lottery.carImage && lottery.carImage !== "/images/car-placeholder.svg" ? (
            <Image
              src={lottery.carImage}
              alt={lottery.carName}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
              priority
              onError={() => setImageOk(false)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl select-none">🚗</div>
          )}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-5">
          <h2 className="text-xl font-black uppercase tracking-wide text-[#162032] leading-tight mb-3">
            {lottery.carName}
          </h2>

          {active && (
            <>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 mb-3">

                <span>
                  <span className="font-bold text-slate-800">{formatMNT(lottery.ticketPrice)}</span>
                  <span className="text-slate-400"> /ш</span>
                </span>
              </div>

              <div className="mb-3">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Сугалааны явц</span>
                  <span className="tabular-nums">{Math.round(pct)}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <CountdownTimer endDate={lottery.endDate} compact />
              </div>
            </>
          )}

          <button
            onClick={() => setDetailsOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border-2 border-amber-400 text-amber-600 hover:bg-amber-50 font-black text-sm uppercase tracking-widest py-3 transition-colors"
          >
            Дэлгэрэнгүй <ChevronRight className="size-4" strokeWidth={2.5} />
          </button>
        </div>

        {detailsModal}
      </div>
    );
  }

  return (
    <div className="group relative flex gap-3.5 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-3.5 py-3 shadow-sm shadow-slate-200/40 sm:gap-4 sm:p-4">
      <div
        className={`relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl shadow-inner ring-1 ring-black/15 sm:size-[5rem] ${active ? "bg-gradient-to-br from-slate-800 to-[#0c1222]" : "bg-gradient-to-br from-slate-600 to-slate-900"}`}
      >
        {imageOk ? (
          <Image
            src={lottery.carImage}
            alt={lottery.carName}
            fill
            sizes="(max-width: 640px) 72px, 80px"
            className={`object-cover object-center transition duration-300 group-hover:scale-[1.04] ${active ? "" : "opacity-85 grayscale-[0.35]"}`}
            onError={() => setImageOk(false)}
          />
        ) : (
          <span className="flex size-full items-center justify-center bg-gradient-to-br from-slate-800 to-[#0c1222] text-3xl transition duration-300 group-hover:scale-105 select-none">
            🚗
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 sm:gap-1.5">
        <p className="truncate font-black text-[clamp(1.05rem,2.8vw,1.2rem)] uppercase leading-tight tracking-wide text-[#162032]">
          {lottery.carName}
        </p>

        {active ? (
          <>
            <div className="flex items-center gap-x-3 text-[13px] text-slate-600">
              <span className="tabular-nums">
                <span className="font-bold text-slate-800">{formatMNT(lottery.ticketPrice)}</span>
                <span className="font-medium text-slate-400"> /ш</span>
              </span>
            </div>
            <div className="pt-1" role="presentation">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200/95">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-sm transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span>Тасалбарын явц</span>
                <span className="tabular-nums">{Math.round(pct)}%</span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-[13px] font-medium text-slate-500">
            {lottery.status === "ended"
              ? "Дууссан"
              : lottery.status === "drawing"
                ? "Шалгаруулж байна"
                : lottery.status}
          </p>
        )}
      </div>

      <button
        onClick={() => setDetailsOpen(true)}
        className="flex shrink-0 items-center gap-0.5 self-center rounded-lg pl-1 text-xs font-bold text-amber-600 hover:text-amber-700"
      >
        Дэлгэрэнгүй <ChevronRight className="size-4" strokeWidth={2.5} />
      </button>

      {detailsModal}
    </div>
  );
}
