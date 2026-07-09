"use client";

import { useEffect, useState } from "react";

interface Props {
  endDate: string;
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(endDate: string): TimeLeft {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function CountdownTimer({ endDate, compact = false }: Props) {
  const [time, setTime] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTime(calcTimeLeft(endDate));
    const id = setInterval(() => setTime(calcTimeLeft(endDate)), 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { label: "Өдөр", value: time.days },
    { label: "Цаг", value: time.hours },
    { label: "Мин", value: time.minutes },
    { label: "Сек", value: time.seconds },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-slate-500">
        <span className="font-bold text-slate-700 tabular-nums">
          {time.days}өд {pad(time.hours)}цаг
        </span>
        <span className="text-slate-400">үлдсэн</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-3 sm:gap-5">
          <div className="flex flex-col items-center">
            <div className="bg-white/15 backdrop-blur border border-white/20 text-white rounded-xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold font-mono tabular-nums">{pad(value)}</span>
            </div>
            <span className="text-[10px] font-medium text-white/60 mt-1.5 uppercase tracking-wider">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-white/30 font-light text-lg pb-5">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
