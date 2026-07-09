"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface Props {
  lotteryId: string;
  lotteryName: string;
}

export default function DeleteLotteryButton({ lotteryId, lotteryName }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/lotteries/${lotteryId}`, { method: "DELETE" });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Алдаа гарлаа");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="h-3 w-3" />
        Устгах
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Сугалаа устгах уу?</DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-gray-900">{lotteryName}</span> сугалааг устгахад
              холбогдох бүх тасалбарууд мөн устана. Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Болих
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Устгаж байна..." : "Тийм, устга"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
