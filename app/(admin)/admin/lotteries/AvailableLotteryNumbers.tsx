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

interface ToggleProps extends Props {
  open: boolean;
  onToggle: () => void;
}

export function AvailableLotteryToggle({
  lotteryName,
  remainingCount,
  open,
  onToggle,
}: ToggleProps) {
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      className="gap-1 text-xs"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={`${lotteryName} сугалааны бүртгэгдээгүй дугаар шалгах`}
    >
      Үлдсэн {remainingCount.toLocaleString("mn-MN")}
      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
    </Button>
  );
}

export function AvailableLotterySearch({
  lotteryId,
  codeDigits,
}: Pick<Props, "lotteryId" | "codeDigits">) {
  const [code, setCode] = useState("");
  const [matches, setMatches] = useState<string[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const matchesCache = useRef(new Map<string, string[]>());

  useEffect(() => {
    if (code.length < 2) {
      setMatches([]);
      setMatchesLoading(false);
      setMatchesError("");
      setHasSearched(false);
      return;
    }

    const cached = matchesCache.current.get(code);
    if (cached) {
      setMatches(cached);
      setMatchesLoading(false);
      setMatchesError("");
      setHasSearched(true);
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
          setHasSearched(true);
        } else {
          setMatches([]);
          setMatchesError(data.error ?? "Дугаар хайж чадсангүй.");
          setHasSearched(true);
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMatches([]);
          setMatchesError("Сүлжээний алдаа гарлаа.");
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) setMatchesLoading(false);
      }
    }, 50);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [code, lotteryId]);

  return (
    <div className="min-w-[18rem] animate-in rounded-lg border border-amber-200 bg-amber-50/50 p-3 text-left duration-150 slide-in-from-top-2">
          <Input
            value={code}
            onChange={(event) => {
              setCode(event.target.value.replace(/\D/g, "").slice(0, codeDigits));
              setMatchesError("");
              setHasSearched(false);
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
              <p className="mb-2 text-xs font-medium text-gray-600">Утасны дугаарт бүртгэлгүй тохирох дугаарууд</p>
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
          {!matchesLoading && hasSearched && !matchesError && code.length >= 2 && matches.length === 0 && (
            <p className="mt-3 text-xs text-gray-500">Таны хайлттай тохирох бүртгэлгүй дугаар олдсонгүй.</p>
          )}
          {matchesError && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{matchesError}</p>
          )}
    </div>
  );
}

export default function AvailableLotteryNumbers(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={open ? "basis-full" : ""}>
      <AvailableLotteryToggle {...props} open={open} onToggle={() => setOpen((current) => !current)} />
      {open && (
        <div className="mt-2">
          <AvailableLotterySearch lotteryId={props.lotteryId} codeDigits={props.codeDigits} />
        </div>
      )}
    </div>
  );
}
