"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  lotteryId: string;
  lotteryName: string;
  codeDigits: 4 | 5;
  remainingCount: number;
}

export default function AvailableLotteryNumbers({
  lotteryId,
  lotteryName,
  codeDigits,
  remainingCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");
  const matchesCache = useRef(new Map<string, string[]>());

  useEffect(() => {
    if (!open || code.length < 2) {
      setMatches([]);
      setMatchesLoading(false);
      setMatchesError("");
      return;
    }

    const cached = matchesCache.current.get(code);
    if (cached) {
      setMatches(cached);
      setMatchesLoading(false);
      setMatchesError("");
      return;
    }

    const controller = new AbortController();
    setMatchesLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/lotteries/${lotteryId}/availability?prefix=${encodeURIComponent(code)}`,
          { signal: controller.signal }
        );
        const data = await response.json();
        if (response.ok) {
          const nextMatches = data.matches ?? [];
          matchesCache.current.set(code, nextMatches);
          setMatches(nextMatches);
          setMatchesError("");
        } else {
          setMatches([]);
          setMatchesError(data.error ?? "Дугаар хайж чадсангүй.");
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMatches([]);
          setMatchesError("Сүлжээний алдаа гарлаа.");
        }
      } finally {
        if (!controller.signal.aborted) setMatchesLoading(false);
      }
    }, 50);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [code, lotteryId, open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setMatches([]);
    setMatchesError("");
    if (!nextOpen) {
      setCode("");
      matchesCache.current.clear();
    }
  }

  return (
    <div className={open ? "basis-full" : ""}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 text-xs"
        onClick={() => handleOpenChange(!open)}
        aria-expanded={open}
        aria-label={`${lotteryName} сугалааны бүртгэгдээгүй дугаар шалгах`}
      >
        Үлдсэн {remainingCount.toLocaleString("mn-MN")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      {open && (
        <div className="mt-2 min-w-[18rem] animate-in rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-left duration-150 slide-in-from-top-2">
          <Input
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, codeDigits));
              setMatchesError("");
            }}
            inputMode="numeric"
            placeholder="Бүртгэгдээгүй дугаар хайх"
            className="bg-white font-mono"
            aria-label="Бүртгэгдээгүй сугалааны дугаар хайх"
            autoFocus
          />

          {code.length > 0 && code.length < 2 && (
            <p className="mt-2 text-xs text-gray-500">Тохирох дугаар харахын тулд хамгийн багадаа 2 орон бичнэ үү.</p>
          )}
          {matchesLoading && <p className="mt-3 text-xs text-gray-500">Дугаар хайж байна...</p>}
          {!matchesLoading && code.length >= 2 && matches.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-gray-600">Бүртгэгдээгүй тохирох дугаарууд</p>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-5">
                {matches.map((match) => (
                  <button
                    key={match}
                    type="button"
                    onClick={() => {
                      matchesCache.current.set(match, [match]);
                      setCode(match);
                      setMatches([match]);
                    }}
                    className="rounded border border-green-200 bg-white px-2 py-1.5 font-mono text-xs text-green-700 hover:bg-green-50"
                  >
                    {match}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!matchesLoading && !matchesError && code.length >= 2 && matches.length === 0 && (
            <p className="mt-3 text-xs text-gray-500">Бүртгэгдээгүй тохирох дугаар олдсонгүй.</p>
          )}
          {matchesError && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{matchesError}</p>
          )}
        </div>
      )}
    </div>
  );
}
