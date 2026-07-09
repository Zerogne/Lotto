"use client";

import { useRef, useState } from "react";

interface Ticket {
  code: string;
  phone: string;
  lottery_name: string;
}

interface Props {
  tickets: Ticket[];
}

export default function RevealClient({ tickets }: Props) {
  const [digits, setDigits] = useState(["", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const partialCode = digits.join("");
  const matches = partialCode.length === 0
    ? []
    : tickets.filter((t) => t.code.startsWith(partialCode));

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 4) inputRefs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
    }
  }

  function reset() {
    setDigits(["", "", "", "", ""]);
    inputRefs[0].current?.focus();
  }

  const isComplete = partialCode.length === 5;
  const winner = isComplete ? matches[0] : null;

  return (
    <div className="max-w-lg mx-auto space-y-8">
      {/* Digit inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
        <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Хожсон тасалбарын дугаар</p>
        <div className="flex justify-center gap-3 mb-6">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-16 text-center text-2xl font-black border-2 rounded-xl focus:outline-none transition-colors ${
                d ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 focus:border-amber-400"
              }`}
            />
          ))}
        </div>
        <button
          onClick={reset}
          className="text-xs text-gray-400 hover:text-gray-600 underline"
        >
          Цэвэрлэх
        </button>
      </div>

      {/* Matches */}
      {partialCode.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-900">
              {isComplete ? "Хожигч" : `Таарч буй тасалбар (${matches.length})`}
            </p>
            <span className="text-xs text-gray-400 tabular-nums font-mono">{partialCode}{"_".repeat(5 - partialCode.length)}</span>
          </div>

          {matches.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Таарах тасалбар олдсонгүй</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {matches.slice(0, 20).map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    isComplete && i === 0 ? "bg-amber-50 border-l-4 border-amber-500" : ""
                  }`}
                >
                  <div>
                    <p className={`font-black tabular-nums text-lg ${isComplete && i === 0 ? "text-amber-700" : "text-gray-900"}`}>
                      {t.code}
                    </p>
                    <p className="text-xs text-gray-500">{t.lottery_name}</p>
                  </div>
                  <p className={`font-bold tabular-nums ${isComplete && i === 0 ? "text-amber-700" : "text-gray-700"}`}>
                    {t.phone}
                  </p>
                </div>
              ))}
            </div>
          )}

          {winner && (
            <div className="px-4 py-4 bg-amber-500 text-white text-center">
              <p className="text-xs uppercase tracking-widest mb-1 opacity-80">Хожигч</p>
              <p className="text-2xl font-black">{winner.phone}</p>
              <p className="text-sm opacity-80 mt-1">Тасалбар: {winner.code}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
