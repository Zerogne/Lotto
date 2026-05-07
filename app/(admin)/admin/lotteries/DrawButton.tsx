"use client";

import { useState } from "react";
import { getTicketsByLottery } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Shuffle } from "lucide-react";

interface Props {
  lotteryId: string;
  lotteryName: string;
}

export default function DrawButton({ lotteryId, lotteryName }: Props) {
  const [open, setOpen] = useState(false);
  const [winner, setWinner] = useState<{ code: string; phone: string } | null>(null);
  const [drawing, setDrawing] = useState(false);

  function runDraw() {
    setDrawing(true);
    const tickets = getTicketsByLottery(lotteryId);
    setTimeout(() => {
      const picked = tickets[Math.floor(Math.random() * tickets.length)];
      setWinner({ code: picked.code, phone: picked.phone });
      setDrawing(false);
    }, 1500);
  }

  function handleOpen() {
    setWinner(null);
    setDrawing(false);
    setOpen(true);
  }

  return (
    <>
      <Button
        size="sm"
        className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
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
                    {winner.code}
                  </p>
                  <p className="text-xs text-gray-500 mb-1">Утасны дугаар</p>
                  <p className="text-lg font-mono font-medium text-gray-900">{winner.phone}</p>
                </div>
                <Button
                  onClick={() => setOpen(false)}
                  className="w-full"
                  variant="outline"
                >
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
