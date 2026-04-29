"use client";

import { useEffect, useState } from "react";

interface Props {
  endDate: string;
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

export default function CountdownTimer({ endDate }: Props) {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft(endDate));

  useEffect(() => {
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

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {units.map(({ label, value }, i) => (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col items-center">
            <div className="bg-gray-900 text-white rounded-lg w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold font-mono">{pad(value)}</span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{label}</span>
          </div>
          {i < units.length - 1 && (
            <span className="text-gray-400 font-bold text-xl mb-4">:</span>
          )}
        </div>
      ))}
    </div>
  );
}
