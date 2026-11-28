"use client";

import { FormEvent, useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  lotteryId: string;
  lotteryName: string;
  codeDigits: 4 | 5;
  remainingCount: number;
  totalCount: number;
}

type SearchResult =
  | { kind: "available"; code: string }
  | { kind: "registered"; code: string }
  | { kind: "error"; message: string };

export default function AvailableLotteryNumbers({
  lotteryId,
  lotteryName,
  codeDigits,
  remainingCount,
  totalCount,
}: Props) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<string[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  useEffect(() => {
    if (!open || code.length < 2 || result) {
      setMatches([]);
      setMatchesLoading(false);
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
        if (response.ok) setMatches(data.matches ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) setMatches([]);
      } finally {
        if (!controller.signal.aborted) setMatchesLoading(false);
      }
    }, 150);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [code, lotteryId, open, result]);

  async function checkCode(event: FormEvent) {
    event.preventDefault();
    setResult(null);

    if (code.length !== codeDigits || Number(code) === 0) {
      setResult({ kind: "error", message: `${codeDigits} оронтой зөв дугаар оруулна уу.` });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/lotteries/${lotteryId}/availability?code=${encodeURIComponent(code)}`
      );
      const data = await response.json();
      if (!response.ok) {
        setResult({ kind: "error", message: data.error ?? "Шалгаж чадсангүй." });
      } else {
        setResult({ kind: data.available ? "available" : "registered", code: data.code });
      }
    } catch {
      setResult({ kind: "error", message: "Сүлжээний алдаа гарлаа." });
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setResult(null);
    setMatches([]);
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
        <div className="mt-2 min-w-[18rem] animate-in rounded-lg border border-amber-200 bg-amber-50/50 p-4 text-left duration-150 slide-in-from-top-2">
          <p className="text-sm font-semibold text-gray-900">{lotteryName}</p>
          <p className="mt-1 text-xs text-gray-500">
            {remainingCount.toLocaleString("mn-MN")} / {totalCount.toLocaleString("mn-MN")} дугаар үлдсэн
          </p>
          <form onSubmit={checkCode} className="mt-3 flex gap-2">
            <Input
              value={code}
              onChange={(event) => {
                setCode(event.target.value.replace(/\D/g, "").slice(0, codeDigits));
                setResult(null);
              }}
              inputMode="numeric"
              placeholder={`${codeDigits} оронтой дугаар`}
              className="font-mono"
              aria-label="Сугалааны дугаар"
            />
            <Button type="submit" size="sm" disabled={loading} className="h-10 gap-1 bg-amber-500 text-white hover:bg-amber-600">
              <Search className="h-4 w-4" />
              {loading ? "..." : "Шалгах"}
            </Button>
          </form>

          {code.length > 0 && code.length < 2 && (
            <p className="mt-2 text-xs text-gray-500">Тохирох дугаар харахын тулд 2-оос дээш орон бичнэ үү.</p>
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
                      setCode(match);
                      setMatches([]);
                      setResult({ kind: "available", code: match });
                    }}
                    className="rounded border border-green-200 bg-white px-2 py-1.5 font-mono text-xs text-green-700 hover:bg-green-50"
                  >
                    {match}
                  </button>
                ))}
              </div>
            </div>
          )}
          {!matchesLoading && code.length >= 2 && matches.length === 0 && !result && (
            <p className="mt-3 text-xs text-gray-500">Бүртгэгдээгүй тохирох дугаар олдсонгүй.</p>
          )}

          {result?.kind === "available" && (
            <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
              {result.code} дугаар бүртгэгдээгүй байна.
            </p>
          )}
          {result?.kind === "registered" && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              {result.code} дугаар бүртгэгдсэн байна.
            </p>
          )}
          {result?.kind === "error" && (
            <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{result.message}</p>
          )}
        </div>
      )}
    </div>
  );
}
