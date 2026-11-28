"use client";

import { FormEvent, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  }

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 text-xs"
        onClick={() => handleOpenChange(true)}
        aria-expanded={open}
        aria-label={`${lotteryName} сугалааны бүртгэгдээгүй дугаар шалгах`}
      >
        Үлдсэн {remainingCount.toLocaleString("mn-MN")}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Бүртгэгдээгүй дугаар шалгах</DialogTitle>
            <DialogDescription>{lotteryName}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-500">
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
        </DialogContent>
      </Dialog>
    </>
  );
}
