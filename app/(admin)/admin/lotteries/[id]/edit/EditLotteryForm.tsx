"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Lottery {
  id: string;
  car_name: string;
  car_brand: string;
  car_model: string;
  ticket_price: number;
  max_tickets: number;
  tickets_sold: number;
  end_date: string;
  draw_date: string;
  status: string;
  description: string;
  prize_value: number;
}

interface FormState {
  carName: string;
  carBrand: string;
  carModel: string;
  ticketPrice: string;
  maxTickets: string;
  endDate: string;
  drawDate: string;
  status: string;
  description: string;
  prizeValue: string;
}

export default function EditLotteryForm({ lottery }: { lottery: Lottery }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    carName: lottery.car_name,
    carBrand: lottery.car_brand,
    carModel: lottery.car_model,
    ticketPrice: String(lottery.ticket_price),
    maxTickets: String(lottery.max_tickets),
    endDate: lottery.end_date,
    drawDate: lottery.draw_date,
    status: lottery.status,
    description: lottery.description ?? "",
    prizeValue: String(lottery.prize_value ?? 0),
  });
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.carName.trim()) errs.carName = "Машины нэр оруулна уу";
    if (!form.ticketPrice || isNaN(Number(form.ticketPrice)) || Number(form.ticketPrice) <= 0)
      errs.ticketPrice = "Зөв үнэ оруулна уу";
    if (!form.maxTickets || isNaN(Number(form.maxTickets)) || Number(form.maxTickets) <= 0)
      errs.maxTickets = "Зөв тоо оруулна уу";
    if (!form.endDate) errs.endDate = "Огноо сонгоно уу";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    const res = await fetch(`/api/lotteries/${lottery.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        carName: form.carName,
        carBrand: form.carBrand,
        carModel: form.carModel,
        ticketPrice: form.ticketPrice,
        maxTickets: form.maxTickets,
        endDate: form.endDate,
        drawDate: form.drawDate,
        status: form.status,
        description: form.description,
        prizeValue: form.prizeValue,
      }),
    });
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setErrors({ carName: data.error ?? "Алдаа гарлаа" });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/lotteries/${lottery.id}`, { method: "DELETE" });
    router.push("/admin/lotteries");
    router.refresh();
  }

  if (success) {
    return (
      <Card>
        <CardContent className="p-8 flex flex-col items-center text-center gap-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Амжилттай хадгалагдлаа!</h2>
            <p className="text-gray-500 text-sm">{form.carName} сугалааны мэдээлэл шинэчлэгдлээ.</p>
          </div>
          <Button
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => router.push("/admin/lotteries")}
          >
            Жагсаалт руу буцах
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="carName">Машины нэр</Label>
              <Input
                id="carName"
                value={form.carName}
                onChange={set("carName")}
                className={errors.carName ? "border-red-400" : ""}
              />
              {errors.carName && <p className="text-red-500 text-xs">{errors.carName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="carBrand">Брэнд</Label>
                <Input id="carBrand" value={form.carBrand} onChange={set("carBrand")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="carModel">Модель</Label>
                <Input id="carModel" value={form.carModel} onChange={set("carModel")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ticketPrice">Тасалбарын үнэ (₮)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  inputMode="numeric"
                  value={form.ticketPrice}
                  onChange={set("ticketPrice")}
                  className={errors.ticketPrice ? "border-red-400" : ""}
                />
                {errors.ticketPrice && (
                  <p className="text-red-500 text-xs">{errors.ticketPrice}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="maxTickets">Нийт тасалбар</Label>
                <Input
                  id="maxTickets"
                  type="number"
                  inputMode="numeric"
                  value={form.maxTickets}
                  onChange={set("maxTickets")}
                  className={errors.maxTickets ? "border-red-400" : ""}
                />
                {errors.maxTickets && (
                  <p className="text-red-500 text-xs">{errors.maxTickets}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prizeValue">Шагналын үнэ цэнэ (₮)</Label>
              <Input
                id="prizeValue"
                type="number"
                inputMode="numeric"
                value={form.prizeValue}
                onChange={set("prizeValue")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Дуусах огноо</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={set("endDate")}
                  className={errors.endDate ? "border-red-400" : ""}
                />
                {errors.endDate && <p className="text-red-500 text-xs">{errors.endDate}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="drawDate">Сугалааны огноо</Label>
                <Input
                  id="drawDate"
                  type="date"
                  value={form.drawDate}
                  onChange={set("drawDate")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Төлөв</Label>
              <select
                id="status"
                value={form.status}
                onChange={set("status")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="active">Идэвхтэй</option>
                <option value="drawing">Шалгаруулж байна</option>
                <option value="ended">Дууссан</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Тайлбар</Label>
              <textarea
                id="description"
                value={form.description}
                onChange={set("description")}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/admin/lotteries")}
              >
                Цуцлах
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                disabled={loading}
              >
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
            </div>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              className="w-full text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Сугалаа устгах
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Сугалаа устгах уу?</DialogTitle>
            <DialogDescription>
              <strong>{form.carName}</strong> сугалааг устгавал буцаах боломжгүй. Бүх тасалбар ч
              устана.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteOpen(false)}>
              Цуцлах
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Устгаж байна..." : "Устгах"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
