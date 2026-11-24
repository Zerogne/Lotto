"use client";

import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_CODE_DIGITS, isLotteryCodeDigits } from "@/lib/lotteryCodes";

interface Winner {
  code: string;
  phone: string;
  lottery_name: string;
}

interface Lottery {
  id: string;
  car_name: string;
  car_brand: string;
  car_model: string;
  code_digits?: number;
}

interface Props {
  lotteries: Lottery[];
}

type Result =
  | { type: "winner"; ticket: Winner }
  | { type: "not-found" }
  | { type: "error"; message: string }
  | null;

function codeDigitsForLottery(lottery: Lottery | undefined): 4 | 5 {
  const value = lottery?.code_digits;
  return isLotteryCodeDigits(value) ? value : DEFAULT_CODE_DIGITS;
}

export default function RevealClient({ lotteries }: Props) {
  const [selectedLotteryId, setSelectedLotteryId] = useState(lotteries[0]?.id ?? "");
  const [digits, setDigits] = useState<string[]>(() =>
    Array(codeDigitsForLottery(lotteries[0])).fill("")
  );
  const [result, setResult] = useState<Result>(null);
  const [checking, setChecking] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmationError, setConfirmationError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const selectedLottery = lotteries.find((lottery) => lottery.id === selectedLotteryId);
  const codeDigits = codeDigitsForLottery(selectedLottery);
  const code = digits.join("");
  const isComplete = digits.every(Boolean) && code.length === codeDigits;

  function updateDigits(next: string[]) {
    setDigits(next);
    setResult(null);
    setConfirmed(false);
    setConfirmationError("");
  }

  function handleDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    updateDigits(next);
    if (digit && index < codeDigits - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(index: number, event: React.ClipboardEvent) {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    event.preventDefault();
    const next = [...digits];
    const chars = pasted.slice(0, codeDigits - index).split("");
    chars.forEach((char, offset) => { next[index + offset] = char; });
    updateDigits(next);
    inputRefs.current[Math.min(index + chars.length, codeDigits - 1)]?.focus();
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent) {
    if (event.key === "Enter" && isComplete) {
      event.preventDefault();
      void checkNumber();
      return;
    }
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      const next = [...digits];
      next[index - 1] = "";
      updateDigits(next);
      inputRefs.current[index - 1]?.focus();
    }
  }

  function reset(nextCodeDigits = codeDigits) {
    setDigits(Array(nextCodeDigits).fill(""));
    setResult(null);
    setConfirmed(false);
    setConfirmationError("");
    inputRefs.current[0]?.focus();
  }

  async function checkNumber() {
    if (!selectedLotteryId || !isComplete || checking) return;
    setChecking(true);
    setResult(null);
    setConfirmed(false);
    setConfirmationError("");

    try {
      const params = new URLSearchParams({
        lotteryId: selectedLotteryId,
        code,
        status: "paid",
      });
      const response = await fetch(`/api/tickets?${params.toString()}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        setResult({ type: "error", message: data.error ?? "Шалгах үед алдаа гарлаа" });
        return;
      }

      const ticket = Array.isArray(data) ? data[0] : undefined;
      setResult(ticket
        ? {
            type: "winner",
            ticket: {
              code: ticket.code,
              phone: ticket.phone,
              lottery_name: ticket.lottery_name ?? selectedLottery?.car_name ?? "",
            },
          }
        : { type: "not-found" });
    } catch {
      setResult({ type: "error", message: "Сүлжээний алдаа гарлаа. Дахин оролдоно уу." });
    } finally {
      setChecking(false);
    }
  }

  async function confirmWinner() {
    if (result?.type !== "winner" || confirming || confirmed) return;
    if (!window.confirm(`${result.ticket.phone} дугаарыг ялагчаар батлах уу?`)) return;

    setConfirming(true);
    setConfirmationError("");
    try {
      const response = await fetch("/api/winners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotteryId: selectedLotteryId, code: result.ticket.code }),
      });
      const data = await response.json();
      if (!response.ok) {
        setConfirmationError(data.error ?? "Ялагч баталгаажуулах үед алдаа гарлаа");
        return;
      }
      setConfirmed(true);
    } catch {
      setConfirmationError("Сүлжээний алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setConfirming(false);
    }
  }

  if (lotteries.length === 0) {
    return <p className="text-center text-sm text-gray-400 py-10">Сугалаа байхгүй байна</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <Label className="text-xs uppercase tracking-wider mb-2">Сугалаа сонгох</Label>
          <Select
            value={selectedLotteryId}
            disabled={checking}
            onValueChange={(value) => {
              setSelectedLotteryId(value);
              const nextLottery = lotteries.find((lottery) => lottery.id === value);
              reset(codeDigitsForLottery(nextLottery));
            }}
          >
            <SelectTrigger className="h-11 font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lotteries.map((lottery) => (
                <SelectItem key={lottery.id} value={lottery.id}>
                  {lottery.car_brand} {lottery.car_model} — {lottery.car_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex justify-center gap-2 sm:gap-3 mb-5">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => { inputRefs.current[index] = element; }}
                type="text"
                inputMode="numeric"
                disabled={checking}
                autoFocus={index === 0}
                aria-label={`${index + 1}-р орон`}
                value={digit}
                onChange={(event) => handleDigit(index, event.target.value)}
                onPaste={(event) => handlePaste(index, event)}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-black border-2 rounded-xl focus:outline-none transition-colors ${
                  digit ? "border-amber-500 bg-amber-50 text-amber-700" : "border-gray-200 focus:border-amber-400"
                }`}
              />
            ))}
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => reset()} disabled={checking}>
              Цэвэрлэх
            </Button>
            <Button
              onClick={() => void checkNumber()}
              disabled={!isComplete || checking}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {checking ? "Шалгаж байна..." : "Дугаар шалгах"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result?.type === "not-found" && (
        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <p className="font-bold text-gray-900">{code} дугаар бүртгэлгүй байна</p>
            <Button variant="outline" onClick={() => reset()} className="mt-4">Дараагийн дугаар</Button>
          </CardContent>
        </Card>
      )}

      {result?.type === "winner" && (
        <Card className="overflow-hidden border-amber-300">
          <div className="px-4 py-3 bg-amber-500 text-white text-center">
            <p className="text-xs uppercase tracking-widest opacity-80">Ялагч</p>
            <p className="text-2xl font-black mt-1">{result.ticket.phone}</p>
            <p className="text-sm opacity-90 mt-1">Сугалааны дугаар: {result.ticket.code}</p>
          </div>
          <CardContent className="p-4 text-center">
            <p className="text-sm font-semibold text-gray-800">{result.ticket.lottery_name}</p>
            {confirmed ? (
              <p className="mt-3 text-sm font-bold text-green-700" aria-live="polite">
                Ялагч баталгаажлаа
              </p>
            ) : (
              <Button
                onClick={() => void confirmWinner()}
                disabled={confirming}
                className="mt-3 bg-amber-500 hover:bg-amber-600 text-white"
              >
                {confirming ? "Баталгаажуулж байна..." : "Ялагчаар батлах"}
              </Button>
            )}
            {confirmationError && (
              <p className="mt-3 text-sm text-red-600" role="alert">{confirmationError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {result?.type === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-center text-sm text-red-700">{result.message}</CardContent>
        </Card>
      )}
    </div>
  );
}
