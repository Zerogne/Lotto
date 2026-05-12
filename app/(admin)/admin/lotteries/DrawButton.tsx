"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle } from "lucide-react";

interface Props {
  lotteryId: string;
  lotteryName: string;
}

export default function DrawButton({ lotteryId, lotteryName }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState<{ ticket_code: string; winner_phone: string } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [error, setError] = useState("");

  async function runDraw() {
    setDrawing(true);
    setError("");
    const res = await fetch(`/api/draw/${lotteryId}`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setWinner(data);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
    }
    setDrawing(false);
  }

  function handleOpen() {
    setWinner(null);
    setDrawing(false);
    setError("");
    setOpen(true);
  }

  return (
    <>
      <Button
        size="sm"
        className="bg-amber-500 hover:bg-amber-600 text-white text-xs w-full"
        onClick={handleOpen}
      >
        Шалгаруулах
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Сугалаа шалгаруулах</DialogTitle>
            <DialogDescription className="sr-only">
              {lotteryName} сугалааны хожигчийг шалгаруулах
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-2">
            <p className="text-sm text-gray-600 text-center">
              <strong>{lotteryName}</strong> сугалааны хожигчийг шалгаруулна уу.
            </p>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2 w-full text-center">
                {error}
              </p>
            )}

            {!winner && (
              <Button
                onClick={runDraw}
                disabled={drawing}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2 py-4"
              >
                <Shuffle className={`h-4 w-4 ${drawing ? "animate-spin" : ""}`} />
                {drawing ? "Шалгаруулж байна..." : "Шалгаруулах"}
              </Button>
            )}

            {winner && (
              <div className="w-full text-center">
                <div className="mb-4">
                  <Trophy className="h-16 w-16 text-amber-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">Хожигч тодорлоо!</p>
                </div>
                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Тасалбарын код</p>
                  <p className="text-2xl font-bold font-mono tracking-widest text-amber-700 mb-2">
                    {winner.ticket_code}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Утасны дугаар</p>
                  <p className="text-lg font-mono font-medium text-gray-900">{winner.winner_phone}</p>
                </div>
                <Button onClick={() => setOpen(false)} className="w-full" variant="outline">
                  Хаах
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
