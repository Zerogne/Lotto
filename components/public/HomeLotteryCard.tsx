"use client";

import Image from "next/image";
import { useState } from "react";
import type { Lottery } from "@/lib/mock-data";
import { formatMNT } from "@/lib/mock-data";
import CountdownTimer from "./CountdownTimer";

interface Props {
  lottery: Lottery;
  featured?: boolean;
}

export default function HomeLotteryCard({ lottery, featured = false }: Props) {
  const [imageOk, setImageOk] = useState(true);
  const active = lottery.status === "active";
  const pct = Math.min(
    100,
    lottery.maxTickets > 0 ? (lottery.ticketsSold / lottery.maxTickets) * 100 : 0
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
        </div>
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
    </div>
  );
}
