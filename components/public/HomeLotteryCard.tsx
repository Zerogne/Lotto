"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Lottery } from "@/lib/mock-data";
import { formatMNT } from "@/lib/mock-data";

interface Props {
  lottery: Lottery;
}

export default function HomeLotteryCard({ lottery }: Props) {
  const [imageOk, setImageOk] = useState(true);
  const active = lottery.status === "active";
  const pct = Math.min(
    100,
    lottery.maxTickets > 0 ? (lottery.ticketsSold / lottery.maxTickets) * 100 : 0
  );
  const remaining = Math.max(0, lottery.maxTickets - lottery.ticketsSold);

  return (
    <Link
      href={`/lottery/${lottery.id}`}
      className="group relative flex gap-3.5 rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 to-white px-3.5 py-3 shadow-sm shadow-slate-200/40 outline-none ring-amber-400/0 transition-all hover:border-amber-300/70 hover:bg-amber-50/30 hover:shadow-md hover:ring-4 focus-visible:ring-amber-400/30 sm:gap-4 sm:p-4"
    >
      <div
        className={`relative size-[4.5rem] shrink-0 overflow-hidden rounded-xl shadow-inner ring-1 ring-black/15 sm:size-[5rem] ${active ? "bg-gradient-to-br from-slate-800 to-[#0c1222]" : "bg-gradient-to-br from-slate-600 to-slate-900"}`}
      >
        
        {imageOk ? (
          <Image
            src={lottery.carImage}
            alt={`${lottery.carBrand} ${lottery.carModel}`}
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
        <p className="truncate font-black text-[15px] uppercase leading-tight tracking-wide text-[#162032]">
          {lottery.carBrand} {lottery.carModel}
        </p>
        <p className="font-black tabular-nums text-[clamp(1.05rem,2.8vw,1.35rem)] leading-none text-amber-600">
          {formatMNT(lottery.prizeValue)}
        </p>

        {active ? (
          <>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] text-slate-600">
              <span className="font-semibold tabular-nums text-slate-700">
                {lottery.ticketsSold.toLocaleString()}
                <span className="font-medium text-slate-400">
                  {" "}/ {lottery.maxTickets.toLocaleString()}
                </span>
                <span className="ml-1 font-semibold tracking-tight text-slate-700"> тасалбар</span>
              </span>
              <span className="hidden h-3 w-px bg-slate-300 sm:inline" aria-hidden />
              <span className="tabular-nums">
                <span className="font-bold text-slate-800">{formatMNT(lottery.ticketPrice)}</span>
                <span className="font-medium text-slate-400"> /ш · </span>
                <span className="font-semibold text-emerald-700">{remaining.toLocaleString()} үлдсэн</span>
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

      <div className="flex shrink-0 items-center self-center pl-1 text-amber-500 transition-transform duration-200 group-hover:translate-x-0.5">
        <ChevronRight className="size-6 sm:size-7" strokeWidth={2.25} aria-hidden />
      </div>
    </Link>
  );
}
