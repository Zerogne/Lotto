"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Ticket {
  code: string;
  phone: string;
  lottery_name: string;
  lottery_id: string;
}

interface Lottery {
  id: string;
  car_name: string;
  car_brand: string;
  car_model: string;
}

interface Props {
  tickets: Ticket[];
  lotteries: Lottery[];
}

export default function RevealClient({ tickets, lotteries }: Props) {
  const [selectedLotteryId, setSelectedLotteryId] = useState(lotteries[0]?.id ?? "");
  const [digits, setDigits] = useState(["", "", "", "", ""]);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const lotteryTickets = tickets.filter((t) => t.lottery_id === selectedLotteryId);
  const partialCode = digits.join("");
  const matches = partialCode.length === 0
    ? []
    : lotteryTickets.filter((t) => t.code.startsWith(partialCode));

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 4) inputRefs[index + 1].current?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputRefs[index - 1].current?.focus();
    }
  }

  function reset() {
    setDigits(["", "", "", "", ""]);
    inputRefs[0].current?.focus();
  }

  const isComplete = partialCode.length === 5;
  const winner = isComplete && matches.length === 1 ? matches[0] : null;

  return (
    <div className="space-y-6">
      {/* Lottery selector */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-xs uppercase tracking-wider mb-2">Сугалаа сонгох</Label>
          <Select
            value={selectedLotteryId}
            onValueChange={(val) => { setSelectedLotteryId(val); reset(); }}
          >
            <SelectTrigger className="h-11 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lotteries.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.car_brand} {l.car_model} — {l.car_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-400 mt-2">
            Энэ сугалаанд нийт <span className="font-bold text-gray-700">{lotteryTickets.length}</span> тасалбар байна
          </p>
        </CardContent>
      </Card>

      {/* Digit inputs */}
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-sm text-gray-500 mb-4 uppercase tracking-wider font-semibold">Хожсон тасалбарын дугаар</p>
          <div className="flex justify-center gap-3 mb-4">
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
          <Button variant="ghost" size="sm" onClick={reset} className="text-xs text-gray-400 hover:text-gray-600 underline h-auto">
            Цэвэрлэх
          </Button>
        </CardContent>
      </Card>

      {/* Matches */}
      {partialCode.length > 0 && (
        <Card className="overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="font-bold text-gray-900">
              {isComplete ? "Үр дүн" : `Таарч буй тасалбар (${matches.length})`}
            </p>
            <span className="text-xs text-gray-400 tabular-nums font-mono bg-gray-100 px-2 py-0.5 rounded">
              {partialCode}{"_".repeat(5 - partialCode.length)}
            </span>
          </div>

          {matches.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">Таарах тасалбар олдсонгүй</p>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {matches.map((t, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between px-4 py-3 ${
                    isComplete ? "bg-amber-50" : ""
                  }`}
                >
                  <div>
                    <p className="font-black tabular-nums text-lg text-amber-700">{t.code}</p>
                    <p className="text-xs text-gray-500">{t.lottery_name}</p>
                  </div>
                  <p className="font-bold tabular-nums text-gray-900">{t.phone}</p>
                </div>
              ))}
            </div>
          )}

          {isComplete && matches.length > 0 && (
            <div className="px-4 py-4 bg-amber-500 text-white text-center">
              <p className="text-xs uppercase tracking-widest mb-1 opacity-80">
                {matches.length === 1 ? "Хожигч" : `${matches.length} тасалбар таарлаа`}
              </p>
              {winner ? (
                <>
                  <p className="text-2xl font-black">{winner.phone}</p>
                  <p className="text-sm opacity-80 mt-1">Тасалбар: {winner.code}</p>
                </>
              ) : (
                <p className="text-lg font-bold">{matches.length} хүн энэ дугаартай</p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
